import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// WebSocket Setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store io globally
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
import authRoutes from './routes/auth.routes';
import tellerRoutes from './routes/teller.routes';
import transactionRoutes from './routes/transaction.routes';
import aiRoutes from './routes/ai.routes';
import avatarRoutes from './routes/avatar.routes';
import investmentRoutes from './routes/investment.routes';
import alertRoutes from './routes/alert.routes';
import budgetRoutes from './routes/budget.routes';
import analyticsRoutes from './routes/analytics.routes';
import bankerRoutes from './routes/banker.routes';
import agentRoutes from './routes/agent.routes';
import aiInsightsRoutes from './routes/ai-insights.routes';
import portfolioRoutes from './routes/portfolio.routes';
import chatRoutes from './routes/chat.routes';

app.use('/api/auth', authRoutes);
app.use('/api/teller', tellerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/banker', bankerRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/ai-insights', aiInsightsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Finance Buddy API is running',
    timestamp: new Date().toISOString()
  });
});

// WebSocket authentication and connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    (socket as any).userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = (socket as any).userId;
  console.log(`✅ Client connected: ${socket.id} (User: ${userId})`);

  // Join user-specific room
  socket.join(userId);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket ready for real-time updates`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
