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
    getWorkerStatusOverview
} = require('../controllers/workerController');

const protectRoute = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/me', protectRoute, getMyWorkerProfile);
router.get('/me/full', protectRoute, getFullWorkerProfile);
router.get('/me/completion', protectRoute, checkWorkerOnboardingCompletion);
router.get('/me/stats', protectRoute, handleGetWorkerStats);
router.put('/me', protectRoute, updateWorkerInfo);
router.put('/me/hospital', protectRoute, updateWorkerHospital);
router.put('/me/speciality', protectRoute, updateWorkerSpeciality);

router.get('/post-login-check', protectRoute, getWorkerStatusOverview);

router.get('/', getAllWorkers);
router.get('/:id', getWorkerById);
router.post('/', protectRoute,createWorker);
router.put('/:id', updateWorker);
router.delete('/:id', deleteWorker);

router.post('/hospitals', protectRoute, createWorkerHospital);
router.post('/specialities', protectRoute, createWorkerSpeciality);

router.patch('/complete-onboarding', protectRoute, completeOnboarding);




module.exports = router;
