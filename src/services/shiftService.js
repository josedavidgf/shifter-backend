const supabase = require('../config/supabase');

async function createShift(shiftData){ 
    try{
        if (!shiftData || !shiftData.worker_id || !shiftData.hospital_id || !shiftData.speciality_id || !shiftData.date || !shiftData.shift_type || !shiftData.shift_label) {
            console.error('❌ shiftData incompleto:', shiftData);
            throw new Error('Datos obligatorios faltantes para crear el turno');
        }

        console.log('📤 Insertando turno en Supabase:', shiftData);

        const { data, error } = await supabase
            .from('shifts')
            .insert([shiftData])
            .select('*');

        if (error) {
            console.error('❌ Error al insertar turno en Supabase:', error);
            throw new Error(error.message);
        }

        console.log('✅ Turno insertado correctamente:', data);
        return data;
    }
    catch (err) {
        console.error('❌ createShift error:', err.message);
        throw err;
    }
}

module.exports = { createShift };
