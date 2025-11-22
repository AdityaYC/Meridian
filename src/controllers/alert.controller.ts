import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const unreadOnly = req.query.unread === 'true';

    const alerts = await prisma.alert.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

export const markAlertRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { alertId } = req.params;

    const alert = await prisma.alert.updateMany({
      where: { id: alertId, userId },
      data: { isRead: true },
    });

    if (alert.count === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    console.error('Mark alert error:', error);
    res.status(500).json({ error: 'Failed to mark alert' });
  }
};

export const markAllRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    await prisma.alert.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all alerts' });
  }
};
