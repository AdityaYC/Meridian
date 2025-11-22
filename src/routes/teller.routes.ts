import { Router } from 'express';
import {
  getConnectUrl,
  handleConnection,
  syncAccount,
  getAccounts,
  handleWebhook,
  saveEnrollment,
} from '../controllers/teller.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/connect', authMiddleware, getConnectUrl);
router.post('/connect/callback', authMiddleware, handleConnection);
router.post('/enrollments', authMiddleware, saveEnrollment);
router.get('/accounts', authMiddleware, getAccounts);
router.post('/accounts/:accountId/sync', authMiddleware, syncAccount);
router.post('/webhook', handleWebhook);

export default router;
