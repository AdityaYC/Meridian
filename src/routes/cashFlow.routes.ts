import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import cashFlowService from '../services/cashFlow.service';

const router = Router();

// Get cash flow prediction
router.get('/predict', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { days = 30 } = req.query;
    // Convert days to months roughly
    const months = Math.ceil(Number(days) / 30);
    const forecast = await cashFlowService.getForecast(userId, months);
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cash flow prediction' });
  }
});

export default router;
