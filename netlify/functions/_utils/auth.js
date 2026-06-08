const { createUserClient } = require('./supabase');

/**
 * Authenticate a Netlify Function event using Supabase JWT.
 * Returns { user, token } on success, or throws an error object
 * shaped like { statusCode, body } for easy return.
 */
const authenticate = async (event) => {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing or invalid authorization header');
    err.statusCode = 401;
    throw err;
  }

  const token = authHeader.split(' ')[1];

  try {
    const supabase = createUserClient(token);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      const err = new Error('Invalid or expired token');
      err.statusCode = 401;
      throw err;
    }

    return { user, token };
  } catch (err) {
    if (!err.statusCode) err.statusCode = 401;
    throw err;
  }
};

module.exports = { authenticate };
