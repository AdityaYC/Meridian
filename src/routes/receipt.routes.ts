import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import receiptService from '../services/receipt.service';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload and process receipt
router.post('/upload', authMiddleware, upload.single('image'), async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const result = await receiptService.processReceipt(req.file.buffer, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process receipt' });
  }
});

// Save receipt
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { imageUrl, receiptData, transactionId } = req.body;
    const result = await receiptService.saveReceipt(userId, imageUrl, receiptData, transactionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save receipt' });
  }
});

export default router;
