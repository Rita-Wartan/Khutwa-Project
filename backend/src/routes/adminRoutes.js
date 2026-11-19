import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { deleteAdminCompany, deleteAdminJob, deleteAdminUser, getAdminCompanies, getAdminJobs, getAdminStatistics, getAdminUsers } from '../controllers/adminController.js';

const router = Router();

router.get('/statistics', authMiddleware, adminMiddleware, getAdminStatistics);
router.get('/users', authMiddleware, adminMiddleware, getAdminUsers);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteAdminUser);
router.get('/companies', authMiddleware, adminMiddleware, getAdminCompanies);
router.delete('/companies/:id', authMiddleware, adminMiddleware, deleteAdminCompany);
router.get('/jobs', authMiddleware, adminMiddleware, getAdminJobs);
router.delete('/jobs/:id', authMiddleware, adminMiddleware, deleteAdminJob);

export default router;
