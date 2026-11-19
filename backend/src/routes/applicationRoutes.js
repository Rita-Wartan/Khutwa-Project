import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  applyForJob,
  getJobApplicants,
  getMyApplications,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/applicationController.js';

const router = Router();

router.use(authMiddleware);
router.post('/', applyForJob);
router.get('/my', getMyApplications);
router.get('/job/:jobId', getJobApplicants);
router.put('/:id/status', updateApplicationStatus);
router.delete('/:id', withdrawApplication);

export default router;
