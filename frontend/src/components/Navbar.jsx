import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Car, MessageSquare, LayoutDashboard, LogOut, Plus, Menu, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Signed out successfully');
    } catch {
      toast.error('Sign out failed');
    }
  };

  const navLinks = user
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
        { to: '/vehicle/add', label: 'Add Vehicle', icon: <Plus size={16} /> },
        { to: '/chat', label: 'AI Assistant', icon: <MessageSquare size={16} /> },
      ]
    : [];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #E63946, #FFD60A)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Car size={20} color="#0D0D0D" />
          </motion.div>
          <span style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800,
            fontSize: 20,
            color: 'var(--text-primary)',
          }}>
            Vehicle<span style={{ color: '#E63946' }}>Care</span><span style={{ color: '#FFD60A' }}>+</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hide-mobile">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'Outfit, sans-serif',
                color: isActive(link.to) ? '#E63946' : 'var(--text-secondary)',
                background: isActive(link.to) ? 'rgba(230,57,70,0.1)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: '1.5px solid var(--border-color)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </motion.button>

          {user ? (
            <>
              <div className="hide-mobile" style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                maxWidth: 160,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.email}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="btn-ghost"
                style={{ color: '#E63946' }}
              >
                <LogOut size={15} />
                <span className="hide-mobile">Sign Out</span>
              </motion.button>
            </>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '8px 18px', fontSize: 14 }}>
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          {user && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn-ghost"
              style={{ display: 'none' }}
              id="mobile-menu-btn"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && user && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            borderTop: '1px solid var(--border-color)',
            padding: '12px 24px 16px',
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 0',
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 600,
                color: isActive(link.to) ? '#E63946' : 'var(--text-primary)',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
}
