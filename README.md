# 🌟 Meridian - AI-Powered Personal Finance Platform

A comprehensive full-stack financial management platform with real-time banking integration, AI-powered insights, live trading, and an intelligent chatbot financial advisor powered by Google Gemini.

## ✨ Features

### 🏦 Banking & Transactions
- ✅ **Real-time Banking** - Connect Chase, BofA, Wells Fargo, Amex via Teller API
- ✅ **AI Categorization** - Gemini-powered transaction categorization
- ✅ **Receipt Scanning** - OCR + AI extraction of receipt data
- ✅ **Bill Payment** - Automated bill tracking and payment reminders
- ✅ **Cash Flow Prediction** - ML-based cash flow forecasting

### 🤖 AI Financial Advisor
- ✅ **Michael - Your AI CFP®** - Intelligent chatbot with access to your financial data
- ✅ **Natural Language Queries** - Ask about spending, budgets, and investments
- ✅ **Personalized Insights** - Context-aware financial advice
- ✅ **Real-time Analysis** - Instant analysis of your financial health

### 📊 Premium Meridian Features
- ✅ **Financial Health Score** - Comprehensive scoring across multiple dimensions
- ✅ **Weekly AI Reports** - Automated financial digest with insights
- ✅ **Debt Payoff Planner** - Optimized debt elimination strategies
- ✅ **Portfolio Rebalancing** - Automated investment rebalancing alerts
- ✅ **Credit Score Monitoring** - Track and improve your credit score
- ✅ **Retirement Calculator** - Plan your financial future
- ✅ **Tax Insights** - Identify deductions and tax-saving opportunities
- ✅ **Wealth Roadmap** - Personalized financial milestones

### 📈 Trading & Investments
- ✅ **Real-time Stock Trading** - Live market data and order execution
- ✅ **Portfolio Analytics** - Advanced portfolio tracking and analysis
- ✅ **AI Stock Predictions** - Gemini-powered market analysis
- ✅ **Insider Trading Alerts** - Track insider activity
- ✅ **Market News** - Real-time financial news integration

### 🔔 Smart Notifications
- ✅ **WebSocket Real-time Updates** - Instant transaction and alert notifications
- ✅ **Fraud Detection** - Automatic alerts for suspicious activity
- ✅ **Budget Alerts** - Spending limit notifications
- ✅ **Bill Reminders** - Never miss a payment

### 🎨 Modern UI/UX
- ✅ **Beautiful Dashboard** - Clean, intuitive interface
- ✅ **Dark Mode** - Full dark mode support
- ✅ **Responsive Design** - Works on all devices
- ✅ **Real-time Charts** - Interactive data visualizations

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- API Keys (see below)

## 🔑 Required API Keys

### 1. Teller API (Banking)
- Sign up: https://teller.io/register
- Get your `TELLER_APP_ID` and `TELLER_API_KEY`
- Use sandbox mode for testing

### 2. Google Gemini API (AI Features)
- Sign up: https://makersuite.google.com
- Create API key: https://makersuite.google.com/app/apikey
- Get your `GEMINI_API_KEY`
- **Note**: The chatbot and AI features use Gemini 2.0 Flash model

### 3. Alpaca API (Stock Trading)
- Sign up: https://alpaca.markets
- Get your `ALPACA_API_KEY` and `ALPACA_SECRET_KEY`
- Use paper trading for testing

### 4. News API (Market News)
- Sign up: https://newsapi.org
- Get your `NEWS_API_KEY`

### 5. PostgreSQL Database
Choose one:
- **Railway**: https://railway.app (Free tier available)
- **Supabase**: https://supabase.com (Free tier available)
- **Local**: Install PostgreSQL locally

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/AdityaYC/Meridian.git
cd Meridian
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd finance-buddy-frontend
npm install
cd ..
```

### 4. Configure Environment Variables

Create `.env` file in the root directory:

```env
# Server
PORT=3001
NODE_ENV=development

# Database (example for Railway/Supabase)
DATABASE_URL="postgresql://username:password@host:5432/meridian?schema=public"

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_change_in_production

# Teller API (Banking)
TELLER_APP_ID=your_teller_app_id
TELLER_API_KEY=your_teller_api_key
TELLER_ENVIRONMENT=sandbox
TELLER_WEBHOOK_SECRET=your_webhook_secret
TELLER_CERT_PATH=./certs/certificate.pem
TELLER_KEY_PATH=./certs/private_key.pem

# Google Gemini API (AI Chatbot & Features)
GEMINI_API_KEY=your_gemini_api_key

# Alpaca API (Stock Trading)
ALPACA_API_KEY=your_alpaca_api_key
ALPACA_SECRET_KEY=your_alpaca_secret_key
ALPACA_BASE_URL=https://paper-api.alpaca.markets

# News API
NEWS_API_KEY=your_news_api_key

# Frontend
FRONTEND_URL=http://localhost:5174
```

Create `finance-buddy-frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

### 5. Setup Database
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed demo data
npx ts-node src/scripts/seedMeridianData.ts

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 6. Start Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev
```
Backend will start on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd finance-buddy-frontend
npm run dev
```
Frontend will start on `http://localhost:5174`

### 7. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Banking (Teller Integration)
- `GET /api/teller/connect` - Get Teller Connect URL
- `POST /api/teller/connect/callback` - Handle bank connection
- `GET /api/teller/accounts` - Get connected accounts
- `POST /api/teller/accounts/:id/sync` - Sync account transactions
- `POST /api/teller/webhook` - Teller webhook endpoint

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `GET /api/transactions/:id` - Get single transaction

### AI Chatbot
- `POST /api/chat/financial-assistant` - Chat with Michael (AI Financial Advisor)
- Access via chat widget in the dashboard

### Premium Features
- `GET /api/financial-health` - Get financial health score
- `GET /api/cash-flow/predict` - Get cash flow predictions
- `GET /api/premium/reports/weekly` - Get weekly AI reports
- `POST /api/premium/reports/weekly/generate` - Generate new report
- `GET /api/premium/debt/accounts` - Get debt accounts
- `POST /api/premium/debt/payoff-plan` - Calculate debt payoff plan
- `GET /api/premium/rebalancing/check` - Check portfolio rebalancing
- `GET /api/premium/credit/score` - Get credit score
- `GET /api/premium/retirement/plan` - Get retirement plan
- `POST /api/premium/retirement/plan` - Update retirement plan

### Trading
- `GET /api/portfolio/stocks` - Get stock portfolio
- `POST /api/portfolio/stocks/buy` - Buy stocks
- `POST /api/portfolio/stocks/sell` - Sell stocks
- `GET /api/portfolio/stocks/:symbol/quote` - Get stock quote
- `GET /api/portfolio/stocks/:symbol/predict` - Get AI price prediction

### Bills & Receipts
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create bill
- `POST /api/receipts/scan` - Scan receipt (upload image)

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read

### Alerts
- `GET /api/alerts` - Get all alerts
- `PATCH /api/alerts/:id/read` - Mark alert as read
- `PATCH /api/alerts/read-all` - Mark all alerts as read

### Budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets` - Get all budgets
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Analytics
- `GET /api/analytics/spending?days=30` - Get spending by category
- `GET /api/analytics/trends?months=6` - Get monthly income/expense trends

### Investments
- `GET /api/investments` - Get all investments
- `POST /api/investments` - Add investment

### Health Check
- `GET /health` - API health status

## 🔌 WebSocket Events

Connect to WebSocket with JWT token:
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});

// Listen for events
socket.on('new_transaction', (data) => {
  console.log('New transaction:', data);
});

socket.on('alert', (alert) => {
  console.log('New alert:', alert);
});
```

## 🗂️ Project Structure

```
Meridian/
├── finance-buddy-frontend/    # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── ChatWidget.tsx # AI Chatbot widget
│   │   │   ├── layout/        # Layout components
│   │   │   └── modals/        # Modal dialogs
│   │   ├── pages/             # Page components
│   │   │   ├── dashboard/     # Dashboard pages
│   │   │   │   ├── MeridianDashboard.tsx
│   │   │   │   ├── TradingPage.tsx
│   │   │   │   └── ...
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── store/             # Zustand state management
│   │   ├── lib/               # Utilities and API client
│   │   └── App.tsx            # Main app component
│   ├── public/                # Static assets
│   ├── package.json
│   └── vite.config.ts
│
├── src/                       # Backend (Node.js + Express)
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── teller.controller.ts
│   │   ├── banker.controller.ts
│   │   └── ...
│   ├── services/              # Business logic
│   │   ├── financialHealth.service.ts
│   │   ├── cashFlow.service.ts
│   │   ├── trading.service.ts
│   │   ├── receipt.service.ts
│   │   ├── prediction.service.ts
│   │   └── ...
│   ├── routes/                # API routes
│   │   ├── auth.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── premium.routes.ts
│   │   ├── portfolio.routes.ts
│   │   └── ...
│   ├── middleware/            # Express middleware
│   │   └── auth.middleware.ts
│   ├── scripts/               # Utility scripts
│   │   └── seedMeridianData.ts
│   └── index.ts               # Main server file
│
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
│
├── .env                       # Backend environment variables
├── package.json               # Backend dependencies
├── tsconfig.json
└── README.md
```

## 🧪 Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Chat with AI Financial Advisor
```bash
curl -X POST http://localhost:3001/api/chat/financial-assistant \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is my spending this month?",
    "history": []
  }'
```

## 🔧 Available Scripts

### Backend
- `npm run dev` - Start backend development server with hot reload
- `npm run build` - Build backend for production
- `npm start` - Start production backend server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Frontend
- `cd finance-buddy-frontend && npm run dev` - Start frontend development server
- `cd finance-buddy-frontend && npm run build` - Build frontend for production
- `cd finance-buddy-frontend && npm run preview` - Preview production build

## 🛡️ Security Notes

1. **Never commit `.env` file** - It contains sensitive API keys
2. **Change JWT_SECRET** - Use a strong random string (32+ characters)
3. **Use HTTPS in production** - Never send tokens over HTTP
4. **Validate all inputs** - Express-validator is already configured
5. **Rate limiting** - Consider adding rate limiting for production

## 🚀 Deployment

### Deploy to Railway
1. Push code to GitHub
2. Connect Railway to your repo
3. Add environment variables in Railway dashboard
4. Railway will auto-deploy

### Deploy to Heroku
```bash
heroku create finance-buddy-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

## 📝 Environment Variables Checklist

Before running, make sure you have:
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `JWT_SECRET` - Random secure string (32+ characters)
- ✅ `TELLER_APP_ID` - From Teller dashboard
- ✅ `TELLER_API_KEY` - From Teller dashboard
- ✅ `GEMINI_API_KEY` - From Google AI Studio
- ✅ `ALPACA_API_KEY` - From Alpaca Markets
- ✅ `ALPACA_SECRET_KEY` - From Alpaca Markets
- ✅ `NEWS_API_KEY` - From NewsAPI.org
- ✅ `FRONTEND_URL` - Your frontend URL (http://localhost:5174)
- ✅ `VITE_API_URL` - Backend API URL in frontend .env (http://localhost:3001/api)

## 🐛 Troubleshooting

### Prisma Client Not Found
```bash
npm run prisma:generate
```

### Database Connection Error
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Verify network access to database

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process using the port:
```bash
# Backend (port 3001)
lsof -ti:3001 | xargs kill -9

# Frontend (port 5174)
lsof -ti:5174 | xargs kill -9
```

### Chatbot Not Working
- Verify `GEMINI_API_KEY` is set correctly
- Check that you're using Gemini 2.0 Flash model
- Ensure backend server is running on port 3001
- Check browser console for errors

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` in frontend `.env` is `http://localhost:3001/api`
- Ensure backend is running on port 3001
- Check CORS settings in backend

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Zustand** - State management
- **React Router** - Routing
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Socket.io** - WebSocket
- **JWT** - Authentication
- **Google Gemini** - AI features
- **Alpaca API** - Stock trading
- **Teller API** - Banking integration

## 📚 Documentation

- [Teller API Docs](https://teller.io/docs)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Alpaca API Docs](https://alpaca.markets/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Socket.io Docs](https://socket.io/docs)
- [React Docs](https://react.dev)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## 🎯 Key Features Showcase

### AI Financial Advisor (Michael)
The chatbot has access to your complete financial data and can:
- Answer questions about spending patterns
- Provide budget recommendations
- Analyze investment performance
- Suggest financial improvements
- Perform comprehensive health checks

### Meridian Dashboard
Premium features include:
- **Financial Health Score** - Multi-dimensional scoring system
- **Cash Flow Prediction** - ML-based forecasting
- **Debt Payoff Planner** - Optimized repayment strategies
- **Portfolio Rebalancing** - Automated alerts
- **Retirement Planning** - Long-term financial projections

### Live Trading
- Real-time stock quotes
- Paper trading with Alpaca
- AI-powered price predictions
- Portfolio tracking and analytics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 🎉 You're All Set!

Your Meridian platform is ready to go! Start both servers and explore the comprehensive financial management features.

For questions or issues, check the documentation links above or open an issue on GitHub.
