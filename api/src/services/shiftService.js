const { get } = require('express/lib/response');
const supabase = require('../config/supabase');
const { getWorkerByUserId } = require('./workerService');

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
            .select('*')
            .single();

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

async function getShiftsPublishedByWorkerId(workerId) {
    const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('worker_id', workerId)
        .eq('state', 'published')
        .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
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
    console.log('🟡 Shift encontrado:', shift);
    if (findError) throw new Error('Turno no encontrado');

    console.log('Updateando turno:', shiftId, updates);
    const { data, error } = await supabase
        .from('shifts')
        .update(updates)
        .eq('shift_id', shiftId)
        .select()
        .single();
    console.log('🟢 Turno actualizado:', data);
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

async function getHospitalShifts(hospitalId, excludeWorkerId, workerTypeId) {
    // 1. Obtener los turnos publicados
    const { data, error } = await supabase
        .from('shifts')
        .select(`
        *,
        worker:worker_id (
          name,
          surname,
          worker_id,
          worker_type_id
        )
      `)
        .eq('hospital_id', hospitalId)
        .eq('state', 'published')
        .neq('worker_id', excludeWorkerId)
        .order('date', { ascending: true });

    if (error) throw new Error(error.message); // <- mover arriba

    // 2. Obtener todos los swaps aceptados
    const { data: acceptedSwaps, error: swapsError } = await supabase
        .from('swaps')
        .select('shift_id')
        .eq('status', 'accepted');

    if (swapsError) throw new Error(swapsError.message);

    const acceptedShiftIds = acceptedSwaps.map(s => s.shift_id);

    // 3. Buscar a qué worker_id pertenecen esos turnos (es decir, los publishers originales)
    const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('shift_id, worker_id')
        .in('shift_id', acceptedShiftIds);

    if (shiftsError) throw new Error(shiftsError.message);

    // 4. Contabilizar por worker_id cuántos swaps aceptados han tenido como publishers
    const swapsByPublisher = {};
    shiftsData.forEach(shift => {
        const publisherId = shift.worker_id;
        if (!publisherId) return;
        swapsByPublisher[publisherId] = (swapsByPublisher[publisherId] || 0) + 1;
    });

    // 5. Enriquecer los turnos con el dato
    const enrichedData = data.map(shift => {
        const stat = swapsByPublisher[shift.worker_id] || 0;
        return {
            ...shift,
            worker: {
                ...shift.worker,
                swapsAcceptedAsPublisher: stat,
            },
        };
    });

    // 6. Devolver los que coinciden con el tipo de worker actual
    return enrichedData.filter(shift => shift.worker?.worker_type_id === workerTypeId);
}



async function createShiftPreferences(shiftId, preferences) {
    /* console.log('📤 Insertando preferencias de turno en Supabase:', preferences);
    console.log('shiftId:', shiftId); */
    const enriched = preferences.map((p) => ({
        shift_id: shiftId,
        preferred_date: p.preferred_date || null,
        preferred_type: p.preferred_type || null,
        preferred_label: p.preferred_label || null,
    }));
    //console.log('enriched:', enriched);
    const today = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD

    /* if (p.preferred_date && p.preferred_date < today) {
        throw new Error('No puedes proponer fechas anteriores en las preferencias');
    } */


    const { data, error } = await supabase
        .from('shift_preferences')
        .insert(enriched);
    if (error) throw new Error(error.message);
    return data;
}

async function getShiftPreferencesByShiftId(shiftId) {
    const { data, error } = await supabase
        .from('shift_preferences')
        .select('*')
        .eq('shift_id', shiftId);

    if (error) throw new Error(error.message);
    return data;
}

async function replaceShiftPreferences(shiftId, preferences) {
    // 1. Borrar todas las preferencias existentes
    const { error: deleteError } = await supabase
        .from('shift_preferences')
        .delete()
        .eq('shift_id', shiftId);

    if (deleteError) throw new Error(deleteError.message);

    // 2. Insertar nuevas
    const enriched = preferences.map((p) => ({
        shift_id: shiftId,
        preferred_date: p.preferred_date || null,
        preferred_type: p.preferred_type || null,
        preferred_label: p.preferred_label || null,
    }));

    const { data, error } = await supabase
        .from('shift_preferences')
        .insert(enriched);

    if (error) throw new Error(error.message);
    return data;
}

async function getShiftWithOwnerEmail(shiftId) {
    const { data, error } = await supabase
        .from('shifts')
        .select(`
        shift_id,
        date,
        shift_type,
        shift_label,
        worker_id,
        workers:worker_id (
          email,
          name,
          surname,
          user_id
        )
      `)
        .eq('shift_id', shiftId)
        .single();

    if (error) throw new Error(error.message);
    return {
        shift_id: data.shift_id,
        date: data.date,
        shift_type: data.shift_type,
        shift_label: data.shift_label,
        owner_email: data.workers.email,
        owner_name: data.workers.name,
        owner_surname: data.workers.surname,
        owner_user_id: data.workers.user_id
    };
}



module.exports = {
    createShift,
    getShiftsByWorkerId,
    updateShift,
    removeShift,
    getHospitalShifts,
    createShiftPreferences,
    getShiftPreferencesByShiftId,
    replaceShiftPreferences,
    getShiftWithOwnerEmail,
    getShiftsPublishedByWorkerId
};
