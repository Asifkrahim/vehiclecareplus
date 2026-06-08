import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAPI } from '../lib/api';
import { Send, Bot, RotateCcw, Sparkles } from 'lucide-react';

const WELCOME_MESSAGE = {
  role: 'model',
  content: `👋 Hi! I'm your **VehicleCare+ AI Assistant** powered by Google Gemini.

I can help you with:
• 🔧 Vehicle maintenance schedules
• 🚨 Troubleshooting warning lights
• 💧 Oil, coolant & fluid guidance
• 🛞 Tires, brakes & safety checks
• 🔩 DIY repair tips

What's on your mind about your vehicle?`,
};

export default function AIChatbot() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const formatMessage = (text) => {
    // Basic markdown: bold, bullet points, line breaks
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^• /gm, '&bull; ')
      .split('\n')
      .map((line, i) => `<span key="${i}">${line}</span>`)
      .join('<br/>');
  };

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.role !== 'model' || m !== WELCOME_MESSAGE)
        .map(m => ({ role: m.role, content: m.content }));

      const { data } = await aiAPI.chat(msg, history);
      setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'model',
        content: err.response?.data?.reply || '⚠️ Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
    inputRef.current?.focus();
  };

  const quickPrompts = [
    'When should I change my engine oil?',
    'My check engine light is on, what should I do?',
    'How do I check tire pressure?',
    'What is a service interval?',
  ];

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: 64,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        flex: 1,
        maxWidth: 800,
        width: '100%',
        margin: '0 auto',
        padding: '24px 24px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 0 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #E63946, #FFD60A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bot size={22} color="#0D0D0D" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>AI Assistant</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse-badge 2s infinite' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Powered by Gemini AI</span>
              </div>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            className="btn-ghost"
            title="New conversation"
          >
            <RotateCcw size={15} /> New Chat
          </motion.button>
        </motion.div>

        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            paddingBottom: 16,
            minHeight: 300,
            maxHeight: 'calc(100vh - 280px)',
          }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Avatar */}
                {msg.role === 'model' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #E63946, #FFD60A)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Sparkles size={12} color="#0D0D0D" />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>VehicleCare+ AI</span>
                  </div>
                )}

                <div
                  className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #E63946, #FFD60A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Sparkles size={12} color="#0D0D0D" />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Thinking...</span>
              </div>
              <div className="chat-bubble-ai typing-indicator" style={{ padding: '14px 18px' }}>
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts — show only at start */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 12 }}
          >
            {quickPrompts.map((prompt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 100,
                  padding: '7px 14px',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
              >
                {prompt}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Input Area */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          background: 'var(--bg-primary)',
          paddingBottom: 24,
          paddingTop: 8,
        }}>
          <div style={{
            display: 'flex',
            gap: 10,
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: 16,
            padding: '8px 8px 8px 16px',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={() => {}}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about maintenance, troubleshooting, oil changes..."
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 14,
                color: 'var(--text-primary)',
                padding: '6px 0',
                lineHeight: 1.5,
              }}
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #E63946, #c0392b)'
                  : 'var(--bg-input)',
                border: 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: input.trim() && !loading ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                alignSelf: 'flex-end',
              }}
            >
              <Send size={16} />
            </motion.button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
