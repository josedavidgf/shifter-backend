const supabase = require('../config/supabase');

// Crear Usuario (Registro)
async function registerUser(req, res) {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw new Error(error.message);
        res.status(201).json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// Iniciar Sesión (Login)
async function loginUser(req, res) {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// Obtener Perfil de Usuario (con token)
async function getUserProfile(req, res) {
    try {
        // Obtener el token desde los encabezados
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw new Error('Token no proporcionado');

        // Verificar el usuario utilizando el token
        const { data, error } = await supabase.auth.getUser(token);
        if (error) throw new Error(error.message);
        if (!data.user) throw new Error('Usuario no autenticado');

        res.status(200).json({ success: true, data: data.user });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
}

// Actualizar Perfil (requiere token)
async function updateUserProfile(req, res) {
    const { email, password } = req.body;
    try {
        // Obtener el token desde los encabezados
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw new Error('Token no proporcionado');

        const { data, error } = await supabase.auth.updateUser({ email, password });
        if (error) throw new Error(error.message);
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// Cerrar Sesión (Logout)
async function logoutUser(req, res) {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(error.message);
        res.status(200).json({ success: true, message: 'Sesión cerrada' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    logoutUser,
};
