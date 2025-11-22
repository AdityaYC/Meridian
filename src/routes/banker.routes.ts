import { Router } from 'express';
import { getBankerContext, processBankerQuery, createConversation, endConversation, getPersona, generateVideo, getVideoStatus } from '../controllers/banker.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Synthesia routes
router.post('/video', authMiddleware, generateVideo);
router.get('/video/:videoId', authMiddleware, getVideoStatus);

// Get financial context for Raj
router.get('/context', authMiddleware, getBankerContext);

// Get Persona details (Avatar, etc)
router.get('/persona', authMiddleware, getPersona);

// Create conversation
router.post('/conversation', createConversation);

// End conversation
router.post('/conversation/end', authMiddleware, endConversation);

// Process banker query (called by Tavus)
router.post('/query', authMiddleware, processBankerQuery);

export default router;
