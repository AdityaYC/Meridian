import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import billPayService from '../services/billPay.service';

const router = Router();

// Create bill
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const bill = await billPayService.createBill(userId, req.body);
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

// Get bills
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const bills = await billPayService.getUserBills(userId);
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bills' });
  }
});

// Pay bill
router.post('/:id/pay', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    await billPayService.payBill(id, userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to pay bill' });
  }
});

// Detect recurring
router.get('/detect', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const suggestions = await billPayService.detectRecurringBills(userId);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to detect recurring bills' });
  }
});

export default router;
