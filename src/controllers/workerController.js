const supabase = require('../config/supabase');

const getAllWorkers = async (req, res) => {
  try {
    const { data, error } = await supabase.from('workers').select('*');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createWorker = async (req, res) => {
  try {
    const { name, surname } = req.body;
    const { data, error } = await supabase.from('workers').insert([{ name, surname }]);
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllWorkers, createWorker };
