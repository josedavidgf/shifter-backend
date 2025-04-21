require('dotenv').config();
const { sendSwapProposalEmail } = require('../services/emailService');

const dummyShift = {
  date: '2025-04-25',
  shift_type: 'evening',
  shift_label: 'duty'
};

const dummyPreferences = [
  { preferred_date: '2025-04-26', preferred_type: 'morning', preferred_label: 'regular' },
  { preferred_date: '2025-04-27', preferred_type: 'evening', preferred_label: 'duty' }
];

sendSwapProposalEmail('josedavidgarciafernandez+1@gmail.com', dummyShift, dummyPreferences)
  .then(() => console.log('✅ Email de prueba enviado'))
  .catch((err) => console.error('❌ Error al enviar email de prueba:', err.message));
