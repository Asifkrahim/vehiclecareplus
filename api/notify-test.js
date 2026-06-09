const { authenticate, cors } = require('./_utils/supabase');
const { sendVehicleAddedEmail } = require('./_utils/email');

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  let user;
  try {
    ({ user } = await authenticate(req));
  } catch (err) {
    return res.status(err.statusCode || 401).json({ error: err.message });
  }

  try {
    const testVehicle = {
      vehicle_no: 'TEST-001',
      model: 'Test Vehicle',
      vehicle_type: 'Car',
      current_km: 15000,
      next_service_km: 25000,
    };
    const result = await sendVehicleAddedEmail(user.email, testVehicle);
    if (result.success)
      return res.status(200).json({ message: `Test email sent to ${user.email}` });
    return res.status(500).json({ error: 'Failed to send test email' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
