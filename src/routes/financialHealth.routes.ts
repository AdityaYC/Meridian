import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import financialHealthService from '../services/financialHealth.service';

const router = Router();

// Get latest score (auto-calculate if doesn't exist)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    let score = await financialHealthService.getLatestScore(userId);
    
    // If no score exists, calculate it automatically
    if (!score) {
      score = await financialHealthService.calculateHealthScore(userId);
    }
    
    res.json(score);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get financial health score' });
  }
});

// Recalculate score
router.post('/calculate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const score = await financialHealthService.calculateHealthScore(userId);
    res.json(score);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate financial health score' });
  }
});

export default router;
