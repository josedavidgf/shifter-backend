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
    getFullWorkerProfile,
    updateWorkerInfo,
    updateWorkerHospital,
    updateWorkerSpeciality,
} = require('../controllers/workerController');

const protectRoute = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/me', protectRoute, getMyWorkerProfile);
router.get('/me/full', protectRoute, getFullWorkerProfile);
router.get('/me/completion', protectRoute, checkWorkerOnboardingCompletion);
router.put('/me', protectRoute, updateWorkerInfo);
router.put('/me/hospital', protectRoute, updateWorkerHospital);
router.put('/me/speciality', protectRoute, updateWorkerSpeciality);


router.get('/', getAllWorkers);
router.get('/:id', getWorkerById);
router.post('/', protectRoute,createWorker);
router.put('/:id', updateWorker);
router.delete('/:id', deleteWorker);

router.post('/hospitals', protectRoute, createWorkerHospital);
router.post('/specialities', protectRoute, createWorkerSpeciality);


module.exports = router;
