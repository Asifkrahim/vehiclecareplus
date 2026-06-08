const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

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

/**
 * POST /api/ai/chat
 * Send a message to Gemini AI and get a response
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message too long (max 1000 characters)' });
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

    res.json({ 
      reply: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI chat error:', error);

    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Too Many Requests')) {
      return res.status(429).json({
        error: 'Rate limit reached',
        reply: '⏳ The AI is receiving too many requests right now. Please wait about 30–60 seconds and try again.',
      });
    }

    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      return res.status(503).json({
        error: 'AI service unavailable',
        reply: '⚠️ The AI assistant is currently unavailable due to an API configuration issue. Please check the Gemini API key.',
      });
    }

    res.status(500).json({
      error: 'AI service error',
      reply: '⚠️ Sorry, I encountered an error. Please try again in a moment.',
    });
  }
});

module.exports = router;
