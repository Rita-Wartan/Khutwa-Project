import { Router } from 'express';
import { loginCompany, registerCompany } from '../controllers/companyAuthController.js';

const router = Router();
router.post('/register', registerCompany);
router.post('/login', loginCompany);
export default router;
