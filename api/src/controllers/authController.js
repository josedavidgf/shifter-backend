const supabase = require('../config/supabase');

// Crear Usuario (Registro)
async function registerUser(req, res) {
    const { email, password } = req.body;
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://pre-app.apptanda.com/auth/callback',
        },
      });
  
      if (signUpError) throw new Error(signUpError.message);
      console.log(data);
  
      // ✅ Crear worker con estado inicial
      await supabase
        .from('workers')
        .insert([{
          user_id: signUpData.user.id,
          email,
          state: 'pending',
          onboarding_completed: false,
          created_at: new Date()
        }]);
        
      res.status(201).json({ success: true, message: 'Verificación enviada. Revisa tu correo.' });
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

async function handleResendVerification(req, res) {
    try {
        const userId = req.user.sub;

        // 1. Obtener el email del usuario desde Supabase
        const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId);
        if (getUserError || !userData?.user?.email) {
            throw new Error(getUserError?.message || 'No se pudo obtener el email del usuario');
        }

        // 2. Reenviar el correo de verificación
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: userData.user.email,
        });

        if (error) {
            throw new Error(error.message);
        }

        res.status(200).json({ success: true, message: 'Correo de verificación reenviado' });
    } catch (err) {
        console.error('❌ Error al reenviar verificación:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}



module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    logoutUser,
    createWorker,
    handleResendVerification
};
