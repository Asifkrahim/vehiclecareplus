// Shared utils for Vercel API routes
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey && supabaseServiceKey !== 'YOUR_SERVICE_ROLE_KEY_HERE'
    ? supabaseServiceKey
    : supabaseAnonKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const createUserClient = (token) =>
  createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

const authenticate = async (req) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing or invalid authorization header');
    err.statusCode = 401;
    throw err;
  }
  const token = authHeader.split(' ')[1];
  const supabase = createUserClient(token);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    const err = new Error('Invalid or expired token');
    err.statusCode = 401;
    throw err;
  }
  return { user, token };
};

const cors = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
  return false;
};

module.exports = { supabaseAdmin, createUserClient, authenticate, cors };
