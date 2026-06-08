import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AddVehicle from './pages/AddVehicle';
import VehicleDetail from './pages/VehicleDetail';
import AIChatbot from './pages/AIChatbot';

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/vehicle/add" element={
          <ProtectedRoute><AddVehicle /></ProtectedRoute>
        } />
        <Route path="/vehicle/:id" element={
          <ProtectedRoute><VehicleDetail /></ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute><AIChatbot /></ProtectedRoute>
        } />
        <Route path="*" element={
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🚗💨</div>
              <h1 style={{ fontSize: 24, fontWeight: 800 }}>Page Not Found</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>That route doesn't exist.</p>
              <a href="/dashboard" className="btn-primary">Back to Dashboard</a>
            </div>
          </div>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '14px',
                borderRadius: '12px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#E63946', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
