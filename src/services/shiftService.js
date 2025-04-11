const { get } = require('express/lib/response');
const supabase = require('../config/supabase');
const { getWorkerByUserId } = require('../services/workerService');

async function createShift(shiftData) {
    try {
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

async function getShiftsByWorkerId(workerId) {
    const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('worker_id', workerId)
        .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}
async function updateShift(shiftId, updates, userId) {
    // Verificar que el turno pertenece al user
    const { data: shift, error: findError } = await supabase
        .from('shifts')
        .select('shift_id, worker_id')
        .eq('shift_id', shiftId)
        .single();

    if (findError) throw new Error('Turno no encontrado');


    const { data, error } = await supabase
        .from('shifts')
        .update(updates)
        .eq('shift_id', shiftId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}
async function removeShift(shiftId, userId) {
    const worker = await getWorkerByUserId(userId);

    const { data: shift, error: findError } = await supabase
        .from('shifts')
        .select('worker_id')
        .eq('shift_id', shiftId)
        .single();

    if (findError) throw new Error('Turno no encontrado');
    if (!worker || shift.worker_id !== worker.worker_id) {
        throw new Error('No autorizado para eliminar este turno');
    }

    const { data, error } = await supabase
        .from('shifts')
        .update({ state: 'removed' })
        .eq('shift_id', shiftId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}



module.exports = {
    createShift,
    getShiftsByWorkerId,
    updateShift,
    removeShift,
};
