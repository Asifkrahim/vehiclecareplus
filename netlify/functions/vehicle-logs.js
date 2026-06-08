const { authenticate } = require('./_utils/auth');
const { createUserClient } = require('./_utils/supabase');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.URL || '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Authenticate
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

  // Parse path: /api/vehicles/:vehicleId/logs  or  /api/vehicles/:vehicleId/logs/:logId
  const pathParts = event.path.replace(/^\/api\/vehicles\//, '').split('/').filter(Boolean);
  // pathParts[0] = vehicleId, pathParts[1] = 'logs', pathParts[2] = logId (optional)
  const vehicleId = pathParts[0];
  const logId = pathParts[2] || null;

  if (!vehicleId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Vehicle ID is required' }) };
  }

  try {
    // GET /api/vehicles/:id/logs
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('service_logs')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ logs: data }) };
    }

    // POST /api/vehicles/:id/logs
    if (event.httpMethod === 'POST') {
      const { service_type, km_at_service, notes } = JSON.parse(event.body || '{}');

      if (!service_type || !km_at_service) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Service type and KM are required' }) };
      }

      const { data, error } = await supabase
        .from('service_logs')
        .insert([{
          vehicle_id: vehicleId,
          user_id: user.id,
          service_type,
          km_at_service: parseInt(km_at_service),
          notes: notes || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return { statusCode: 201, headers, body: JSON.stringify({ log: data, message: 'Service log added' }) };
    }

    // DELETE /api/vehicles/:id/logs/:logId
    if (event.httpMethod === 'DELETE' && logId) {
      const { error } = await supabase
        .from('service_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Service log deleted' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (error) {
    console.error('Vehicle logs function error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
