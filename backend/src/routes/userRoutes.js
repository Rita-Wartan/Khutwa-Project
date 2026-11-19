import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getProfile, updateProfile } from '../controllers/userController.js';

const router = Router();

router.route('/profile')
  .get(authMiddleware, getProfile)
  .put(authMiddleware, updateProfile);

export default router;
