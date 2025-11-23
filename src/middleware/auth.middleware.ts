import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth failed: No token provided', { authHeader });
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    // console.log('Verifying token:', token.substring(0, 10) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Auth failed: Invalid token', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
