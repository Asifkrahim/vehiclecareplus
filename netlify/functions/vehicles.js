const { authenticate } = require('./_utils/auth');
const { createUserClient } = require('./_utils/supabase');
const { getNextServiceKm, isApproachingService, SERVICE_INTERVALS } = require('./_utils/serviceCalculator');
const { sendVehicleAddedEmail, sendServiceReminderEmail } = require('./_utils/email');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.URL || '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Authenticate all requests
  let user, token;
  try {
    ({ user, token } = await authenticate(event));
  } catch (err) {
    return {
      statusCode: err.statusCode || 401,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }

  const supabase = createUserClient(token);

  // Parse path to extract optional :id
  // Path examples: /api/vehicles  or  /api/vehicles/uuid-here
  const pathParts = event.path.replace(/^\/api\/vehicles\/?/, '').split('/').filter(Boolean);
  const vehicleId = pathParts[0] || null;

  try {
    // GET /api/vehicles — list all vehicles
    if (event.httpMethod === 'GET' && !vehicleId) {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ vehicles: data }) };
    }

    // POST /api/vehicles — add vehicle
    if (event.httpMethod === 'POST' && !vehicleId) {
      const { vehicle_no, vehicle_type, model, current_km, maintenance_type } = JSON.parse(event.body || '{}');

      if (!vehicle_no || !vehicle_type || !model || current_km === undefined || !maintenance_type) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'All fields are required including maintenance type' }) };
      }
      if (!['Car', 'Bike'].includes(vehicle_type)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Vehicle type must be Car or Bike' }) };
      }
      if (isNaN(current_km) || current_km < 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid KM reading' }) };
      }
      if (!SERVICE_INTERVALS[vehicle_type]?.[maintenance_type]) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: `Invalid maintenance type for ${vehicle_type}` }) };
      }

      const next_service_km = getNextServiceKm(vehicle_type, parseInt(current_km), maintenance_type);

      // Upsert profile
      await supabase
        .from('profiles')
        .upsert({ id: user.id, email: user.email }, { onConflict: 'id' });

      const { data, error } = await supabase
        .from('vehicles')
        .insert([{
          user_id: user.id,
          vehicle_no: vehicle_no.trim().toUpperCase(),
          vehicle_type,
          model: model.trim(),
          maintenance_type,
          current_km: parseInt(current_km),
          next_service_km,
        }])
        .select()
        .single();

      if (error) throw error;

      // Send confirmation email (non-blocking)
      sendVehicleAddedEmail(user.email, data).catch(console.error);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ vehicle: data, message: 'Vehicle added successfully! Confirmation email sent.' }),
      };
    }

    // PUT /api/vehicles/:id — update KM
    if (event.httpMethod === 'PUT' && vehicleId) {
      const { current_km } = JSON.parse(event.body || '{}');

      if (current_km === undefined || isNaN(current_km) || current_km < 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid KM reading is required' }) };
      }

      const { data: existing, error: fetchError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !existing) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Vehicle not found' }) };
      }

      if (parseInt(current_km) < existing.current_km) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'New KM reading cannot be less than current reading' }) };
      }

      const { data, error } = await supabase
        .from('vehicles')
        .update({ current_km: parseInt(current_km) })
        .eq('id', vehicleId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const reminderSent = isApproachingService(parseInt(current_km), existing.next_service_km);
      if (reminderSent) {
        sendServiceReminderEmail(user.email, data).catch(console.error);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ vehicle: data, message: 'KM reading updated successfully', reminderSent }),
      };
    }

    // DELETE /api/vehicles/:id — delete vehicle
    if (event.httpMethod === 'DELETE' && vehicleId) {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Vehicle deleted successfully' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (error) {
    console.error('Vehicles function error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
