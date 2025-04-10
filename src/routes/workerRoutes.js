const express = require('express');
const {
  getAllWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
  createWorkerHospital,
  createWorkerSpeciality,
  getMyWorkerProfile,
  checkWorkerOnboardingCompletion,
} = require('../controllers/workerController');
const protectRoute = require('../middlewares/authMiddleware');
const router = express.Router();
router.get('/me', protectRoute, getMyWorkerProfile);
router.get('/me/completion', protectRoute, checkWorkerOnboardingCompletion);


router.get('/', getAllWorkers);
router.get('/:id', getWorkerById);
router.post('/', protectRoute,createWorker);
router.put('/:id', updateWorker);
router.delete('/:id', deleteWorker);

router.post('/hospitals', protectRoute, createWorkerHospital);
router.post('/specialities', protectRoute, createWorkerSpeciality);


module.exports = router;
