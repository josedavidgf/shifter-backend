// testEmail.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: `"Shifter App" <${process.env.SMTP_USER}>`,
      to: 'josedavidgarciafernandez+1@gmail.com',
      subject: '🚨 Test de correo desde Shifter',
      html: `
        <h2>Hola 👋</h2>
        <p>Este es un email de prueba desde tu backend Node.js usando <strong>nodemailer</strong> y SMTP de Zoho.</p>
      `
    });

    console.log('✅ Email enviado:', info.messageId);
  } catch (err) {
    console.error('❌ Error al enviar email:', err.message);
  }
}

main();
