import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  createJob,
  deleteJob,
  getAllJobs,
  getCompanyJobs,
  getJobById,
  updateJob,
} from '../controllers/jobController.js';

const router = Router();

router.get('/', getAllJobs);
router.get('/company/my-jobs', authMiddleware, getCompanyJobs);
router.post('/', authMiddleware, createJob);
router.get('/:id', getJobById);
router.put('/:id', authMiddleware, updateJob);
router.delete('/:id', authMiddleware, deleteJob);

export default router;
