import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import smartBudgetService from '../services/smartBudget.service';

const router = Router();

// Get budget
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { month } = req.query;
    const budget = await smartBudgetService.getBudget(userId, month as string);
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get budget' });
  }
});

// Create budget
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { month, categories } = req.body;
    const budget = await smartBudgetService.createBudget(userId, month, categories);
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// Get suggestions
router.get('/suggestions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { month } = req.query;
    const suggestions = await smartBudgetService.getSuggestedAdjustments(userId, month as string);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get budget suggestions' });
  }
});

export default router;
