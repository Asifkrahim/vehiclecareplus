const { authenticate, cors, createUserClient } = require('./_utils/supabase');
const { getNextServiceKm, isApproachingService, SERVICE_INTERVALS } = require('./_utils/serviceCalculator');
const { sendVehicleAddedEmail, sendServiceReminderEmail } = require('./_utils/email');

module.exports = async (req, res) => {
  if (cors(req, res)) return;

  // Authenticate
  let user, token;
  try {
    ({ user, token } = await authenticate(req));
  } catch (err) {
    return res.status(err.statusCode || 401).json({ error: err.message });
  }

  const supabase = createUserClient(token);

  // Extract vehicle ID from query params (Vercel passes path segments as query)
  const vehicleId = req.query.id || null;

  try {
    // GET /api/vehicles — list all
    if (req.method === 'GET' && !vehicleId) {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ vehicles: data });
    }

    // GET /api/vehicles/:id — single vehicle
    if (req.method === 'GET' && vehicleId) {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return res.status(200).json({ vehicle: data });
    }

    // POST /api/vehicles — add vehicle
    if (req.method === 'POST' && !vehicleId) {
      const { vehicle_no, vehicle_type, model, current_km, maintenance_type } = req.body || {};

      if (!vehicle_no || !vehicle_type || !model || current_km === undefined || !maintenance_type)
        return res.status(400).json({ error: 'All fields are required including maintenance type' });
      if (!['Car', 'Bike'].includes(vehicle_type))
        return res.status(400).json({ error: 'Vehicle type must be Car or Bike' });
      if (isNaN(current_km) || current_km < 0)
        return res.status(400).json({ error: 'Invalid KM reading' });
      if (!SERVICE_INTERVALS[vehicle_type]?.[maintenance_type])
        return res.status(400).json({ error: `Invalid maintenance type for ${vehicle_type}` });

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
      sendVehicleAddedEmail(user.email, data).catch(console.error);
      return res.status(201).json({ vehicle: data, message: 'Vehicle added successfully! Confirmation email sent.' });
    }

    // PUT /api/vehicles/:id — update KM
    if (req.method === 'PUT' && vehicleId) {
      const { current_km } = req.body || {};
      if (current_km === undefined || isNaN(current_km) || current_km < 0)
        return res.status(400).json({ error: 'Valid KM reading is required' });

      const { data: existing, error: fetchError } = await supabase
        .from('vehicles').select('*').eq('id', vehicleId).eq('user_id', user.id).single();
      if (fetchError || !existing)
        return res.status(404).json({ error: 'Vehicle not found' });
      if (parseInt(current_km) < existing.current_km)
        return res.status(400).json({ error: 'New KM reading cannot be less than current reading' });

      const { data, error } = await supabase
        .from('vehicles')
        .update({ current_km: parseInt(current_km) })
        .eq('id', vehicleId).eq('user_id', user.id)
        .select().single();
      if (error) throw error;

      const reminderSent = isApproachingService(parseInt(current_km), existing.next_service_km);
      if (reminderSent) sendServiceReminderEmail(user.email, data).catch(console.error);
      return res.status(200).json({ vehicle: data, message: 'KM reading updated successfully', reminderSent });
    }

    // DELETE /api/vehicles/:id
    if (req.method === 'DELETE' && vehicleId) {
      const { error } = await supabase
        .from('vehicles').delete().eq('id', vehicleId).eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ message: 'Vehicle deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Vehicles error:', error);
    return res.status(500).json({ error: error.message });
  }
};
