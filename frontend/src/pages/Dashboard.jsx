import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehicleAPI } from '../lib/api';
import VehicleCard from '../components/VehicleCard';
import { Plus, Car, Bike, RefreshCw, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      const { data } = await vehicleAPI.getAll();
      setVehicles(data.vehicles || []);
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = (id) => setVehicles(prev => prev.filter(v => v.id !== id));
  const handleUpdate = (id, updated) => setVehicles(prev => prev.map(v => v.id === id ? updated : v));

  const cars = vehicles.filter(v => v.vehicle_type === 'Car');
  const bikes = vehicles.filter(v => v.vehicle_type === 'Bike');

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, paddingBottom: 48, background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}
        >
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: 6 }}>
              My Garage
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.email?.split('@')[0]}</strong>
              {' · '}{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setLoading(true); fetchVehicles(); }}
              className="btn-secondary"
              style={{ padding: '10px 16px', fontSize: 14 }}
            >
              <RefreshCw size={14} /> Refresh
            </motion.button>
            <Link to="/vehicle/add" className="btn-primary" style={{ fontSize: 14, padding: '10px 20px' }}>
              <Plus size={16} /> Add Vehicle
            </Link>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <div style={{ textAlign: 'center' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 48,
                  height: 48,
                  border: '3px solid var(--border-color)',
                  borderTopColor: '#E63946',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                }}
              />
              <p style={{ color: 'var(--text-muted)' }}>Loading your garage...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && vehicles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center',
              padding: '80px 24px',
              background: 'var(--bg-card)',
              borderRadius: 20,
              border: '1px solid var(--border-color)',
              borderStyle: 'dashed',
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Inbox size={26} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Your garage is empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
              Add your first vehicle to start tracking service intervals.
            </p>
            <Link to="/vehicle/add" className="btn-primary" style={{ fontSize: 15 }}>
              <Plus size={16} /> Add Your First Vehicle
            </Link>
          </motion.div>
        )}

        {/* Cars Section */}
        {!loading && cars.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div className="section-divider">
              <div className="section-divider-line" />
              <div className="section-divider-label">
                <Car size={16} style={{ color: '#E63946' }} />
                <span>Cars ({cars.length})</span>
              </div>
              <div className="section-divider-line" />
            </div>
            <motion.div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 20,
              }}
            >
              {cars.map((vehicle, i) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  index={i}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </motion.div>
          </div>
        )}

        {/* Bikes Section */}
        {!loading && bikes.length > 0 && (
          <div>
            <div className="section-divider">
              <div className="section-divider-line" />
              <div className="section-divider-label">
                <Bike size={16} style={{ color: '#FFD60A' }} />
                <span>Bikes ({bikes.length})</span>
              </div>
              <div className="section-divider-line" />
            </div>
            <motion.div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 20,
              }}
            >
              {bikes.map((vehicle, i) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  index={i}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
