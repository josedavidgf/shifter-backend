const supabase = require('../config/supabase');

// Crear Usuario (Registro)
async function registerUser(req, res) {
    const { email, password } = req.body;
    try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw new Error(signUpError.message);

        // Hacer login automáticamente después del registro
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw new Error(loginError.message);

        res.status(201).json({ success: true, data: loginData });
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

        // Verificar si se generó el token de sesión
        if (data.session?.access_token) {
            res.status(200).json({ success: true, data });
        } else {
            throw new Error('No se pudo generar el token de acceso');
        }
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// Obtener Perfil de Usuario
async function getUserProfile(req, res) {
    try {
        const { user } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
}

// Actualizar Perfil
async function updateUserProfile(req, res) {
    const { email, password } = req.body;
    try {
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
