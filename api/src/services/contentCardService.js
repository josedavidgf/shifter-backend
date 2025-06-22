const supabase = require('../config/supabaseAdmin');
const { getWorkerByUserId, getCoworkersCount } = require('./workerService');
const { getWorkerTypePlural } = require('../utils/workerTypeTranslations');


async function interpolateCardTemplate(card, worker) {
    const { worker_id, workers_hospitals, worker_types, workers_specialities } = worker;

    const hospitalId = worker?.workers_hospitals?.[0]?.hospital_id;
    const workerTypeId = worker?.worker_type_id;
    const specialityId = worker?.workers_specialities?.[0]?.speciality_id;

    const count = await getCoworkersCount({
        hospitalId,
        workerTypeId,
        specialityId
    });

    const numCoworkers = count || 0;
    const workerTypeName = getWorkerTypePlural(worker_types?.worker_type_name || '');
    const specialityName = workers_specialities?.[0]?.specialities?.speciality_category || '';
    const hospitalName = workers_hospitals?.[0]?.hospitals?.name || '';


    const description = card.description
        .replace('{{numCoworkers}}', `${numCoworkers}`)
        .replace('{{workerTypeName}}', workerTypeName)
        .replace('{{specialityName}}', specialityName)
        .replace('{{hospitalName}}', hospitalName);

    console.log('Interpolated description:', description);

    return {
        ...card,
        description,
    };
}

async function getContentCardsForUser(user_id, workerId, hospitalId, workerTypeId, specialityId) {
    let cards = [];

    const queries = [
        { field: 'worker_id', value: workerId },
        { field: 'hospital_id', value: hospitalId },
        { field: 'worker_type_id', value: workerTypeId },
        { field: 'speciality_id', value: specialityId },
        { field: 'global', value: null },
    ];

    for (const q of queries) {
        const now = new Date().toISOString();

        let query = supabase
            .from('content_cards')
            .select('*')
            .eq('is_active', true)
            .lte('start_date', now)
            .or('end_date.is.null,end_date.gte.' + now);

        if (q.field === 'global') {
            query = query
                .is('worker_id', null)
                .is('hospital_id', null)
                .is('worker_type_id', null)
                .is('speciality_id', null);
        } else if (q.value) {
            query = query.eq(q.field, q.value);
        } else {
            continue;
        }

        const { data, error } = await query.order('display_order', { ascending: true });

        if (error) throw error;
        if (data?.length) {
            cards = data;
            break;
        }
    }

    const { data: dismissals, error: dismissalsError } = await supabase
        .from('content_card_dismissals')
        .select('content_card_id')
        .eq('worker_id', workerId);

    if (dismissalsError) throw dismissalsError;

    const dismissedSet = new Set(dismissals.map(d => d.content_card_id));
    const filteredCards = cards.filter(card => !dismissedSet.has(card.id) || card.always_show);

    const worker = await getWorkerByUserId(user_id);

    console.log('Worker data for interpolation:', worker);

    const interpolated = await Promise.all(
        filteredCards.map(async (card) =>
            card.is_dynamic ? await interpolateCardTemplate(card, worker) : card
        )
    );

    return interpolated;
}

async function dismissContentCard(workerId, contentCardId) {
    const { error } = await supabase.from('content_card_dismissals').insert({
        content_card_id: contentCardId,
        worker_id: workerId,
    });

    if (error) throw error;
    return true;
}

module.exports = {
    getContentCardsForUser,
    dismissContentCard,
};
