const { createSwap } = require('../services/swapService');
const {getShiftWithOwnerEmail} = require('../services/shiftService');
const { getWorkerByUserId } = require('../services/workerService');
const {
    getSwapsForMyShifts,
    cancelSwap,
    respondToSwap,
    getSwapsByRequesterId
} = require('../services/swapService');
const { sendSwapProposalEmail } = require('../services/emailService');

async function handleCreateSwap(req, res) {
    try {
        const userId = req.user.sub;
        const worker = await getWorkerByUserId(userId);
        if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

        const { shift_id, offered_date, offered_type, offered_label } = req.body;

        const swap = await createSwap({
            shift_id,
            requester_id: worker.worker_id,
            offered_date,
            offered_type,
            offered_label,
        });

        const today = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
        if (offered_date < today) {
            return res.status(400).json({ success: false, message: 'La fecha del swap no puede ser anterior a hoy.' });
        }

        // 🔍 Obtener detalles completos del turno
        const shift = await getShiftWithOwnerEmail(shift_id);
        if (!shift || !shift.owner_email) {
            console.warn('⚠️ No se pudo obtener el email del receptor');
            return res.status(201).json({ success: true, data: swap });
        }

        // Enviar correo al trabajador con la propuesta de swap
        await sendSwapProposalEmail(
            shift.owner_email, // receptor
            shift,             // turno original
            {
                requester_email: worker.email,
                offered_date,
                offered_type,
                offered_label
            }
        );

        res.status(201).json({ success: true, data: swap });
    } catch (err) {
        console.error('❌ Error al crear intercambio:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}

async function handleGetReceivedSwaps(req, res) {
    try {
        const userId = req.user.sub;
        const worker = await getWorkerByUserId(userId);
        console.log('🟡 userId swaps:', userId);
        console.log('🟡 worker swaps:', worker);
        if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

        const swaps = await getSwapsForMyShifts(worker.worker_id);
        console.log('🟡 swaps:', swaps);
        res.json({ success: true, data: swaps });
    } catch (err) {
        console.error('❌ Error al cargar swaps recibidos:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}

async function handleCancelSwap(req, res) {
    try {
        const userId = req.user.sub;
        const worker = await getWorkerByUserId(userId);
        const swapId = req.params.id;

        const result = await cancelSwap(swapId, worker.worker_id);
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('❌ Error al cancelar swap:', err.message);
        res.status(403).json({ success: false, message: err.message });
    }
}
async function handleRespondToSwap(req, res) {
    try {
        const userId = req.user.sub;
        const worker = await getWorkerByUserId(userId);
        const swapId = req.params.id;
        const { status } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Estado inválido' });
        }

        const result = await respondToSwap(swapId, status, worker.worker_id);
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('❌ Error al responder al swap:', err.message);
        res.status(403).json({ success: false, message: err.message });
    }
}
async function handleGetSentSwaps(req, res) {
    try {
        const userId = req.user.sub;
        const worker = await getWorkerByUserId(userId);
        const swaps = await getSwapsByRequesterId(worker.worker_id);
        res.json({ success: true, data: swaps });
    } catch (err) {
        console.error('❌ Error al obtener swaps enviados:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}
module.exports = {
    handleCreateSwap,
    handleGetReceivedSwaps,
    handleRespondToSwap,
    handleGetSentSwaps,
    handleCancelSwap
};
