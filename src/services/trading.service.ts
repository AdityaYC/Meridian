import prisma from '../config/database';

class TradingService {
  async placeOrder(userId: string, orderData: any) {
    try {
      const { symbol, orderType, side, quantity, price, stopPrice } = orderData;

      // Create order in database (paper trading mode)
      const order = await prisma.tradingOrder.create({
        data: {
          userId,
          symbol,
          orderType,
          side,
          quantity,
          price,
          stopPrice,
          status: 'filled', // Auto-fill for paper trading
          filledPrice: price || 0,
          filledQuantity: quantity,
          filledAt: new Date(),
        },
      });

      // Update investment holdings
      if (side === 'buy') {
        const existing = await prisma.investment.findFirst({
          where: { userId, symbol },
        });

        if (existing) {
          const newQuantity = existing.quantity + quantity;
          const newAvgPrice = ((existing.purchasePrice * existing.quantity) + (price || 0) * quantity) / newQuantity;
          
          await prisma.investment.update({
            where: { id: existing.id },
            data: {
              quantity: newQuantity,
              purchasePrice: newAvgPrice,
              totalValue: newQuantity * (price || 0),
            },
          });
        } else {
          await prisma.investment.create({
            data: {
              userId,
              symbol,
              name: symbol,
              type: 'stock',
              quantity,
              purchasePrice: price || 0,
              currentPrice: price || 0,
              totalValue: quantity * (price || 0),
              gainLoss: 0,
              gainLossPercent: 0,
            } as any,
          });
        }
      } else if (side === 'sell') {
        const existing = await prisma.investment.findFirst({
          where: { userId, symbol },
        });

        if (existing) {
          const newQuantity = existing.quantity - quantity;
          if (newQuantity <= 0) {
            await prisma.investment.delete({ where: { id: existing.id } });
          } else {
            await prisma.investment.update({
              where: { id: existing.id },
              data: {
                quantity: newQuantity,
                totalValue: newQuantity * existing.currentPrice,
              },
            });
          }
        }
      }

      return order;
    } catch (error) {
      console.error('Place order error:', error);
      throw error;
    }
  }

  async getOrders(userId: string, limit = 50) {
    return prisma.tradingOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async cancelOrder(orderId: string, userId: string) {
    await prisma.tradingOrder.updateMany({
      where: { id: orderId, userId },
      data: { status: 'cancelled' },
    });
    return { success: true };
  }

  async getMarketData(symbol: string) {
    // Simulated market data - in production, use real API
    const basePrice = 150 + Math.random() * 50;
    const change = (Math.random() - 0.5) * 10;
    
    return {
      symbol,
      price: basePrice,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 10000000),
      high: basePrice + Math.random() * 5,
      low: basePrice - Math.random() * 5,
      open: basePrice - change,
      previousClose: basePrice - change,
    };
  }
}

export default new TradingService();
