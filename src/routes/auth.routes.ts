import { Router } from 'express';
import { 
  register, 
  login, 
  getProfile,
  registerValidation,
  loginValidation
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authMiddleware, getProfile);

export default router;
