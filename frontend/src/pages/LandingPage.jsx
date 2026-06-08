import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Bell, Bot, Wrench, Zap, Car, Bike, ChevronRight, Star } from 'lucide-react';

const features = [
  {
    icon: <Car size={24} />,
    title: 'Smart Vehicle Tracking',
    desc: 'Track multiple cars and bikes with precise service interval calculations tailored to each vehicle type.',
    color: '#E63946',
  },
  {
    icon: <Bell size={24} />,
    title: 'Email Reminders',
    desc: 'Automated email alerts when your vehicle approaches its next service milestone. Never miss a service again.',
    color: '#FFD60A',
  },
  {
    icon: <Bot size={24} />,
    title: 'AI Assistant',
    desc: 'Powered by Google Gemini AI — get instant answers to any automotive question, troubleshoot issues, and get DIY advice.',
    color: '#E63946',
  },
  {
    icon: <Wrench size={24} />,
    title: 'DIY Resource Finder',
    desc: 'One-click access to vehicle-specific DIY tutorials and how-to guides from across the web.',
    color: '#FFD60A',
  },
  {
    icon: <Shield size={24} />,
    title: 'Secure & Private',
    desc: 'Your data is protected with Supabase Row Level Security — only you can see your vehicles.',
    color: '#E63946',
  },
  {
    icon: <Zap size={24} />,
    title: 'Service History Logs',
    desc: 'Keep a complete history of all service events for each vehicle in one organized place.',
    color: '#FFD60A',
  },
];

const stats = [
  { value: '9 Types', label: 'Car maintenance options' },
  { value: '8 Types', label: 'Bike maintenance options' },
  { value: 'Gemini AI', label: 'Smart assistance' },
  { value: '100%', label: 'Secure & private' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: 64 }}>
      {/* Hero Section */}
      <section
        className="hero-bg"
        style={{ padding: '80px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
      >
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(230,57,70,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(230,57,70,0.1)',
              border: '1px solid rgba(230,57,70,0.3)',
              color: '#E63946',
              borderRadius: 100,
              padding: '6px 16px',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 24,
              letterSpacing: '0.05em',
            }}>
              <Star size={12} fill="#E63946" /> AI-Powered Vehicle Maintenance
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24 }}
          >
            Keep Your Vehicle{' '}
            <span className="gradient-text">Perfectly</span>{' '}
            Maintained
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}
          >
            Track service intervals, get AI-powered advice, receive automated reminders,
            and access DIY resources — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/login" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
              Get Started Free <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary" style={{ fontSize: 16, padding: '14px 32px' }}>
              Sign In
            </Link>
          </motion.div>
        </div>

        {/* Floating vehicle illustrations — removed for clean look */}
      </section>

      {/* Stats Bar */}
      <section style={{
        background: 'linear-gradient(135deg, #E63946, #c0392b)',
        padding: '32px 24px',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 24,
        }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: 28, fontWeight: 900, color: '#FFD60A' }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: 16 }}>
            Everything You Need to{' '}
            <span className="gradient-text">Stay Ahead</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
            A complete suite of tools for modern vehicle owners.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="card"
              style={{ padding: 28 }}
            >
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `${feature.color}20`,
                border: `1px solid ${feature.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: feature.color,
                marginBottom: 16,
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{feature.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{
            maxWidth: 640,
            margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(230,57,70,0.08), rgba(255,214,10,0.08))',
            border: '1px solid rgba(230,57,70,0.2)',
            borderRadius: 24,
            padding: '56px 40px',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 16, opacity: 0.8 }}>
            <Wrench size={40} style={{ color: '#E63946', display: 'inline' }} />
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            Ready to Take Control?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 32 }}>
            Join and start tracking your vehicles today. It's free.
          </p>
          <Link to="/login" className="btn-primary" style={{ fontSize: 16, padding: '14px 40px' }}>
            Start for Free <ChevronRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
      }}>
        <p style={{ color: '#555', fontSize: 12, margin: 0 }}>© 2026 VehicleCare+ · Your vehicle health, simplified.</p>
      </footer>
    </div>
  );
}
