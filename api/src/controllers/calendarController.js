const calendarService = require('../services/calendarService');

async function getMonthlySchedules(req, res) {
  try {
    const { workerIds, year, month } = req.body;
    if (!Array.isArray(workerIds) || workerIds.length === 0 || !year || !month) {
      return res.status(400).json({ error: 'workerIds (array), year y month son requeridos' });
    }
    const data = await calendarService.getMonthlySchedules(workerIds, Number(year), Number(month));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getMonthlySchedules,
}; 