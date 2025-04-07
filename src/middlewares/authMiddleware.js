const supabase = require('../config/supabase');

async function protectRoute(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data) throw new Error('Invalid token');
    req.user = data.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = protectRoute;
