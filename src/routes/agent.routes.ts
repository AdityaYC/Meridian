import { Router } from 'express';
import { processAgentRequest } from '../controllers/agent.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Process agent request
// We use authMiddleware to ensure we have the user context, but allow passing userId in body for flexibility if needed
router.post('/route', authMiddleware, processAgentRequest);

export default router;
