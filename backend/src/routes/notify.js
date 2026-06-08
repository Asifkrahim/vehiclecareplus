const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { sendVehicleAddedEmail, sendServiceReminderEmail } = require('../services/emailService');

router.use(authMiddleware);

/**
 * POST /api/notify/test
 * Test email sending
 */
router.post('/test', async (req, res) => {
  try {
    const testVehicle = {
      vehicle_no: 'TEST-001',
      model: 'Test Vehicle',
      vehicle_type: 'Car',
      current_km: 15000,
      next_service_km: 25000,
    };

    const result = await sendVehicleAddedEmail(req.user.email, testVehicle);
    if (result.success) {
      res.json({ message: `Test email sent to ${req.user.email}` });
    } else {
      res.status(500).json({ error: 'Failed to send test email', details: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
