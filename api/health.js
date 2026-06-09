const { cors } = require('./_utils/supabase');

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  return res.status(200).json({ status: 'ok', service: 'VehicleCare+ API', timestamp: new Date().toISOString() });
};
