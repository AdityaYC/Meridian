import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateSavingsReport } from '../controllers/ai-insights.controller';

const router = express.Router();

// Generate AI savings report
router.get('/savings-report', authMiddleware, generateSavingsReport);

export default router;
