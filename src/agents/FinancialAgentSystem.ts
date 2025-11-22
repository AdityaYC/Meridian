import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import {
    marketResearchTool,
    newsAnalysisTool,
    insiderTradingTool,
} from './tools/marketTools';
import {
    executeInvestmentTool,
    getPortfolioTool,
} from './tools/tradingTools';
import {
    getUserFinancesTool,
    manageBudgetTool,
} from './tools/userFinanceTools';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Research Agent (uses GPT-4 for tool calling)
export class ResearchAgent {
    private tools = [marketResearchTool, newsAnalysisTool, insiderTradingTool];

    async analyze(query: string) {
        const messages = [
            {
                role: 'system' as const,
                content: `You are a financial research analyst. Research stocks, analyze news, and track insider trading. Provide objective, data-driven analysis with specific metrics and risk assessment.`,
            },
            {
                role: 'user' as const,
                content: query,
            },
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            tools: this.tools.map(t => ({
                type: 'function' as const,
                function: {
                    name: t.id,
                    description: t.description,
                    parameters: t.parameters,
                },
            })),
            tool_choice: 'auto' as const,
        });

        const message = response.choices[0].message;

        // Execute tool calls
        if (message.tool_calls) {
            const toolResults = await Promise.all(
                message.tool_calls.map(async (toolCall: any) => {
                    const tool = this.tools.find(t => t.id === toolCall.function.name);
                    if (tool) {
                        const args = JSON.parse(toolCall.function.arguments);
                        const result = await tool.execute(args);
                        return { toolCall, result };
                    }
                    return null;
                })
            );

            // Get final synthesis
            const synthesisMessages = [
                ...messages,
                message,
                ...toolResults.map((tr) => ({
                    role: 'tool' as const,
                    tool_call_id: tr!.toolCall.id,
                    content: JSON.stringify(tr!.result),
                })),
            ];

            const finalResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: synthesisMessages,
            });

            return {
                analysis: finalResponse.choices[0].message.content,
                data: toolResults.map(tr => tr!.result),
            };
        }

        return { analysis: message.content, data: [] };
    }
}

// Investment Decision Agent (uses Claude for reasoning)
export class InvestmentAgent {
    private tools = [executeInvestmentTool, getPortfolioTool];

    async makeDecision(researchData: any, userQuery: string, userId: string) {
        const prompt = `You are an expert investment manager named Raj. Based on the research data below, make an investment recommendation.

RESEARCH DATA:
${JSON.stringify(researchData, null, 2)}

USER QUERY: ${userQuery}

CRITICAL RULES:
1. NEVER execute trades without explicit user confirmation
2. Always explain risks clearly
3. Consider user's portfolio and available capital
4. Provide specific entry points and position sizing
5. Recommend diversification

Provide your recommendation in this format:
- Stock Analysis: [2-3 sentences]
- Recommendation: [BUY/SELL/HOLD with quantity]
- Risk Level: [Low/Medium/High]
- Rationale: [2-3 sentences]
- Action Required: [What user needs to confirm]

Keep response concise (under 150 words).`;

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 500,
            messages: [{ role: 'user', content: prompt }],
        });

        const recommendation = response.content[0].type === 'text' ? response.content[0].text : '';

        return { recommendation };
    }

    async executeIfConfirmed(tradeParams: any) {
        if (tradeParams.userConfirmed) {
            const result = await executeInvestmentTool.execute(tradeParams);
            return result;
        }
        return {
            requiresConfirmation: true,
            message: 'Please confirm to execute this trade.',
        };
    }
}

// Financial Advisor Agent (uses Claude for empathetic advice)
export class FinancialAdvisorAgent {
    private tools = [getUserFinancesTool, manageBudgetTool];

    async advise(query: string, userId: string) {
        // First get user's financial data
        const financialData = await getUserFinancesTool.execute({ userId, dataType: 'all' });

        const prompt = `You are Raj, a warm and professional financial advisor. A user asked: "${query}"

USER'S FINANCIAL DATA:
${JSON.stringify(financialData, null, 2)}

Provide personalized advice based on their actual data:
- Reference specific numbers from their finances
- Keep response to 2-4 sentences
- Be encouraging and actionable
- Focus on one clear recommendation

Response:`;

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 300,
            messages: [{ role: 'user', content: prompt }],
        });

        const advice = response.content[0].type === 'text' ? response.content[0].text : '';

        return { advice, data: financialData };
    }
}

// Orchestrator (routes to appropriate agent)
export class AgentOrchestrator {
    private researchAgent = new ResearchAgent();
    private investmentAgent = new InvestmentAgent();
    private advisorAgent = new FinancialAdvisorAgent();

    async process(query: string, userId: string) {
        const queryLower = query.toLowerCase();

        // Determine which agent(s) to use
        const needsResearch =
            queryLower.includes('stock') ||
            queryLower.includes('invest') ||
            queryLower.includes('buy') ||
            queryLower.includes('sell') ||
            queryLower.includes('news') ||
            queryLower.includes('insider');

        const needsInvestment =
            queryLower.includes('invest') ||
            queryLower.includes('buy') ||
            queryLower.includes('sell') ||
            queryLower.includes('trade');

        const needsFinancialAdvice =
            queryLower.includes('spend') ||
            queryLower.includes('budget') ||
            queryLower.includes('save') ||
            queryLower.includes('money') ||
            queryLower.includes('balance') ||
            queryLower.includes('transaction');

        // Investment flow: Research → Decide → Execute
        if (needsInvestment && needsResearch) {
            // Step 1: Research
            const research = await this.researchAgent.analyze(query);

            // Step 2: Make decision
            const decision = await this.investmentAgent.makeDecision(research, query, userId);

            return {
                type: 'investment',
                research: research.data,
                recommendation: decision.recommendation,
                requiresConfirmation: true,
            };
        }

        // Pure research query
        if (needsResearch && !needsInvestment) {
            const research = await this.researchAgent.analyze(query);
            return {
                type: 'research',
                response: research.analysis,
                data: research.data,
            };
        }

        // Financial advice query
        if (needsFinancialAdvice) {
            const advice = await this.advisorAgent.advise(query, userId);
            return {
                type: 'advice',
                response: advice.advice,
                data: advice.data,
            };
        }

        // Default: Financial advice
        const advice = await this.advisorAgent.advise(query, userId);
        return {
            type: 'advice',
            response: advice.advice,
        };
    }
}

export const orchestrator = new AgentOrchestrator();
