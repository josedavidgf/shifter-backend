const jwt = require('jsonwebtoken');

const protectRoute = async (req, res, next) => {
    console.log('🔒 Middleware de autenticación activado');
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // 👈 asegúrate de definirlo antes de loguear

    //console.log('🧪 Header recibido:', authHeader);
    //console.log('👉 Token recibido:', token);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        //console.log('🔓 Token decodificado:', decoded);
        req.user = decoded;
        next();
      } catch (err) {
        console.error('❌ Error al verificar token:', err.message);
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
      
};

module.exports = protectRoute;
