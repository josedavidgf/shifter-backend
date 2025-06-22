// src/services/emailService.js
const nodemailer = require('nodemailer');
const { shouldSendSwapEmail, shouldSendReminderEmail } = require('./userPreferencesService'); // Ajusta el path si es necesario
const { translateShiftType } = require('../utils/translateService'); // ✅ Import antes de usar


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
  const allow = await shouldSendSwapEmail(userId);
  if (!allow) {
    console.log('📭 Usuario ha desactivado los emails. No se enviará.');
    return;
  }

  const isNoReturn = offered.swap_type === 'no_return';

  const body = `
    <p>Has recibido una propuesta de intercambio de turno de <strong>${offered.requester_name} ${offered.requester_surname}</strong>.</p>
    <p><strong>El turno que tienes publicado:</strong> ${shift.date} de ${translateShiftType(shift.shift_type)}</p>
    ${isNoReturn
      ? `<p>${offered.requester_name} se ofrece a cubrir este turno sin pedir otro a cambio.</p>`
      : `<p><strong>El turno que te ofrecen:</strong> ${offered.offered_date} de ${translateShiftType(offered.offered_type)}</p>`
    }
    ${offered.swap_comments
      ? `<p><strong>Comentarios:</strong> ${offered.swap_comments}</p>`
      : ''
    }
    <br> 
    <p>Accede a la app para aceptar o rechazar esta propuesta.</p>
    <br>
    <p>Gracias por usar Tanda para organizar vuestros turnos con más facilidad.</p>
    <p>✉️ Este es un mensaje automático de Tanda. No respondas a este correo.</p>
    <p>El equipo de Tanda</p>
  `;

  const mailOptions = {
    from: `"Tanda" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: '📩 Nuevo intercambio de turno propuesto',
    html: body,
  };

  await transporter.sendMail(mailOptions);
}


async function sendSwapAcceptedEmail(userId, toEmail, originalShift, proposedShift) {
  const allow = await shouldSendSwapEmail(userId);
  if (!allow) {
    console.log('📭 Usuario ha desactivado los emails. No se enviará.');
    return;
  }

  const isNoReturn = proposedShift.swap_type === 'no_return';

  const body = `
    <p>🎉 Tu propuesta de intercambio ha sido <strong>aceptada</strong> por ${originalShift.owner_name} ${originalShift.owner_surname}</p>

    <p><strong>Turno original (que querías cambiar):</strong> ${originalShift.date} de ${translateShiftType(originalShift.shift_type)}</p>

    ${isNoReturn
      ? `<p>Has recibido el turno del ${originalShift.date} de ${translateShiftType(originalShift.shift_type)} sin necesidad de ofrecer otro a cambio.</p>`
      : `<p><strong>Turno que ofreciste (que hará ${originalShift.owner_name}):</strong> ${proposedShift.offered_date} de ${translateShiftType(proposedShift.offered_type)}</p>`
    }

    <p>Accede a tu cuenta para ver los detalles actualizados.</p>
    <br>
    <p>Gracias por usar Tanda para organizar vuestros turnos con más facilidad.</p>

    <p>✉️ Este es un mensaje automático de Tanda. No respondas a este correo.</p>
    <p>El equipo de Tanda</p>
  `;

  const mailOptions = {
    from: `"Tanda" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: '✅ Tu intercambio ha sido aceptado',
    html: body,
  };

  await transporter.sendMail(mailOptions);
}


async function sendSwapAcceptedEmailOwner(userId, toEmail, originalShift, proposedShift) {
  const allow = await shouldSendSwapEmail(userId);
  if (!allow) {
    console.log('📭 Usuario ha desactivado los emails. No se enviará.');
    return;
  }

  const isNoReturn = proposedShift.swap_type === 'no_return';

  const body = isNoReturn
    ? `
      <p>🎉 Alguien ha aceptado el turno que publicaste</p>

      <p><strong>Turno cedido:</strong> ${originalShift.date} de ${translateShiftType(originalShift.shift_type)}</p>

      <p>Este turno ha sido asignado automáticamente. Ya no aparecerá como disponible.</p>

      <br>
      <p>Gracias por usar Tanda para organizar vuestros turnos con más facilidad.</p>

      <p>✉️ Este es un mensaje automático de Tanda. No respondas a este correo.</p>
      <p>El equipo de Tanda</p>
    `
    : `
      <p>🎉 El turno que publicaste ha sido intercambiado automáticamente por uno de los turnos que tenías disponible</p>

      <p><strong>Turno que tenías y publicaste:</strong> ${originalShift.date} de ${translateShiftType(originalShift.shift_type)}</p>

      <p><strong>Turno que vas a hacer ahora:</strong> ${proposedShift.offered_date} de ${translateShiftType(proposedShift.offered_type)}</p>

      <p>Accede a tu cuenta para ver los detalles actualizados.</p>

      <br>
      <p>Gracias por usar Tanda para organizar vuestros turnos con más facilidad.</p>

      <p>✉️ Este es un mensaje automático de Tanda. No respondas a este correo.</p>
      <p>El equipo de Tanda</p>
    `;

  const mailOptions = {
    from: `"Tanda" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: '✅ Tu turno ha sido intercambiado automáticamente',
    html: body,
  };

  await transporter.sendMail(mailOptions);
}

async function sendSwapRejectedEmail(userId, toEmail, originalShift, proposedShift) {
  const allow = await shouldSendSwapEmail(userId);
  if (!allow) {
    console.log('📭 Usuario ha desactivado los emails. No se enviará.');
    return;
  }

  const isNoReturn = proposedShift.swap_type === 'no_return';

  const body = isNoReturn
    ? `
      <p>Lamentablemente, tu propuesta de cesión de turno ha sido <strong>rechazada</strong> por ${originalShift.owner_name} ${originalShift.owner_surname}.</p>

      <p><strong>Turno que ofreciste ceder:</strong> ${originalShift.date} de ${translateShiftType(originalShift.shift_type)}</p>

      <p>Puedes volver a publicarlo o gestionarlo desde la app si lo deseas.</p>

      <br>
      <p>Gracias por usar Tanda para organizar vuestros turnos con más facilidad.</p>

      <p>✉️ Este es un mensaje automático de Tanda. No respondas a este correo.</p>
      <p>El equipo de Tanda</p>
    `
    : `
      <p>Lamentablemente, tu propuesta de intercambio ha sido <strong>rechazada</strong> por ${originalShift.owner_name} ${originalShift.owner_surname}.</p>
  
      <p><strong>Turno que solicitaste cambiar:</strong> ${originalShift.date} de ${translateShiftType(originalShift.shift_type)}</p>
  
      <p><strong>Turno que ofreciste:</strong> ${proposedShift.offered_date} de ${translateShiftType(proposedShift.offered_type)}</p>
  
      <p>Puedes proponer otro cambio desde la app si lo deseas.</p>

      <br>
      <p>Gracias por usar Tanda para organizar vuestros turnos con más facilidad.</p>

      <p>✉️ Este es un mensaje automático de Tanda. No respondas a este correo.</p>
      <p>El equipo de Tanda</p>
    `;

  const mailOptions = {
    from: `"Tanda" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: '❌ Tu propuesta ha sido rechazada',
    html: body,
  };

  await transporter.sendMail(mailOptions);
}


async function sendMultiReminderEmail(toEmail, shifts, user) {
  const allow = await shouldSendReminderEmail(user.id);
  if (!allow) {
    console.log(`📭 Recordatorio no enviado a ${toEmail}: preferencias desactivadas.`);
    return;
  }

  const listItems = shifts.map(s => 
    `<li><strong>${s.date}</strong>: ${translateShiftType(s.shift_type)}</li>`
  ).join('');

  const mailOptions = {
    from: `"Tanda" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `📆 Recordatorio: tienes ${shifts.length} turno(s) mañana`,
    html: `
      <p>Hola ${user.name || ''},</p>
      <p>Este es un recordatorio de que <strong>mañana</strong> tienes los siguientes turnos programados:</p>
      <ul>${listItems}</ul>
      <p>¡Gracias por tu compromiso!</p>
      <br>
      <p>Gracias por usar Tanda para organizar vuestros turnos con más facilidad.</p>
      <p>✉️ Este es un mensaje automático de Tanda. No respondas a este correo.</p>
      <p>El equipo de Tanda</p>
    `
  };

  await transporter.sendMail(mailOptions);
}


async function sendSupportAndConfirmationEmail(worker, title, description) {


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


✉️ Este es un mensaje automático de Tanda. No respondas a este correo.
El equipo de Tanda
    `.trim()
  };

  await transporter.sendMail(supportMail);
  await transporter.sendMail(confirmationMail);
}

module.exports = {
  sendSwapProposalEmail,
  sendSwapAcceptedEmail,
  sendSwapAcceptedEmailOwner,
  sendSwapRejectedEmail,
  sendMultiReminderEmail,
  sendSupportAndConfirmationEmail
};
