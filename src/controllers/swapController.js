const { createSwap } = require('../services/swapService');
const { getWorkerByUserId } = require('../services/workerService');
const { getSwapsForMyShifts } = require('../services/swapService');

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

module.exports = {
    handleCreateSwap,
    handleGetReceivedSwaps,
};
