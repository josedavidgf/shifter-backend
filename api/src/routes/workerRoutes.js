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
    handleGetWorkerStats,
    completeOnboarding,
    initializeWorker,
    updateWorkerType,
    getSupervisedWorkers,
    getSupervisorByUserId
} = require('../controllers/workerController');

const protectRoute = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/init', protectRoute, initializeWorker);
router.get('/me', protectRoute, getMyWorkerProfile);
router.get('/me/full', protectRoute, getFullWorkerProfile);
router.get('/me/completion', protectRoute, checkWorkerOnboardingCompletion);
router.get('/me/stats', protectRoute, handleGetWorkerStats);
router.put('/me', protectRoute, updateWorkerInfo);
router.put('/me/hospital', protectRoute, updateWorkerHospital);
router.put('/me/speciality', protectRoute, updateWorkerSpeciality);
router.put('/me/type', protectRoute, updateWorkerType);

router.get('/', getAllWorkers);
router.get('/supervised', protectRoute, getSupervisedWorkers);
router.get('/supervisor/:userId', getSupervisorByUserId);


router.get('/:id', getWorkerById);
router.post('/', protectRoute,createWorker);
router.put('/:id', updateWorker);
router.delete('/:id', deleteWorker);

router.post('/hospitals', protectRoute, createWorkerHospital);
router.post('/specialities', protectRoute, createWorkerSpeciality);

router.patch('/complete-onboarding', protectRoute, completeOnboarding);


module.exports = router;
