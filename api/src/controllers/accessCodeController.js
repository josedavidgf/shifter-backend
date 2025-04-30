const accessCodeService = require('../services/accessCodeService');

const validateAccessCode = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Code is required' });
  }

  try {
    const accessCode = await accessCodeService.getAccessCode(code);
    return res.status(200).json({ success: true, data: accessCode });
  } catch (error) {
    console.error('❌ Error validating access code:', error.message);
    return res.status(404).json({ success: false, message: 'Invalid code' });
  }
};

module.exports = {
  validateAccessCode,
};
