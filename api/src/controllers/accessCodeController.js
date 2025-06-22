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
const handleGetAccessCode = async (req, res) => {
  const { hospitalId, workerTypeId } = req.query;

  if (!hospitalId || !workerTypeId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const code = await accessCodeService.getAccessCodeByHospitalAndType(hospitalId, workerTypeId);
    if (!code) return res.status(404).json({ error: 'Code not found' });

    return res.json({ code });
  } catch (err) {
    console.error('[getAccessCode] Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  validateAccessCode,
  handleGetAccessCode 
};
