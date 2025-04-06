const { createClient } = require('@supabase/supabase-js');

// Cargar las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

// Crear el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
