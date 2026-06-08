const { SERVICE_INTERVALS } = require('./_utils/serviceCalculator');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intervals: SERVICE_INTERVALS }),
  };
};
