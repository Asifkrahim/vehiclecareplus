import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #E63946, #FFD60A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse-badge 1.5s ease-in-out infinite',
        }}>
          <span style={{ fontSize: 24 }}>🚗</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading VehicleCare+...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
