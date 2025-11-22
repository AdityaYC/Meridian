import { Router } from 'express';
import { chatWithAvatar, getChatHistory } from '../controllers/avatar.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/chat', authMiddleware, chatWithAvatar);
router.get('/history', authMiddleware, getChatHistory);

export default router;
