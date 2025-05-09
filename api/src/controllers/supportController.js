const { sendSupportAndConfirmationEmail } = require('../services/emailService');
const supabase = require('../config/supabase');

async function sendSupportEmail (req, res) {
  const { workerId, title, description } = req.body;

  if (!workerId || !title || !description) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const { data: worker, error } = await supabase
      .from('workers')
      .select('worker_id, email, name, surname')
      .eq('worker_id', workerId)
      .single();

    if (error || !worker) {
      return res.status(404).json({ message: 'Worker not found' });
    
    }

    await sendSupportAndConfirmationEmail(
      {
        name: worker.name,
        surname: worker.surname,
        email: worker.email
      },
      title,
      description
    );
    

    return res.status(200).json({ message: 'Emails sent successfully' });
  } catch (err) {
    console.error('Support contact error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
module.exports = {
    sendSupportEmail
};
