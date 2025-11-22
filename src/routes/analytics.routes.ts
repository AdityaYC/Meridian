import { Router } from 'express';
import { getSpendingByCategory, getMonthlyTrends } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/spending', authMiddleware, getSpendingByCategory);
router.get('/trends', authMiddleware, getMonthlyTrends);

export default router;
