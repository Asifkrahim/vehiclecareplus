const { authenticate } = require('./_utils/auth');
const { sendVehicleAddedEmail } = require('./_utils/email');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.URL || '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Authenticate
  let user;
  try {
    ({ user } = await authenticate(event));
  } catch (err) {
    return {
      statusCode: err.statusCode || 401,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
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
    if (result.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: `Test email sent to ${user.email}` }),
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to send test email', details: result.error }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
