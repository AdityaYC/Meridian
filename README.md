# 🚀 Finance Buddy Backend

Complete Node.js + Express + TypeScript backend with real-time banking integration via Teller API, AI transaction categorization, and live avatar chat.

## 🎯 Features

- ✅ **Real-time Banking** - Connect Chase, BofA, Wells Fargo, Amex via Teller API
- ✅ **AI Categorization** - OpenAI-powered transaction categorization
- ✅ **Live Avatar Chat** - Fish Audio + Tavus integration
- ✅ **WebSocket Notifications** - Real-time updates for transactions and alerts
- ✅ **PostgreSQL + Prisma ORM** - Type-safe database access
- ✅ **JWT Authentication** - Secure user authentication
- ✅ **Fraud Detection** - Automatic alerts for large transactions
- ✅ **Budget Management** - Track spending by category with alerts
- ✅ **Analytics** - Spending insights and monthly trends

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- API Keys (see below)

## 🔑 Required API Keys

### 1. Teller API (Banking)
- Sign up: https://teller.io/register
- Get your `TELLER_APP_ID` and `TELLER_API_KEY`
- Use sandbox mode for testing

### 2. OpenAI (AI Categorization)
- Sign up: https://platform.openai.com
- Create API key: https://platform.openai.com/api-keys
- Get your `OPENAI_API_KEY`

### 3. Fish Audio (Text-to-Speech)
- Sign up: https://fish.audio
- Get your `FISH_AUDIO_API_KEY` and `FISH_AUDIO_VOICE_ID`

### 4. Tavus (Avatar Video)
- Sign up: https://tavus.io
- Get your `TAVUS_API_KEY` and `TAVUS_AVATAR_ID`

### 5. PostgreSQL Database
Choose one:
- **Railway**: https://railway.app (Free tier available)
- **Supabase**: https://supabase.com (Free tier available)
- **Local**: Install PostgreSQL locally

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Edit `.env` file with your credentials:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (example for Railway/Supabase)
DATABASE_URL="postgresql://username:password@host:5432/finance_buddy?schema=public"

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_change_in_production

# Teller API
TELLER_APP_ID=your_teller_app_id
TELLER_API_KEY=your_teller_api_key
TELLER_ENVIRONMENT=sandbox
TELLER_WEBHOOK_SECRET=your_webhook_secret

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Fish Audio
FISH_AUDIO_API_KEY=your_fish_audio_key
FISH_AUDIO_VOICE_ID=your_voice_id

# Tavus
TAVUS_API_KEY=your_tavus_api_key
TAVUS_AVATAR_ID=your_avatar_id

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 3. Setup Database
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 4. Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`

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

### Avatar Chat
- `POST /api/avatar/chat` - Chat with AI financial advisor
- `GET /api/avatar/history` - Get chat history

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
finance-buddy-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── teller.controller.ts
│   │   ├── transaction.controller.ts
│   │   ├── avatar.controller.ts
│   │   ├── alert.controller.ts
│   │   ├── budget.controller.ts
│   │   ├── analytics.controller.ts
│   │   └── investment.controller.ts
│   ├── services/              # Business logic
│   │   ├── teller.service.ts
│   │   ├── ai.service.ts
│   │   ├── avatar.service.ts
│   │   └── alert.service.ts
│   ├── routes/                # API routes
│   │   ├── auth.routes.ts
│   │   ├── teller.routes.ts
│   │   ├── transaction.routes.ts
│   │   ├── avatar.routes.ts
│   │   ├── alert.routes.ts
│   │   ├── budget.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── investment.routes.ts
│   │   └── ai.routes.ts
│   ├── middleware/            # Express middleware
│   │   └── auth.middleware.ts
│   └── index.ts               # Main server file
├── .env                       # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
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
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Get Teller Connect URL (use token from login)
```bash
curl -X GET http://localhost:5000/api/teller/connect \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

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
- ✅ `JWT_SECRET` - Random secure string
- ✅ `TELLER_APP_ID` - From Teller dashboard
- ✅ `TELLER_API_KEY` - From Teller dashboard
- ✅ `OPENAI_API_KEY` - From OpenAI platform
- ✅ `FISH_AUDIO_API_KEY` - From Fish Audio
- ✅ `FISH_AUDIO_VOICE_ID` - From Fish Audio
- ✅ `TAVUS_API_KEY` - From Tavus
- ✅ `TAVUS_AVATAR_ID` - From Tavus
- ✅ `FRONTEND_URL` - Your frontend URL

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
- Or kill process using port 5000:
```bash
lsof -ti:5000 | xargs kill -9
```

## 📚 Documentation

- [Teller API Docs](https://teller.io/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Socket.io Docs](https://socket.io/docs)

## 🎉 You're All Set!

Your Finance Buddy backend is ready to go! Start the development server and begin building your financial management app.

For questions or issues, check the documentation links above.
