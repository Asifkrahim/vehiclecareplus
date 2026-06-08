const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Admin client — uses service role key if available, anon key otherwise
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey && supabaseServiceKey !== 'YOUR_SERVICE_ROLE_KEY_HERE'
    ? supabaseServiceKey
    : supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Create a user-scoped Supabase client.
 * Passes the user's JWT as Authorization header so RLS policies apply correctly.
 */
const createUserClient = (token) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

module.exports = { supabaseAdmin, createUserClient };
