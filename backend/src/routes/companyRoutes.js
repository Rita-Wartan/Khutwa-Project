import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getCompanyProfile, updateCompanyProfile } from '../controllers/companyController.js';

const router = Router();

router.route('/profile')
  .get(authMiddleware, getCompanyProfile)
  .put(authMiddleware, updateCompanyProfile);

export default router;
