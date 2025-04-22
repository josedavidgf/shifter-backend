const { getSwapByIdService,createSwapWithMatching } = require('../services/swapService');
const { getShiftWithOwnerEmail } = require('../services/shiftService');
const { getWorkerByUserId } = require('../services/workerService');
const {
    getSwapsForMyShifts,
    cancelSwap,
    respondToSwap,
    getSwapsByRequesterId,
    getSwapsByShiftIdService,
    getSwapsAcceptedForMyShifts,
} = require('../services/swapService');
const { sendSwapProposalEmail } = require('../services/emailService');


async function handleCreateSwap(req, res) {
    try {
        const userId = req.user.sub;
        const worker = await getWorkerByUserId(userId);
        if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

        const { shift_id, offered_date, offered_type, offered_label, swap_comments } = req.body;
        const today = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
        if (offered_date < today) {
            return res.status(400).json({ success: false, message: 'La fecha del swap no puede ser anterior a hoy.' });
        }

        // 🚀 Crea swap usando lógica de matching
        const swap = await createSwapWithMatching({
            shift_id,
            requester_id: worker.worker_id,
            offered_date,
            offered_type,
            offered_label,
            swap_comments,
        });

        console.log('🟢 Swap creado:', swap);

        // 🔍 Solo enviar email de propuesta si el estado sigue en 'proposed'
        if (swap.status === 'proposed') {
            const shift = await getShiftWithOwnerEmail(shift_id);
            if (!shift || !shift.owner_email) {
                console.warn('⚠️ No se pudo obtener el email del receptor');
                return res.status(201).json({ success: true, data: swap });
            }
            if (!shift || !shift.owner_user_id) {
                console.warn('⚠️ No se pudo obtener el userId del receptor');
                return res.status(201).json({ success: true, data: swap });
            }

            // Enviar correo al trabajador con la propuesta de swap
            await sendSwapProposalEmail(
                shift.owner_user_id,
                shift.owner_email,
                shift.owner_name,
                shift.owner_surnname,
                shift,
                {
                    requester_email: worker.email,
                    requester_name: worker.name,
                    requester_surname: worker.surname,
                    offered_date,
                    offered_type,
                    offered_label,
                    swap_comments,
                }
            );
        }

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
        if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

        const swaps = await getSwapsForMyShifts(worker.worker_id);
        res.json({ success: true, data: swaps });
    } catch (err) {
        console.error('❌ Error al cargar swaps recibidos:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}

async function handleGetAcceptedSwaps(req, res) {
    try {
        const userId = req.user.sub;
        const worker = await getWorkerByUserId(userId);
        if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

        const swaps = await getSwapsAcceptedForMyShifts(worker.worker_id);
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



async function handleGetSwapsById(req, res) {
    const swapId = req.params.id;
    const userId = req.user.sub;

    try {
        const swap = await getSwapByIdService(swapId, userId);
        console.log('🟢🟢🟢 Swap encontrado:', swap);
        return res.json({ data: swap });
    } catch (err) {
        const code = err.status || 500;
        return res.status(code).json({ error: err.message });
    }
}
async function handleGetSwapsByShiftId(req, res) {
    const shiftId = req.params.shiftId;
    try {
      const swaps = await getSwapsByShiftIdService(shiftId);
      return res.json({ data: swaps });
    } catch (err) {
      console.error('❌ Error al obtener swaps por turno:', err.message);
      return res.status(500).json({ error: 'No se pudieron cargar los intercambios para este turno' });
    }
  }

module.exports = {
    handleCreateSwap,
    handleGetReceivedSwaps,
    handleRespondToSwap,
    handleGetSentSwaps,
    handleCancelSwap,
    handleGetSwapsById,
    handleGetSwapsByShiftId,
    handleGetAcceptedSwaps,
};
