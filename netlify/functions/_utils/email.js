const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailStyles = `
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #0D0D0D;
  color: #F8F9FA;
`;

/**
 * Send a vehicle added confirmation email
 */
const sendVehicleAddedEmail = async (userEmail, vehicle) => {
  const { vehicle_no, model, vehicle_type, current_km, next_service_km } = vehicle;

  const mailOptions = {
    from: `"VehicleCare+ 🚗" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `✅ Vehicle Added — ${model} (${vehicle_no})`,
    html: `
      <div style="${emailStyles} padding: 0; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #1A1A1A; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #E63946, #FFD60A); padding: 32px; text-align: center;">
            <h1 style="color: #0D0D0D; font-size: 28px; margin: 0; font-weight: 800;">🚗 VehicleCare+</h1>
            <p style="color: #0D0D0D; margin: 8px 0 0; font-size: 14px; opacity: 0.8;">Your Vehicle Maintenance Tracker</p>
          </div>
          <!-- Body -->
          <div style="padding: 32px;">
            <h2 style="color: #FFD60A; font-size: 20px; margin: 0 0 16px;">Vehicle Successfully Added! ✅</h2>
            <p style="color: #C0C0C0; line-height: 1.6;">Your vehicle has been registered in VehicleCare+ and we'll help you stay on top of maintenance.</p>
            
            <div style="background: #252525; border: 1px solid #333; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="color: #888; padding: 8px 0; font-size: 13px;">Vehicle Number</td><td style="color: #F8F9FA; font-weight: 600; text-align: right;">${vehicle_no}</td></tr>
                <tr><td style="color: #888; padding: 8px 0; font-size: 13px; border-top: 1px solid #333;">Model</td><td style="color: #F8F9FA; font-weight: 600; text-align: right;">${model}</td></tr>
                <tr><td style="color: #888; padding: 8px 0; font-size: 13px; border-top: 1px solid #333;">Type</td><td style="color: #F8F9FA; font-weight: 600; text-align: right;">${vehicle_type}</td></tr>
                <tr><td style="color: #888; padding: 8px 0; font-size: 13px; border-top: 1px solid #333;">Current KM</td><td style="color: #F8F9FA; font-weight: 600; text-align: right;">${current_km.toLocaleString()} km</td></tr>
                <tr><td style="color: #888; padding: 8px 0; font-size: 13px; border-top: 1px solid #333;">Next Service At</td><td style="color: #FFD60A; font-weight: 700; text-align: right;">${next_service_km.toLocaleString()} km</td></tr>
              </table>
            </div>

            <div style="background: linear-gradient(135deg, rgba(230,57,70,0.15), rgba(255,214,10,0.15)); border: 1px solid rgba(255,214,10,0.3); border-radius: 12px; padding: 16px; margin-top: 16px;">
              <p style="color: #FFD60A; margin: 0; font-size: 14px;">⚡ Next oil change due at <strong>${next_service_km.toLocaleString()} km</strong>. We'll remind you when you're getting close!</p>
            </div>
          </div>
          <!-- Footer -->
          <div style="padding: 20px 32px; border-top: 1px solid #333; text-align: center;">
            <p style="color: #555; font-size: 12px; margin: 0;">© 2026 VehicleCare+ · Your vehicle health, simplified.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Confirmation email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send a service reminder email
 */
const sendServiceReminderEmail = async (userEmail, vehicle) => {
  const { vehicle_no, model, vehicle_type, current_km, next_service_km } = vehicle;
  const remaining = next_service_km - current_km;

  const mailOptions = {
    from: `"VehicleCare+ 🚗" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `⚠️ Service Due Soon — ${model} (${vehicle_no})`,
    html: `
      <div style="${emailStyles} padding: 0; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #1A1A1A; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #E63946, #c0392b); padding: 32px; text-align: center;">
            <h1 style="color: #fff; font-size: 28px; margin: 0; font-weight: 800;">⚠️ Service Reminder</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">VehicleCare+ Alert</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #E63946; font-size: 20px; margin: 0 0 16px;">Service Due in ${remaining.toLocaleString()} km!</h2>
            <p style="color: #C0C0C0; line-height: 1.6;">Your <strong style="color:#F8F9FA">${model}</strong> (${vehicle_no}) is approaching its next scheduled service.</p>
            
            <div style="background: #252525; border: 1px solid #333; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="color: #888; padding: 8px 0; font-size: 13px;">Current KM</td><td style="color: #F8F9FA; font-weight: 600; text-align: right;">${current_km.toLocaleString()} km</td></tr>
                <tr><td style="color: #888; padding: 8px 0; font-size: 13px; border-top: 1px solid #333;">Next Service At</td><td style="color: #FFD60A; font-weight: 700; text-align: right;">${next_service_km.toLocaleString()} km</td></tr>
                <tr><td style="color: #888; padding: 8px 0; font-size: 13px; border-top: 1px solid #333;">Remaining</td><td style="color: #E63946; font-weight: 700; text-align: right;">${remaining.toLocaleString()} km</td></tr>
              </table>
            </div>

            <p style="color: #C0C0C0; font-size: 14px;">Book your service appointment soon to keep your ${vehicle_type.toLowerCase()} in top condition.</p>
          </div>
          <div style="padding: 20px 32px; border-top: 1px solid #333; text-align: center;">
            <p style="color: #555; font-size: 12px; margin: 0;">© 2026 VehicleCare+ · Your vehicle health, simplified.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Reminder email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendVehicleAddedEmail, sendServiceReminderEmail };
