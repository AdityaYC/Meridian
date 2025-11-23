import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import taxService from '../services/tax.service';

const router = Router();

// Get tax deductions
router.get('/deductions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { year = new Date().getFullYear() } = req.query;
    const deductions = await taxService.identifyDeductions(userId, Number(year));
    res.json(deductions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tax deductions' });
  }
});

// Estimate quarterly tax
router.get('/quarterly', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const estimate = await taxService.estimateQuarterlyTax(userId);
    res.json(estimate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to estimate quarterly tax' });
  }
});

// Generate tax report
router.get('/report', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { year = new Date().getFullYear() } = req.query;
    const report = await taxService.generateTaxReport(userId, Number(year));
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate tax report' });
  }
});

export default router;
