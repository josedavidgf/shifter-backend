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

        // Actualizar el último inicio de sesión
        await supabase
            .from('workers')
            .update({ last_login_timestamp: new Date().toISOString() })
            .eq('user_id', data.user.id);

        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}


// Obtener Perfil de Usuario
async function getUserProfile(req, res) {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase.auth.api.getUserById(userId);

        if (error) throw new Error(error.message);
        res.status(200).json({ success: true, user: data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
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
// Crear Worker en el Onboarding
async function createWorker(req, res) {
    const { userId, name, surname, workerTypeId, email } = req.body;

    try {
        const { data, error } = await supabase
            .from('workers')
            .insert([{ userId, name, surname, workerTypeId, email, state: 'active', createdAt: new Date() }]);

        if (error) throw new Error(error.message);

        res.status(201).json({ success: true, data });
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
    createWorker,
};
