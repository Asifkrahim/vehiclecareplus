import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Car } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      if (tab === 'login') {
        await signIn(email, password);
        toast.success('Welcome back! 👋');
        navigate('/dashboard');
      } else {
        await signUp(email, password);
        toast.success('Account created! Check your email to confirm.', { duration: 5000 });
        setTab('login');
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px 24px',
      background: 'var(--bg-primary)',
      position: 'relative',
    }}>
      {/* Background gradient blobs */}
      <div style={{
        position: 'fixed',
        top: '20%',
        left: '10%',
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '20%',
        right: '10%',
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(255,214,10,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        borderRadius: '50%',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'inline-flex', marginBottom: 12 }}
          >
            <div style={{
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, #E63946, #FFD60A)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Car size={28} color="#0D0D0D" />
            </div>
          </motion.div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
            Vehicle<span style={{ color: '#E63946' }}>Care</span><span style={{ color: '#FFD60A' }}>+</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            {tab === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account — it\'s free.'}
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Tab Switcher */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-input)',
            borderRadius: 12,
            padding: 4,
            marginBottom: 28,
          }}>
            {['login', 'register'].map(t => (
              <motion.button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '10px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                  background: tab === t ? 'var(--bg-card)' : 'transparent',
                  color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: tab === t ? 'var(--shadow-card)' : 'none',
                }}
                whileTap={{ scale: 0.98 }}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={tab}
              initial={{ opacity: 0, x: tab === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
            >
              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: 42 }}
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: 42, paddingRight: 42 }}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {tab === 'register' && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Minimum 6 characters</p>
                )}
              </div>

              <motion.button
                type="submit"
                className="btn-primary"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, marginTop: 4 }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16 }} />
                    {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  tab === 'login' ? 'Sign In' : 'Create Account'
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          {/* Switch link */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: '#E63946', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
            >
              {tab === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
