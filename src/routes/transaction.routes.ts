import { Router } from 'express';
import { getTransactions, getTransaction } from '../controllers/transaction.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getTransactions);
router.get('/:transactionId', authMiddleware, getTransaction);

export default router;
