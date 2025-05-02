// src/services/emailService.js
const nodemailer = require('nodemailer');
const { shouldSendSwapEmail, shouldSendReminderEmail } = require('./userPreferencesService'); // Ajusta el path si es necesario

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // ej: smtp.zoho.eu
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendSwapProposalEmail(userId, toEmail, shift, offered) {
  //('📤 Enviando email de propuesta de intercambio a:', userId);
  const allow = await shouldSendSwapEmail(userId);
  if (!allow) {
    console.log('📭 Usuario ha desactivado los emails. No se enviará.');
    return;
  }

  const mailOptions = {
    from: `"Tanda" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: '📩 Nuevo intercambio de turno propuesto',
    html: `
        <p>Has recibido una propuesta de intercambio de turno de <strong>${offered.requester_name} ${offered.requester_surname} | ${offered.requester_email}</strong>.</p>
        <p><strong>Tu turno:</strong> ${shift.date} — ${shift.shift_type} (${shift.shift_label})</p>
        <p><strong>Turno ofrecido:</strong> ${offered.offered_date} — ${offered.offered_type} (${offered.offered_label})</p>
        <p>Comentarios: ${offered.swap_comments}</p> 
        <p>Accede a la app para aceptar o rechazar esta propuesta.</p>
      `
  };

  await transporter.sendMail(mailOptions);
}

async function sendSwapAcceptedEmail(userId, toEmail, originalShift, acceptedShift) {

  const allow = await shouldSendSwapEmail(userId);
  if (!allow) {
    console.log('📭 Usuario ha desactivado los emails. No se enviará.');
    return;
  }

  const mailOptions = {
    from: `"Tanda" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: '✅ Tu intercambio ha sido aceptado',
    html: `
        <p>🎉 Tu propuesta de intercambio ha sido <strong>aceptada</strong> por ${originalShift.owner_name} ${originalShift.owner_surname} ${originalShift.owner_email}</p>
  
        <p><strong>Turno original (que querías cambiar):</strong><br>
        ${originalShift.date} — ${originalShift.shift_type} (${originalShift.shift_label})</p>
  
        <p><strong>Turno que ofreciste:</strong><br>
        ${acceptedShift.offered_date} — ${acceptedShift.offered_type} (${acceptedShift.offered_label})</p>
  
        <p>Accede a tu cuenta para ver los detalles actualizados.</p>
      `
  };

  await transporter.sendMail(mailOptions);
}
async function sendSwapRejectedEmail(userId, toEmail, originalShift, proposedShift) {

  const allow = await shouldSendSwapEmail(userId);
  if (!allow) {
    console.log('📭 Usuario ha desactivado los emails. No se enviará.');
    return;
  }

  const mailOptions = {
    from: `"Tanda" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: '❌ Tu intercambio ha sido rechazado',
    html: `
        <p>Lamentablemente, tu propuesta de intercambio ha sido <strong>rechazada</strong> por ${originalShift.owner_name} ${originalShift.owner_surname} ${originalShift.owner_email}.</p>
  
        <p><strong>Turno que solicitaste cambiar:</strong><br>
        ${originalShift.date} — ${originalShift.shift_type} (${originalShift.shift_label})</p>
  
        <p><strong>Turno que ofreciste:</strong><br>
        ${proposedShift.offered_date} — ${proposedShift.offered_type} (${proposedShift.offered_label})</p>
  
        <p>Puedes proponer otro cambio desde la app si lo deseas.</p>
      `
  };

  await transporter.sendMail(mailOptions);
}
async function sendReminderEmail(toEmail, shift, user) {
  const allow = await shouldSendReminderEmail(user.id);
  if (!allow) {
    console.log(`📭 Recordatorio no enviado a ${toEmail}: preferencias desactivadas.`);
    return;
  }

  const mailOptions = {
    from: `"Tanda" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `📆 Recordatorio: tienes turno el ${shift.date} de ${shift.shift_type}`,
    html: `
      <p>Hola ${user.name || ''},</p>
      <p>Este es un recordatorio de que <strong>mañana</strong> tienes un turno programado:</p>
      <ul>
        <li><strong>Fecha:</strong> ${shift.date}</li>
        <li><strong>Turno:</strong> ${shift.shift_type}</li>
      </ul>
      <p>¡Gracias por tu compromiso!</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

async function sendSupportAndConfirmationEmail(worker, title, description) {
  console.log('Data worker:', worker);
  console.log('Data worker:', worker.name);
  console.log('Data title:', title);
  console.log('Data description:', description);

  const supportMail = {
    from: `"Tanda" <${process.env.SMTP_USER}>`,
    to: 'josedavid@apptanda.com',
    subject: `🛠️ Incidencia: ${title}`,
    html: `
<p>Nuevo mensaje de contacto:</p>

<p><strong>Fecha de envío:</strong> ${new Date().toLocaleString('es-ES')}</p>
<p><strong>Nombre:</strong> ${worker.name} ${worker.surname}</p>
<p><strong>Email:</strong> ${worker.email}</p>

<p><strong>Mensaje:</strong></p>
<hr />
<p>${description}</p>
  `.trim()
  };

  const confirmationMail = {
    from: `"Tanda" <${process.env.SMTP_USER}>`,
    to: worker.email,
    subject: '✅ Hemos recibido tu mensaje',
    text: `
Hola ${worker.name},

Hemos recibido tu mensaje con el asunto: "${title}".

Nuestro equipo lo está revisando y te responderemos lo antes posible.  
Gracias por confiar en Tanda 🙌

— El equipo de Tanda
    `.trim()
  };

  await transporter.sendMail(supportMail);
  await transporter.sendMail(confirmationMail);
}

module.exports = {
  sendSwapProposalEmail,
  sendSwapAcceptedEmail,
  sendSwapRejectedEmail,
  sendReminderEmail,
  sendSupportAndConfirmationEmail
};
