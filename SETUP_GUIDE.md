# 🎯 Finance Buddy - Complete Setup Guide

## ✅ What's Been Built

Your complete Finance Buddy backend is ready with:

- ✅ **8 Database Models** - User, BankAccount, Transaction, Budget, Investment, Alert, ChatMessage
- ✅ **9 API Route Groups** - Auth, Teller, Transactions, Avatar, Alerts, Budgets, Analytics, Investments, AI
- ✅ **Real-time WebSocket** - Instant notifications for transactions and alerts
- ✅ **AI Integration** - OpenAI for transaction categorization and financial insights
- ✅ **Avatar Services** - Fish Audio (TTS) + Tavus (video avatar)
- ✅ **Fraud Detection** - Automatic alerts for large transactions
- ✅ **Budget Tracking** - Category-based budgets with threshold alerts
- ✅ **TypeScript** - Fully typed codebase
- ✅ **Prisma ORM** - Type-safe database access

## 🚀 Next Steps

### Step 1: Get Your API Keys

#### 1.1 Teller (Banking) - **REQUIRED**
```
🔗 Sign up: https://teller.io/register
📝 Get: TELLER_APP_ID, TELLER_API_KEY
💡 Start with sandbox mode for testing
```

#### 1.2 OpenAI (AI) - **REQUIRED**
```
🔗 Sign up: https://platform.openai.com
📝 Get: OPENAI_API_KEY
💡 You'll need credits for API usage
```

#### 1.3 Fish Audio (Optional - for voice)
```
🔗 Sign up: https://fish.audio
📝 Get: FISH_AUDIO_API_KEY, FISH_AUDIO_VOICE_ID
💡 Optional: Can skip if you don't need voice features
```

#### 1.4 Tavus (Optional - for avatar video)
```
🔗 Sign up: https://tavus.io
📝 Get: TAVUS_API_KEY, TAVUS_AVATAR_ID
💡 Optional: Can skip if you don't need video avatar
```

### Step 2: Setup Database

#### Option A: Railway (Recommended - Free Tier)
```bash
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project → Provision PostgreSQL
4. Copy the DATABASE_URL from Railway dashboard
5. Paste into your .env file
```

#### Option B: Supabase (Free Tier)
```bash
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy Connection String (URI mode)
5. Paste into your .env file
```

#### Option C: Local PostgreSQL
```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or download from https://www.postgresql.org/download/

# Start PostgreSQL
brew services start postgresql

# Create database
createdb finance_buddy

# Your DATABASE_URL will be:
DATABASE_URL="postgresql://localhost:5432/finance_buddy?schema=public"
```

### Step 3: Configure Environment Variables

Edit your `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# Database - PASTE YOUR DATABASE URL HERE
DATABASE_URL="postgresql://user:pass@host:5432/finance_buddy?schema=public"

# JWT Secret - GENERATE A SECURE RANDOM STRING
JWT_SECRET=change_this_to_a_secure_random_string_min_32_chars

# Teller API - GET FROM TELLER DASHBOARD
TELLER_APP_ID=your_teller_app_id
TELLER_API_KEY=your_teller_api_key
TELLER_ENVIRONMENT=sandbox
TELLER_WEBHOOK_SECRET=your_webhook_secret

# OpenAI - GET FROM OPENAI PLATFORM
OPENAI_API_KEY=sk-your-openai-api-key-here

# Fish Audio (Optional)
FISH_AUDIO_API_KEY=your_fish_audio_key
FISH_AUDIO_VOICE_ID=your_voice_id

# Tavus (Optional)
TAVUS_API_KEY=your_tavus_api_key
TAVUS_AVATAR_ID=your_avatar_id

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Step 4: Initialize Database

```bash
# Generate Prisma Client (already done, but run if needed)
npm run prisma:generate

# Create database tables
npm run prisma:migrate

# When prompted, name your migration (e.g., "init")
```

### Step 5: Start the Server

```bash
# Development mode (with hot reload)
npm run dev

# You should see:
# 🚀 Server running on port 5000
# 🔌 WebSocket ready for real-time updates
# 🌍 Environment: development
```

### Step 6: Test the API

```bash
# Test health endpoint
curl http://localhost:5000/health

# Should return:
# {"status":"ok","message":"Finance Buddy API is running","timestamp":"..."}
```

## 🧪 Quick Test Flow

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

Save the `token` from the response!

### 2. Get Your Profile
```bash
# Replace YOUR_TOKEN with the token from step 1
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Connect a Bank Account
```bash
# Get Teller Connect URL
curl -X GET http://localhost:5000/api/teller/connect \
  -H "Authorization: Bearer YOUR_TOKEN"

# Open the connectUrl in a browser
# Complete the Teller Connect flow (use sandbox credentials)
# Then call the callback endpoint with the enrollmentId
```

## 📁 Project Structure

```
finance-buddy-backend/
├── src/
│   ├── controllers/     # 8 controllers for different features
│   ├── services/        # Business logic (Teller, AI, Avatar, Alerts)
│   ├── routes/          # 9 API route groups
│   ├── middleware/      # Auth middleware
│   └── index.ts         # Main server with WebSocket
├── prisma/
│   ├── schema.prisma    # 8 database models
│   └── migrations/      # Database migrations
├── .env                 # Your configuration
├── README.md            # Full documentation
├── API_EXAMPLES.md      # API testing examples
└── SETUP_GUIDE.md       # This file
```

## 🎯 Features Overview

### Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes with middleware

### Banking Integration (Teller)
- Connect to 10,000+ banks
- Real-time transaction sync
- Account balance tracking
- Webhook support

### AI Features
- Transaction categorization (OpenAI)
- Financial insights and advice
- Natural language chat interface

### Avatar Chat
- Text-to-speech (Fish Audio)
- Video avatar (Tavus)
- Chat history storage

### Alerts & Notifications
- Large transaction alerts
- Budget threshold warnings
- Real-time WebSocket notifications

### Analytics
- Spending by category
- Monthly income/expense trends
- Custom date ranges

### Budget Management
- Category-based budgets
- Automatic spending tracking
- Alert thresholds

## 🔧 Useful Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open database GUI

# Production
npm run build            # Build TypeScript
npm start                # Start production server
```

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npm run prisma:generate
```

### "Database connection error"
- Check your DATABASE_URL in .env
- Ensure database is running
- Test connection with Prisma Studio: `npm run prisma:studio`

### "Port 5000 already in use"
- Change PORT in .env to 5001 or another port
- Or kill the process: `lsof -ti:5000 | xargs kill -9`

### "OpenAI API error"
- Verify OPENAI_API_KEY is correct
- Check you have credits in your OpenAI account
- Ensure no extra spaces in .env file

### TypeScript errors
```bash
# Rebuild
npm run build

# If issues persist, delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 API Documentation

See `API_EXAMPLES.md` for detailed API testing examples with curl commands.

### Key Endpoints:
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/teller/connect` - Get bank connect URL
- `GET /api/transactions` - Get transactions
- `POST /api/avatar/chat` - Chat with AI
- `GET /api/analytics/spending` - Get spending data
- `POST /api/budgets` - Create budget

## 🚀 Ready for Production?

### Before deploying:
1. ✅ Change JWT_SECRET to a secure random string
2. ✅ Set NODE_ENV=production
3. ✅ Use production database (not local)
4. ✅ Enable HTTPS
5. ✅ Set up proper CORS origins
6. ✅ Add rate limiting
7. ✅ Set up monitoring/logging
8. ✅ Configure Teller webhooks

### Deploy to Railway:
```bash
1. Push code to GitHub
2. Connect Railway to your repo
3. Add all environment variables
4. Deploy automatically
```

## 🎉 You're Ready!

Your Finance Buddy backend is fully functional and ready to use!

### What You Can Do Now:
1. ✅ Register users and authenticate
2. ✅ Connect bank accounts via Teller
3. ✅ Sync and categorize transactions with AI
4. ✅ Chat with AI financial advisor
5. ✅ Create and track budgets
6. ✅ Get spending analytics
7. ✅ Receive real-time alerts
8. ✅ Track investments

### Next Steps:
- Build a frontend (React, Vue, or mobile app)
- Connect to the WebSocket for real-time updates
- Customize AI prompts for your use case
- Add more features (goals, recurring transactions, etc.)

## 📞 Need Help?

- Check `README.md` for full documentation
- See `API_EXAMPLES.md` for API testing
- Review Prisma schema in `prisma/schema.prisma`
- Check server logs for detailed error messages

Happy coding! 🚀
