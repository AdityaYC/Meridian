export const executeInvestmentTool = {
    id: 'execute_investment',
    description: 'Execute a stock trade (buy/sell). CRITICAL: Always get explicit user confirmation before executing.',
    parameters: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['buy', 'sell'],
                description: 'Trade action',
            },
            ticker: {
                type: 'string',
                description: 'Stock ticker symbol',
            },
            quantity: {
                type: 'number',
                description: 'Number of shares',
            },
            orderType: {
                type: 'string',
                enum: ['market', 'limit'],
                description: 'Order type (default: market)',
            },
            limitPrice: {
                type: 'number',
                description: 'Limit price (required if orderType is limit)',
            },
            userConfirmed: {
                type: 'boolean',
                description: 'User has explicitly confirmed this trade',
            },
        },
        required: ['action', 'ticker', 'quantity', 'userConfirmed'],
    },
    execute: async ({ action, ticker, quantity, orderType = 'market', limitPrice, userConfirmed }: any) => {
        if (!userConfirmed) {
            return {
                requiresConfirmation: true,
                message: `I need your explicit confirmation to ${action.toUpperCase()} ${quantity} shares of ${ticker.toUpperCase()}. Say "yes, execute" or "confirm" to proceed.`,
            };
        }

        try {
            const Alpaca = require('@alpacahq/alpaca-trade-api');
            const alpaca = new Alpaca({
                keyId: process.env.ALPACA_API_KEY,
                secretKey: process.env.ALPACA_SECRET_KEY,
                paper: process.env.ALPACA_PAPER === 'true',
            });

            // Check if market is open
            const clock = await alpaca.getClock();
            if (!clock.is_open) {
                return {
                    success: false,
                    message: 'Market is currently closed. Order will be queued for next open.',
                };
            }

            const orderParams: any = {
                symbol: ticker.toUpperCase(),
                qty: quantity,
                side: action,
                type: orderType,
                time_in_force: 'day',
            };

            if (orderType === 'limit' && limitPrice) {
                orderParams.limit_price = limitPrice;
            }

            const order = await alpaca.createOrder(orderParams);

            // Get estimated cost
            const quote = await alpaca.getLatestTrade(ticker.toUpperCase());
            const estimatedCost = quantity * quote.Price;

            return {
                success: true,
                order: {
                    id: order.id,
                    status: order.status,
                    symbol: ticker.toUpperCase(),
                    action: action.toUpperCase(),
                    quantity,
                    orderType,
                    estimatedCost: `$${estimatedCost.toFixed(2)}`,
                    submittedAt: new Date(order.submitted_at).toLocaleString(),
                },
                message: `✅ ${action.toUpperCase()} order placed: ${quantity} shares of ${ticker.toUpperCase()} at ${orderType} price.`,
            };
        } catch (error: any) {
            return {
                success: false,
                error: `Trade execution failed: ${error.message}`,
            };
        }
    },
};

export const getPortfolioTool = {
    id: 'get_portfolio',
    description: 'Get user\'s current investment portfolio and positions',
    parameters: {
        type: 'object',
        properties: {},
    },
    execute: async () => {
        try {
            const Alpaca = require('@alpacahq/alpaca-trade-api');
            const alpaca = new Alpaca({
                keyId: process.env.ALPACA_API_KEY,
                secretKey: process.env.ALPACA_SECRET_KEY,
                paper: process.env.ALPACA_PAPER === 'true',
            });

            const [account, positions] = await Promise.all([
                alpaca.getAccount(),
                alpaca.getPositions(),
            ]);

            return {
                account: {
                    cash: `$${parseFloat(account.cash).toFixed(2)}`,
                    portfolioValue: `$${parseFloat(account.portfolio_value).toFixed(2)}`,
                    buyingPower: `$${parseFloat(account.buying_power).toFixed(2)}`,
                    dayTradeCount: account.daytrade_count,
                },
                positions: positions.map((p: any) => ({
                    symbol: p.symbol,
                    quantity: p.qty,
                    avgEntryPrice: `$${parseFloat(p.avg_entry_price).toFixed(2)}`,
                    currentPrice: `$${parseFloat(p.current_price).toFixed(2)}`,
                    marketValue: `$${parseFloat(p.market_value).toFixed(2)}`,
                    unrealizedPL: `$${parseFloat(p.unrealized_pl).toFixed(2)}`,
                    unrealizedPLPercent: `${(parseFloat(p.unrealized_plpc) * 100).toFixed(2)}%`,
                })),
                totalPositions: positions.length,
            };
        } catch (error: any) {
            return { error: `Portfolio fetch failed: ${error.message}` };
        }
    },
};
