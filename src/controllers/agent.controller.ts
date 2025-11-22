import { Request, Response } from 'express';
import { orchestrator } from '../agents/FinancialAgentSystem';

export const processAgentRequest = async (req: Request, res: Response) => {
    try {
        const { query, userId } = req.body;

        // If userId is not provided in body, try to get it from the authenticated request
        const effectiveUserId = userId || (req as any).userId;

        if (!query || !effectiveUserId) {
            return res.status(400).json({ error: 'Missing query or userId' });
        }

        const result = await orchestrator.process(query, effectiveUserId);

        return res.json({
            success: true,
            result,
        });
    } catch (error: any) {
        console.error('Agent error:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error',
        });
    }
};
