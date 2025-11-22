import { Router } from 'express';
import { getInvestments, addInvestment } from '../controllers/investment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getInvestments);
router.post('/', authMiddleware, addInvestment);

export default router;
