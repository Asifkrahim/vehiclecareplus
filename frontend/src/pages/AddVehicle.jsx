import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI } from '../lib/api';
import SuccessAnimation from '../components/SuccessAnimation';
import { Hash, Gauge, ChevronLeft, Wrench, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback intervals in case API is down
const FALLBACK_INTERVALS = {
  Car: {
    'Oil Change': 10000,
    'Air Filter Replacement': 15000,
    'Tire Rotation': 8000,
    'Brake Inspection': 20000,
    'Coolant Flush': 40000,
    'Spark Plug Replacement': 30000,
    'Transmission Service': 50000,
    'Battery Check': 20000,
    'General Service': 10000,
  },
  Bike: {
    'Oil Change': 3000,
    'Air Filter Replacement': 6000,
    'Chain Lubrication': 1000,
    'Tire Check': 5000,
    'Brake Inspection': 8000,
    'Spark Plug Replacement': 10000,
    'Coolant Check': 6000,
    'General Service': 3000,
  },
};

export default function AddVehicle() {
  const navigate = useNavigate();
  const [intervals, setIntervals] = useState(FALLBACK_INTERVALS);
  const [form, setForm] = useState({
    vehicle_no: '',
    vehicle_type: 'Car',
    model: '',
    current_km: '',
    maintenance_type: 'Oil Change',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch intervals from backend
  useEffect(() => {
    axios.get(`${API_URL}/api/vehicles/intervals`)
      .then(res => setIntervals(res.data.intervals))
      .catch(() => {}); // silently use fallback
  }, []);

  // When vehicle type changes, reset maintenance type to first option of new type
  const handleTypeChange = (type) => {
    const firstOption = Object.keys(intervals[type] || {})[0] || '';
    setForm(prev => ({ ...prev, vehicle_type: type, maintenance_type: firstOption }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const maintenanceOptions = Object.entries(intervals[form.vehicle_type] || {});
  const selectedInterval = intervals[form.vehicle_type]?.[form.maintenance_type] || 0;
  const nextService = form.current_km && selectedInterval
    ? parseInt(form.current_km) + selectedInterval
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehicle_no || !form.model || !form.current_km || !form.maintenance_type) {
      return toast.error('Please fill in all fields');
    }
    if (isNaN(form.current_km) || parseInt(form.current_km) < 0) {
      return toast.error('Enter a valid KM reading');
    }

    setLoading(true);
    try {
      await vehicleAPI.add({ ...form, current_km: parseInt(form.current_km) });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2200);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add vehicle');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '100px 24px 48px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/dashboard')}
          className="btn-ghost"
          style={{ marginBottom: 24, color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={15} /> Back to Dashboard
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          {/* Page Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Register a Vehicle</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
              Fill in your vehicle details and select the service type to calculate the next maintenance interval.
            </p>
          </div>

          <div className="card" style={{ padding: 32, overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SuccessAnimation message="Vehicle Registered Successfully!" />
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>
                    Confirmation email sent · Redirecting to dashboard...
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: 22 }}
                >
                  {/* Vehicle Type Toggle */}
                  <div className="form-group">
                    <label className="form-label">Vehicle Type</label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                      background: 'var(--bg-input)',
                      borderRadius: 14,
                      padding: 5,
                    }}>
                      {['Car', 'Bike'].map(type => (
                        <motion.button
                          key={type}
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleTypeChange(type)}
                          style={{
                            padding: '12px 0',
                            borderRadius: 10,
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: 14,
                            fontWeight: 700,
                            transition: 'all 0.2s ease',
                            background: form.vehicle_type === type
                              ? 'var(--bg-card)'
                              : 'transparent',
                            color: form.vehicle_type === type
                              ? '#E63946'
                              : 'var(--text-muted)',
                            boxShadow: form.vehicle_type === type ? 'var(--shadow-card)' : 'none',
                          }}
                        >
                          {type}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Number */}
                  <div className="form-group">
                    <label className="form-label">Vehicle Registration Number</label>
                    <div style={{ position: 'relative' }}>
                      <Hash size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        name="vehicle_no"
                        className="form-input"
                        style={{ paddingLeft: 42, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        placeholder="e.g. KL-01-AB-1234"
                        value={form.vehicle_no}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Model */}
                  <div className="form-group">
                    <label className="form-label">Vehicle Model</label>
                    <div style={{ position: 'relative' }}>
                      <Settings size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        name="model"
                        className="form-input"
                        style={{ paddingLeft: 42 }}
                        placeholder="e.g. Honda Hornet 2.0, Toyota Innova"
                        value={form.model}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Current KM */}
                  <div className="form-group">
                    <label className="form-label">Current Odometer Reading (km)</label>
                    <div style={{ position: 'relative' }}>
                      <Gauge size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="number"
                        name="current_km"
                        className="form-input"
                        style={{ paddingLeft: 42 }}
                        placeholder="e.g. 15000"
                        value={form.current_km}
                        onChange={handleChange}
                        min={0}
                        required
                      />
                    </div>
                  </div>

                  {/* Maintenance Type */}
                  <div className="form-group">
                    <label className="form-label">Maintenance Type</label>
                    <div style={{ position: 'relative' }}>
                      <Wrench size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                      <select
                        name="maintenance_type"
                        className="form-select"
                        style={{ paddingLeft: 42 }}
                        value={form.maintenance_type}
                        onChange={handleChange}
                        required
                      >
                        {maintenanceOptions.map(([type, km]) => (
                          <option key={type} value={type}>
                            {type} — every {km.toLocaleString()} km
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Interval info badge */}
                    {selectedInterval > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          marginTop: 8,
                          padding: '8px 12px',
                          background: 'rgba(230,57,70,0.06)',
                          border: '1px solid rgba(230,57,70,0.15)',
                          borderRadius: 8,
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Wrench size={11} style={{ color: '#E63946' }} />
                        <span>
                          <strong style={{ color: 'var(--text-primary)' }}>{form.maintenance_type}</strong>
                          {' '}is recommended every{' '}
                          <strong style={{ color: '#E63946' }}>{selectedInterval.toLocaleString()} km</strong>
                          {' '}for a {form.vehicle_type}.
                        </span>
                      </motion.div>
                    )}
                  </div>

                  {/* Next Service Preview */}
                  <AnimatePresence>
                    {nextService && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          background: 'linear-gradient(135deg, rgba(230,57,70,0.05), rgba(255,214,10,0.05))',
                          border: '1px solid rgba(255,214,10,0.25)',
                          borderRadius: 14,
                          padding: '16px 18px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                            Next service due at
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#FFD60A' }}>
                            {nextService.toLocaleString()} km
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                            Service interval
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)' }}>
                            +{selectedInterval.toLocaleString()} km
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, marginTop: 4 }}
                  >
                    {loading ? (
                      <><div className="spinner" style={{ width: 16, height: 16 }} /> Registering Vehicle...</>
                    ) : (
                      'Register Vehicle'
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
