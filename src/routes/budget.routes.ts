import { Router } from 'express';
import { createBudget, getBudgets, updateBudget, deleteBudget } from '../controllers/budget.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createBudget);
router.get('/', authMiddleware, getBudgets);
router.put('/:budgetId', authMiddleware, updateBudget);
router.delete('/:budgetId', authMiddleware, deleteBudget);

export default router;
