import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { vehicleAPI } from '../lib/api';
import { ChevronLeft, Trash2, Plus, Wrench, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const getDIYUrl = (model, serviceType) => {
  const query = encodeURIComponent(`how to do ${serviceType} ${model} DIY video`);
  return `https://www.google.com/search?q=${query}`;
};

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ service_type: 'Oil Change', km_at_service: '', notes: '' });
  const [addingLog, setAddingLog] = useState(false);

  const serviceTypes = ['Oil Change', 'Tire Rotation', 'Brake Check', 'Air Filter', 'Battery Check', 'General Service', 'Other'];

  useEffect(() => {
    const load = async () => {
      try {
        const [vRes, lRes] = await Promise.all([
          vehicleAPI.getAll(),
          vehicleAPI.getLogs(id),
        ]);
        const found = (vRes.data.vehicles || []).find(v => v.id === id);
        if (!found) { navigate('/dashboard'); return; }
        setVehicle(found);
        setLogs(lRes.data.logs || []);
      } catch {
        toast.error('Failed to load vehicle');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!logForm.km_at_service) return toast.error('KM at service is required');
    setAddingLog(true);
    try {
      const { data } = await vehicleAPI.addLog(id, logForm);
      setLogs(prev => [data.log, ...prev]);
      toast.success('Service log added!');
      setShowLogForm(false);
      setLogForm({ service_type: 'Oil Change', km_at_service: '', notes: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add log');
    } finally {
      setAddingLog(false);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('Delete this service log?')) return;
    try {
      await vehicleAPI.deleteLog(id, logId);
      setLogs(prev => prev.filter(l => l.id !== logId));
      toast.success('Log deleted');
    } catch {
      toast.error('Failed to delete log');
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
    </div>
  );

  if (!vehicle) return null;

  const remaining = vehicle.next_service_km - vehicle.current_km;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, background: 'var(--bg-primary)', padding: '100px 24px 48px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/dashboard')}
          className="btn-ghost"
          style={{ marginBottom: 24, color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </motion.button>

        {/* Vehicle Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{
            padding: 28,
            marginBottom: 24,
            background: 'linear-gradient(135deg, rgba(230,57,70,0.05), rgba(255,214,10,0.05))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 32 }}>{vehicle.vehicle_type === 'Car' ? '🚗' : '🏍️'}</span>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{vehicle.model}</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>{vehicle.vehicle_no} · {vehicle.vehicle_type}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{vehicle.current_km.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT KM</div>
                </div>
                <div style={{ width: 1, background: 'var(--border-color)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#FFD60A' }}>{vehicle.next_service_km.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>NEXT SERVICE</div>
                </div>
                <div style={{ width: 1, background: 'var(--border-color)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: remaining <= 500 ? '#E63946' : 'var(--text-primary)' }}>
                    {remaining > 0 ? remaining.toLocaleString() : 'OVERDUE'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>KM REMAINING</div>
                </div>
              </div>
            </div>

            {/* DIY Button */}
            <a
              href={getDIYUrl(vehicle.model, 'oil change')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-yellow"
              style={{ fontSize: 14 }}
            >
              <Wrench size={15} /> DIY Help
            </a>
          </div>
        </motion.div>

        {/* Service Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card"
          style={{ padding: 28 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              <Clock size={18} style={{ verticalAlign: 'middle', marginRight: 8, color: '#E63946' }} />
              Service History
            </h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLogForm(!showLogForm)}
              className="btn-primary"
              style={{ fontSize: 13, padding: '8px 16px' }}
            >
              <Plus size={14} /> Log Service
            </motion.button>
          </div>

          {/* Add Log Form */}
          <AnimatePresence>
            {showLogForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddLog}
                style={{
                  background: 'var(--bg-input)',
                  borderRadius: 14,
                  padding: 20,
                  marginBottom: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Service Type</label>
                    <select
                      className="form-select"
                      value={logForm.service_type}
                      onChange={e => setLogForm(p => ({ ...p, service_type: e.target.value }))}
                    >
                      {serviceTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">KM at Service</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder={`e.g. ${vehicle.current_km}`}
                      value={logForm.km_at_service}
                      onChange={e => setLogForm(p => ({ ...p, km_at_service: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Used Castrol 10W-30 oil"
                    value={logForm.notes}
                    onChange={e => setLogForm(p => ({ ...p, notes: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn-primary" disabled={addingLog} style={{ flex: 1, justifyContent: 'center' }}>
                    {addingLog ? <div className="spinner" style={{ width: 14, height: 14 }} /> : '✓ Add Log'}
                  </button>
                  <button type="button" onClick={() => setShowLogForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Logs List */}
          {logs.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">📋</span>
              <p className="empty-state-title">No service logs yet</p>
              <p className="empty-state-subtitle">Log your first service to build a maintenance history.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {logs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: 'var(--bg-input)',
                    borderRadius: 12,
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{log.service_type}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {log.km_at_service.toLocaleString()} km · {new Date(log.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    {log.notes && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{log.notes}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <a
                      href={getDIYUrl(vehicle.model, log.service_type)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-yellow"
                      style={{ fontSize: 11, padding: '6px 10px' }}
                    >
                      <Wrench size={11} /> DIY
                    </a>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="btn-ghost"
                      style={{ color: '#E63946', padding: '6px 8px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
