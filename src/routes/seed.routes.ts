import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import seedMeridianData from '../scripts/seedMeridianData';

const router = Router();

// Seed Meridian data for current user
router.post('/meridian', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    await seedMeridianData(userId);
    res.json({ message: 'Meridian data seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed data' });
  }
});

export default router;
