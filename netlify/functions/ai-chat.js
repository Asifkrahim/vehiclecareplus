const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are VehicleCare+ AI Assistant, an expert automotive advisor. You help users with:
- Vehicle maintenance schedules and best practices
- Troubleshooting common car and motorcycle issues
- Oil change guidance and fluid maintenance
- Understanding warning lights and dashboard indicators
- DIY repair advice for common issues
- Safety tips and preventive maintenance

Keep responses helpful, clear, and practical. When recommending professional service, be specific about what to tell the mechanic. 
Format your responses with proper line breaks for readability. Use emojis sparingly to make responses friendly.
If asked about something not related to vehicles or automotive topics, politely redirect to vehicle-related questions.`;

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

  try {
    const { message, history = [] } = JSON.parse(event.body || '{}');

    if (!message || message.trim() === '') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message is required' }) };
    }

    if (message.length > 1000) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message too long (max 1000 characters)' }) };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build chat history
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'Please act as described in my next message.' }],
        },
        {
          role: 'model',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        ...chatHistory,
      ],
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: response, timestamp: new Date().toISOString() }),
    };

  } catch (error) {
    console.error('AI chat error:', error);

    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Too Many Requests')) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: 'Rate limit reached',
          reply: '⏳ The AI is receiving too many requests right now. Please wait about 30–60 seconds and try again.',
        }),
      };
    }

    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          error: 'AI service unavailable',
          reply: '⚠️ The AI assistant is currently unavailable due to an API configuration issue.',
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'AI service error',
        reply: '⚠️ Sorry, I encountered an error. Please try again in a moment.',
      }),
    };
  }
};
