const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createUserClient } = require('../services/supabaseAdmin');
const { getNextServiceKm, isApproachingService, SERVICE_INTERVALS } = require('../utils/serviceCalculator');
const { sendVehicleAddedEmail, sendServiceReminderEmail } = require('../services/emailService');

// Public — return service intervals (used by frontend dropdown)
router.get('/intervals', (req, res) => {
  res.json({ intervals: SERVICE_INTERVALS });
});

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/vehicles
 * Get all vehicles for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const supabase = createUserClient(req.token);
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ vehicles: data });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/vehicles
 * Add a new vehicle
 */
router.post('/', async (req, res) => {
  try {
    const { vehicle_no, vehicle_type, model, current_km, maintenance_type } = req.body;

    // Validation
    if (!vehicle_no || !vehicle_type || !model || current_km === undefined || !maintenance_type) {
      return res.status(400).json({ error: 'All fields are required including maintenance type' });
    }
    if (!['Car', 'Bike'].includes(vehicle_type)) {
      return res.status(400).json({ error: 'Vehicle type must be Car or Bike' });
    }
    if (isNaN(current_km) || current_km < 0) {
      return res.status(400).json({ error: 'Invalid KM reading' });
    }
    if (!SERVICE_INTERVALS[vehicle_type]?.[maintenance_type]) {
      return res.status(400).json({ error: `Invalid maintenance type for ${vehicle_type}` });
    }

    const next_service_km = getNextServiceKm(vehicle_type, parseInt(current_km), maintenance_type);

    const supabase = createUserClient(req.token);

    // Upsert profile — ensures the profiles row exists even for users
    // who registered before the auto-trigger was set up
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: req.user.id, email: req.user.email }, { onConflict: 'id' });

    if (profileError) {
      console.warn('Profile upsert warning:', profileError.message);
      // Non-fatal if FK is now pointing to auth.users directly
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert([{
        user_id: req.user.id,
        vehicle_no: vehicle_no.trim().toUpperCase(),
        vehicle_type,
        model: model.trim(),
        maintenance_type,
        current_km: parseInt(current_km),
        next_service_km,
      }])
      .select()
      .single();

    if (error) throw error;

    // Send confirmation email (non-blocking)
    sendVehicleAddedEmail(req.user.email, data).catch(console.error);

    res.status(201).json({ 
      vehicle: data, 
      message: 'Vehicle added successfully! Confirmation email sent.' 
    });
  } catch (error) {
    console.error('Add vehicle error:', error);
    res.status(500).json({ error: error.message });
  }
});


/**
 * PUT /api/vehicles/:id
 * Update vehicle KM reading
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { current_km } = req.body;

    if (current_km === undefined || isNaN(current_km) || current_km < 0) {
      return res.status(400).json({ error: 'Valid KM reading is required' });
    }

    const supabase = createUserClient(req.token);

    // Get current vehicle to check ownership and type
    const { data: existing, error: fetchError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (parseInt(current_km) < existing.current_km) {
      return res.status(400).json({ error: 'New KM reading cannot be less than current reading' });
    }

    const { data, error } = await supabase
      .from('vehicles')
      .update({ current_km: parseInt(current_km) })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    // Send reminder email if approaching service
    if (isApproachingService(parseInt(current_km), existing.next_service_km)) {
      sendServiceReminderEmail(req.user.email, data).catch(console.error);
    }

    res.json({ 
      vehicle: data, 
      message: 'KM reading updated successfully',
      reminderSent: isApproachingService(parseInt(current_km), existing.next_service_km),
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/vehicles/:id
 * Delete a vehicle
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = createUserClient(req.token);

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/vehicles/:id/logs
 * Get service logs for a vehicle
 */
router.get('/:id/logs', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = createUserClient(req.token);

    const { data, error } = await supabase
      .from('service_logs')
      .select('*')
      .eq('vehicle_id', id)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ logs: data });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/vehicles/:id/logs
 * Add a service log
 */
router.post('/:id/logs', async (req, res) => {
  try {
    const { id } = req.params;
    const { service_type, km_at_service, notes } = req.body;

    if (!service_type || !km_at_service) {
      return res.status(400).json({ error: 'Service type and KM are required' });
    }

    const supabase = createUserClient(req.token);
    const { data, error } = await supabase
      .from('service_logs')
      .insert([{
        vehicle_id: id,
        user_id: req.user.id,
        service_type,
        km_at_service: parseInt(km_at_service),
        notes: notes || null,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ log: data, message: 'Service log added' });
  } catch (error) {
    console.error('Add log error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/vehicles/:id/logs/:logId
 * Delete a service log
 */
router.delete('/:id/logs/:logId', async (req, res) => {
  try {
    const { logId } = req.params;
    const supabase = createUserClient(req.token);

    const { error } = await supabase
      .from('service_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Service log deleted' });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
