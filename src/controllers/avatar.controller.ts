import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateFinancialInsight } from '../services/ai.service';
import { generateSpeech } from '../services/avatar.service';

const prisma = new PrismaClient();

export const chatWithAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    await prisma.chatMessage.create({
      data: { userId, role: 'user', content: message },
    });

    const aiResponse = await generateFinancialInsight(userId, message);

    const audioUrl = await generateSpeech(aiResponse, 'cheerful');

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        userId,
        role: 'assistant',
        content: aiResponse,
        audioUrl,
      },
    });

    res.json({
      message: aiResponse,
      audioUrl,
      messageId: assistantMessage.id,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 50;

    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};
