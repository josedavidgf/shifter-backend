const supabase = require('../config/supabase');

// Registro de usuario
async function registerUser(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

// Inicio de sesión
async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

// Verificar sesión
async function getUser(token) {
  const { data, error } = await supabase.auth.getUser(token);
  if (error) throw new Error(error.message);
  return data;
}

module.exports = {
  registerUser,
  loginUser,
  getUser,
};
