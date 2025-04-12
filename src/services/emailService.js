// src/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // ej: smtp.zoho.eu
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendSwapProposalEmail(toEmail, shift, offered) {
    const mailOptions = {
      from: `"Shifter" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: '📩 Nuevo intercambio de turno propuesto',
      html: `
        <p>Has recibido una propuesta de intercambio de turno de <strong>${offered.requester_email}</strong>.</p>
        <p><strong>Tu turno:</strong> ${shift.date} — ${shift.shift_type} (${shift.shift_label})</p>
        <p><strong>Turno ofrecido:</strong> ${offered.offered_date} — ${offered.offered_type} (${offered.offered_label})</p>
        <p>Accede a la app para aceptar o rechazar esta propuesta.</p>
      `
    };
  
    await transporter.sendMail(mailOptions);
  }
  
  async function sendSwapAcceptedEmail(toEmail, originalShift, acceptedShift) {
    const mailOptions = {
      from: `"Shifter" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: '✅ Tu intercambio ha sido aceptado',
      html: `
        <p>🎉 Tu propuesta de intercambio ha sido <strong>aceptada</strong> por ${originalShift.owner_email}</p>
  
        <p><strong>Turno original (que querías cambiar):</strong><br>
        ${originalShift.date} — ${originalShift.shift_type} (${originalShift.shift_label})</p>
  
        <p><strong>Turno que ofreciste:</strong><br>
        ${acceptedShift.offered_date} — ${acceptedShift.offered_type} (${acceptedShift.offered_label})</p>
  
        <p>Accede a tu cuenta para ver los detalles actualizados.</p>
      `
    };
  
    await transporter.sendMail(mailOptions);
  }

module.exports = { 
    sendSwapProposalEmail,
    sendSwapAcceptedEmail
 };
