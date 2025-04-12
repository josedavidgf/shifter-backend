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
  

module.exports = { sendSwapProposalEmail };
