const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailStyles = `font-family: 'Segoe UI', Arial, sans-serif; background: #0D0D0D; color: #F8F9FA;`;

const sendVehicleAddedEmail = async (userEmail, vehicle) => {
  const { vehicle_no, model, vehicle_type, current_km, next_service_km } = vehicle;
  await transporter.sendMail({
    from: `"VehicleCare+ 🚗" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `✅ Vehicle Added — ${model} (${vehicle_no})`,
    html: `
      <div style="${emailStyles} padding:0;margin:0;">
        <div style="max-width:600px;margin:0 auto;background:#1A1A1A;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#E63946,#FFD60A);padding:32px;text-align:center;">
            <h1 style="color:#0D0D0D;font-size:28px;margin:0;font-weight:800;">🚗 VehicleCare+</h1>
            <p style="color:#0D0D0D;margin:8px 0 0;font-size:14px;opacity:.8;">Your Vehicle Maintenance Tracker</p>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#FFD60A;font-size:20px;margin:0 0 16px;">Vehicle Successfully Added! ✅</h2>
            <p style="color:#C0C0C0;line-height:1.6;">Your vehicle has been registered in VehicleCare+.</p>
            <div style="background:#252525;border:1px solid #333;border-radius:12px;padding:20px;margin:24px 0;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="color:#888;padding:8px 0;font-size:13px;">Vehicle Number</td><td style="color:#F8F9FA;font-weight:600;text-align:right;">${vehicle_no}</td></tr>
                <tr><td style="color:#888;padding:8px 0;font-size:13px;border-top:1px solid #333;">Model</td><td style="color:#F8F9FA;font-weight:600;text-align:right;">${model}</td></tr>
                <tr><td style="color:#888;padding:8px 0;font-size:13px;border-top:1px solid #333;">Type</td><td style="color:#F8F9FA;font-weight:600;text-align:right;">${vehicle_type}</td></tr>
                <tr><td style="color:#888;padding:8px 0;font-size:13px;border-top:1px solid #333;">Current KM</td><td style="color:#F8F9FA;font-weight:600;text-align:right;">${current_km.toLocaleString()} km</td></tr>
                <tr><td style="color:#888;padding:8px 0;font-size:13px;border-top:1px solid #333;">Next Service At</td><td style="color:#FFD60A;font-weight:700;text-align:right;">${next_service_km.toLocaleString()} km</td></tr>
              </table>
            </div>
          </div>
          <div style="padding:20px 32px;border-top:1px solid #333;text-align:center;">
            <p style="color:#555;font-size:12px;margin:0;">© 2026 VehicleCare+ · Your vehicle health, simplified.</p>
          </div>
        </div>
      </div>
    `,
  });
  return { success: true };
};

const sendServiceReminderEmail = async (userEmail, vehicle) => {
  const { vehicle_no, model, vehicle_type, current_km, next_service_km } = vehicle;
  const remaining = next_service_km - current_km;
  await transporter.sendMail({
    from: `"VehicleCare+ 🚗" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `⚠️ Service Due Soon — ${model} (${vehicle_no})`,
    html: `
      <div style="${emailStyles} padding:0;margin:0;">
        <div style="max-width:600px;margin:0 auto;background:#1A1A1A;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#E63946,#c0392b);padding:32px;text-align:center;">
            <h1 style="color:#fff;font-size:28px;margin:0;font-weight:800;">⚠️ Service Reminder</h1>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#E63946;font-size:20px;margin:0 0 16px;">Service Due in ${remaining.toLocaleString()} km!</h2>
            <p style="color:#C0C0C0;line-height:1.6;">Your <strong style="color:#F8F9FA">${model}</strong> (${vehicle_no}) is approaching its next scheduled service.</p>
            <div style="background:#252525;border:1px solid #333;border-radius:12px;padding:20px;margin:24px 0;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="color:#888;padding:8px 0;font-size:13px;">Current KM</td><td style="color:#F8F9FA;font-weight:600;text-align:right;">${current_km.toLocaleString()} km</td></tr>
                <tr><td style="color:#888;padding:8px 0;font-size:13px;border-top:1px solid #333;">Next Service</td><td style="color:#FFD60A;font-weight:700;text-align:right;">${next_service_km.toLocaleString()} km</td></tr>
                <tr><td style="color:#888;padding:8px 0;font-size:13px;border-top:1px solid #333;">Remaining</td><td style="color:#E63946;font-weight:700;text-align:right;">${remaining.toLocaleString()} km</td></tr>
              </table>
            </div>
          </div>
          <div style="padding:20px 32px;border-top:1px solid #333;text-align:center;">
            <p style="color:#555;font-size:12px;margin:0;">© 2026 VehicleCare+ · Your vehicle health, simplified.</p>
          </div>
        </div>
      </div>
    `,
  });
  return { success: true };
};

module.exports = { sendVehicleAddedEmail, sendServiceReminderEmail };
