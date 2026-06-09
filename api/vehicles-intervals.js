const { SERVICE_INTERVALS } = require('./_utils/serviceCalculator');
const { cors } = require('./_utils/supabase');

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });
  return res.status(200).json({ intervals: SERVICE_INTERVALS });
};
