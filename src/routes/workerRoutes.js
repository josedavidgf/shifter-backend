const express = require('express');
const {
  getAllWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
} = require('../controllers/workerController');

const router = express.Router();

router.get('/', getAllWorkers);
router.get('/:id', getWorkerById);
router.post('/', createWorker);
router.put('/:id', updateWorker);
router.delete('/:id', deleteWorker);

module.exports = router;
