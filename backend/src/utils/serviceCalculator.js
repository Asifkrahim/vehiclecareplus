/**
 * Service interval calculator — based on vehicle type AND maintenance type
 */

const SERVICE_INTERVALS = {
  Car: {
    'Oil Change':              10000,
    'Air Filter Replacement':  15000,
    'Tire Rotation':            8000,
    'Brake Inspection':        20000,
    'Coolant Flush':           40000,
    'Spark Plug Replacement':  30000,
    'Transmission Service':    50000,
    'Battery Check':           20000,
    'General Service':         10000,
  },
  Bike: {
    'Oil Change':               3000,
    'Air Filter Replacement':   6000,
    'Chain Lubrication':        1000,
    'Tire Check':               5000,
    'Brake Inspection':         8000,
    'Spark Plug Replacement':  10000,
    'Coolant Check':            6000,
    'General Service':          3000,
  },
};

const REMINDER_THRESHOLD = 500; // Trigger reminder within 500 km

/**
 * Get list of maintenance types for a vehicle type
 */
const getMaintenanceTypes = (vehicleType) => {
  return Object.keys(SERVICE_INTERVALS[vehicleType] || {});
};

/**
 * Get the km interval for a specific vehicle type + maintenance type
 */
const getIntervalKm = (vehicleType, maintenanceType) => {
  const typeMap = SERVICE_INTERVALS[vehicleType];
  if (!typeMap) throw new Error(`Unknown vehicle type: ${vehicleType}`);
  const interval = typeMap[maintenanceType];
  if (!interval) throw new Error(`Unknown maintenance type "${maintenanceType}" for ${vehicleType}`);
  return interval;
};

/**
 * Calculate next service KM based on vehicle type, current KM, and maintenance type
 */
const getNextServiceKm = (vehicleType, currentKm, maintenanceType) => {
  const interval = getIntervalKm(vehicleType, maintenanceType);
  return currentKm + interval;
};

/**
 * Check if a vehicle is approaching service (within threshold)
 */
const isApproachingService = (currentKm, nextServiceKm) => {
  const remaining = nextServiceKm - currentKm;
  return remaining >= 0 && remaining <= REMINDER_THRESHOLD;
};

/**
 * Calculate progress percentage toward next service
 */
const getServiceProgress = (currentKm, nextServiceKm, vehicleType, maintenanceType) => {
  const interval = getIntervalKm(vehicleType, maintenanceType);
  const startKm = nextServiceKm - interval;
  const driven = currentKm - startKm;
  return Math.min(Math.max((driven / interval) * 100, 0), 100);
};

module.exports = {
  SERVICE_INTERVALS,
  getMaintenanceTypes,
  getIntervalKm,
  getNextServiceKm,
  isApproachingService,
  getServiceProgress,
};
