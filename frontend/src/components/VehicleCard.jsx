import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2, RefreshCw, ExternalLink, Wrench, AlertTriangle } from 'lucide-react';
import { vehicleAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

const getDIYUrl = (model, serviceType = 'oil change') => {
  const query = encodeURIComponent(`how to do ${serviceType} ${model} DIY`);
  return `https://www.google.com/search?q=${query}`;
};

const getProgressColor = (pct) => {
  if (pct < 50) return 'progress-low';
  if (pct < 80) return 'progress-medium';
  return 'progress-high';
};

const SERVICE_INTERVALS = {
  Car: { 'Oil Change': 10000, 'Air Filter Replacement': 15000, 'Tire Rotation': 8000, 'Brake Inspection': 20000, 'Coolant Flush': 40000, 'Spark Plug Replacement': 30000, 'Transmission Service': 50000, 'Battery Check': 20000, 'General Service': 10000 },
  Bike: { 'Oil Change': 3000, 'Air Filter Replacement': 6000, 'Chain Lubrication': 1000, 'Tire Check': 5000, 'Brake Inspection': 8000, 'Spark Plug Replacement': 10000, 'Coolant Check': 6000, 'General Service': 3000 },
};

const getServiceProgress = (currentKm, nextServiceKm, vehicleType, maintenanceType) => {
  const interval = SERVICE_INTERVALS[vehicleType]?.[maintenanceType]
    || (vehicleType === 'Car' ? 10000 : 3000);
  const startKm = nextServiceKm - interval;
  const driven = currentKm - startKm;
  return Math.min(Math.max((driven / interval) * 100, 0), 100);
};

export default function VehicleCard({ vehicle, onDelete, onUpdate, index }) {
  const { id, vehicle_no, vehicle_type, model, current_km, next_service_km, maintenance_type } = vehicle;
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [showKmUpdate, setShowKmUpdate] = useState(false);
  const [newKm, setNewKm] = useState('');
  const [updating, setUpdating] = useState(false);

  const progress = getServiceProgress(current_km, next_service_km, vehicle_type, maintenance_type);
  const remaining = next_service_km - current_km;
  const isWarning = remaining <= 500 && remaining > 0;
  const isOverdue = remaining <= 0;

  const handleDelete = async () => {
    if (!window.confirm(`Remove ${model} (${vehicle_no}) from your garage?`)) return;
    setDeleting(true);
    try {
      await vehicleAPI.delete(id);
      toast.success(`${model} removed`);
      onDelete(id);
    } catch {
      toast.error('Failed to delete vehicle');
    } finally {
      setDeleting(false);
    }
  };

  const handleKmUpdate = async (e) => {
    e.preventDefault();
    if (!newKm || isNaN(newKm)) return toast.error('Enter a valid KM reading');
    if (parseInt(newKm) < current_km) return toast.error('New KM cannot be less than current KM');

    setUpdating(true);
    try {
      const { data } = await vehicleAPI.updateKm(id, parseInt(newKm));
      toast.success('Odometer updated');
      if (data.reminderSent) toast('Service reminder email sent', { icon: '⚠️' });
      onUpdate(id, data.vehicle);
      setShowKmUpdate(false);
      setNewKm('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className="card"
      style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <span className={`badge badge-${vehicle_type.toLowerCase()}`}>{vehicle_type}</span>
            {isWarning && (
              <span className="badge badge-warning">
                <AlertTriangle size={10} /> Service Due
              </span>
            )}
            {isOverdue && (
              <span className="badge" style={{ background: 'rgba(230,57,70,0.15)', color: '#E63946', border: '1px solid rgba(230,57,70,0.3)' }}>
                Overdue
              </span>
            )}
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {model}
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>{vehicle_no}</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDelete}
          disabled={deleting}
          className="btn-ghost"
          style={{ color: '#E63946', padding: '6px 8px', flexShrink: 0 }}
        >
          {deleting
            ? <div className="spinner spinner-dark" style={{ width: 14, height: 14 }} />
            : <Trash2 size={15} />}
        </motion.button>
      </div>

      {/* Maintenance type label */}
      {maintenance_type && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          background: 'var(--bg-input)',
          borderRadius: 8,
          width: 'fit-content',
        }}>
          <Wrench size={12} style={{ color: '#E63946', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{maintenance_type}</span>
        </div>
      )}

      {/* KM Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: 'var(--bg-input)', borderRadius: 10, padding: '11px 13px' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Current</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)' }}>{current_km.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>km</span></div>
        </div>
        <div style={{
          background: isOverdue ? 'rgba(230,57,70,0.07)' : isWarning ? 'rgba(255,140,0,0.07)' : 'rgba(255,214,10,0.07)',
          borderRadius: 10,
          padding: '11px 13px',
          border: `1px solid ${isOverdue ? 'rgba(230,57,70,0.18)' : isWarning ? 'rgba(255,140,0,0.18)' : 'rgba(255,214,10,0.18)'}`,
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Next Service</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: isOverdue ? '#E63946' : isWarning ? '#FF8C00' : '#FFD60A' }}>
            {next_service_km.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500 }}>km</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Interval Progress</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: isOverdue ? '#E63946' : isWarning ? '#FF8C00' : 'var(--text-muted)' }}>
            {isOverdue ? 'OVERDUE' : `${remaining.toLocaleString()} km remaining`}
          </span>
        </div>
        <div className="progress-bar-track">
          <motion.div
            className={`progress-bar-fill ${getProgressColor(progress)}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
          />
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{Math.round(progress)}% of service interval</div>
      </div>

      {/* Inline KM Update */}
      {showKmUpdate && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleKmUpdate}
          style={{ display: 'flex', gap: 8 }}
        >
          <input
            type="number"
            value={newKm}
            onChange={e => setNewKm(e.target.value)}
            placeholder={`Current: ${current_km.toLocaleString()}`}
            className="form-input"
            style={{ flex: 1, padding: '9px 13px', fontSize: 13 }}
            min={current_km}
            autoFocus
          />
          <button type="submit" className="btn-primary" disabled={updating} style={{ padding: '9px 14px', fontSize: 13 }}>
            {updating ? <div className="spinner" style={{ width: 13, height: 13 }} /> : 'Update'}
          </button>
          <button type="button" onClick={() => { setShowKmUpdate(false); setNewKm(''); }} className="btn-secondary" style={{ padding: '9px 12px', fontSize: 13 }}>
            Cancel
          </button>
        </motion.form>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowKmUpdate(!showKmUpdate)}
          className="btn-secondary"
          style={{ flex: 1, fontSize: 13, padding: '9px 12px', justifyContent: 'center' }}
        >
          <RefreshCw size={13} /> Update KM
        </motion.button>

        <motion.a
          whileTap={{ scale: 0.95 }}
          href={getDIYUrl(model, maintenance_type)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-yellow"
          style={{ flex: 1, fontSize: 13, padding: '9px 12px', justifyContent: 'center' }}
        >
          <Wrench size={13} /> DIY Guide
        </motion.a>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/vehicle/${id}`)}
          className="btn-ghost"
          style={{ fontSize: 13, padding: '9px 11px' }}
          title="View details"
        >
          <ExternalLink size={13} />
        </motion.button>
      </div>
    </motion.div>
  );
}
