import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import tradingService from '../services/trading.service';
import weeklyReportsService from '../services/weeklyReports.service';
import debtPayoffService from '../services/debtPayoff.service';
import rebalancingService from '../services/rebalancing.service';
import creditScoreService from '../services/creditScore.service';
import retirementService from '../services/retirement.service';

const router = Router();

// ============ TRADING ============
router.post('/trading/orders', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const order = await tradingService.placeOrder(userId, req.body);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trading/orders', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const orders = await tradingService.getOrders(userId);
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/trading/orders/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const result = await tradingService.cancelOrder(req.params.id, userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trading/market/:symbol', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = await tradingService.getMarketData(req.params.symbol);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ WEEKLY REPORTS ============
router.get('/reports/weekly', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const reports = await weeklyReportsService.getWeeklyReports(userId);
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reports/weekly/generate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const report = await weeklyReportsService.generateWeeklyReport(userId);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DEBT PAYOFF ============
router.get('/debt/accounts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const accounts = await debtPayoffService.getDebtAccounts(userId);
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/debt/accounts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const account = await debtPayoffService.createDebtAccount(userId, req.body);
    res.json(account);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/debt/payoff-plan', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { monthlyPayment, strategy = 'avalanche' } = req.body;
    const plan = await debtPayoffService.calculatePayoffPlan(userId, monthlyPayment, strategy);
    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ REBALANCING ============
router.get('/rebalancing/targets', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const targets = await rebalancingService.getTargetAllocation(userId);
    res.json(targets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/rebalancing/targets', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const targets = await rebalancingService.setTargetAllocation(userId, req.body);
    res.json(targets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/rebalancing/check', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const check = await rebalancingService.checkRebalanceNeeded(userId);
    res.json(check);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/rebalancing/plan', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const plan = await rebalancingService.generateRebalancingPlan(userId);
    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CREDIT SCORE ============
router.get('/credit/score', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const score = await creditScoreService.getCreditScore(userId);
    res.json(score);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/credit/score/simulate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const score = await creditScoreService.simulateCreditScore(userId);
    res.json(score);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/credit/history', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const history = await creditScoreService.getScoreHistory(userId);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ RETIREMENT ============
router.post('/retirement/plan', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const plan = await retirementService.createRetirementPlan(userId, req.body);
    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/retirement/plan', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const plan = await retirementService.getRetirementPlan(userId);
    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/retirement/optimize', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const optimization = await retirementService.optimizeContributions(userId);
    res.json(optimization);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
