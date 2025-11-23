import { Router } from 'express';
import {
  syncAccount,
  getAccounts,
  handleWebhook,
  saveEnrollment,
  deleteAccount,
} from '../controllers/teller.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/enrollments', authMiddleware, saveEnrollment);
router.get('/accounts', authMiddleware, getAccounts);
router.post('/accounts/:accountId/sync', authMiddleware, syncAccount);
router.delete('/accounts/:accountId', authMiddleware, deleteAccount);
router.post('/webhook', handleWebhook);

export default router;
