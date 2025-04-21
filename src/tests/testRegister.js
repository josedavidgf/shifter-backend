const supabase = require('../config/supabase');

async function testRegister() {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'user@testmail.com',
      password: 'password123',
    });

    if (error) throw new Error(error.message);
    console.log('Registro exitoso:', data);
  } catch (err) {
    console.error('Error al registrar:', err.message);
  }
}

testRegister();
