import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import wealthService from '../services/wealth.service';

const router = Router();

// Get roadmap (auto-initialize if doesn't exist)
router.get('/roadmap', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    // getRoadmap already auto-initializes if empty, so just call it
    const roadmap = await wealthService.getRoadmap(userId);
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get wealth roadmap' });
  }
});

// Initialize roadmap
router.post('/roadmap/initialize', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { targetNetWorth = 1000000 } = req.body;
    const roadmap = await wealthService.initializeRoadmap(userId, targetNetWorth);
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize roadmap' });
  }
});

export default router;
