const { authenticate, cors, createUserClient } = require('./_utils/supabase');

module.exports = async (req, res) => {
  if (cors(req, res)) return;

  let user, token;
  try {
    ({ user, token } = await authenticate(req));
  } catch (err) {
    return res.status(err.statusCode || 401).json({ error: err.message });
  }

  const supabase = createUserClient(token);

  // /api/vehicles/:id/logs  or  /api/vehicles/:id/logs/:logId
  // Vercel passes these as query params via vercel.json rewrites
  const vehicleId = req.query.id;
  const logId = req.query.logId || null;

  if (!vehicleId)
    return res.status(400).json({ error: 'Vehicle ID is required' });

  try {
    // GET — list logs for a vehicle
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('service_logs')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ logs: data });
    }

    // POST — add a service log
    if (req.method === 'POST') {
      const { service_type, km_at_service, notes } = req.body || {};
      if (!service_type || !km_at_service)
        return res.status(400).json({ error: 'Service type and KM are required' });

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
      return res.status(201).json({ log: data, message: 'Service log added' });
    }

    // DELETE — delete a specific log
    if (req.method === 'DELETE' && logId) {
      const { error } = await supabase
        .from('service_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ message: 'Service log deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Vehicle logs error:', error);
    return res.status(500).json({ error: error.message });
  }
};
