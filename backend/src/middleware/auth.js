/**
 * Auth middleware — verifies Supabase JWT from Authorization header
 * Uses the user-scoped client (anon key + user JWT) so no service role key is needed
 */
const { createUserClient } = require('../services/supabaseAdmin');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Create a user-scoped Supabase client and validate the token
    const supabase = createUserClient(token);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
