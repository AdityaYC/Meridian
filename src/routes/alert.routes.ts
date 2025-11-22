import { Router } from 'express';
import { getAlerts, markAlertRead, markAllRead } from '../controllers/alert.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getAlerts);
router.patch('/:alertId/read', authMiddleware, markAlertRead);
router.patch('/read-all', authMiddleware, markAllRead);

export default router;
