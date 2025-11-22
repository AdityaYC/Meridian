# ⚡ Finance Buddy - 5 Minute Quick Start

## 🎯 Absolute Minimum to Get Running

### 1. Get API Keys (5 minutes)

**Required:**
- **Teller**: https://teller.io/register → Get `TELLER_APP_ID` and `TELLER_API_KEY`
- **OpenAI**: https://platform.openai.com/api-keys → Get `OPENAI_API_KEY`
- **Database**: https://railway.app → Create PostgreSQL → Get `DATABASE_URL`

**Optional (skip for now):**
- Fish Audio & Tavus (for avatar features)

### 2. Configure `.env`

```env
DATABASE_URL="postgresql://your-railway-url-here"
JWT_SECRET="any_random_string_at_least_32_characters_long_12345"
TELLER_APP_ID=your_teller_app_id
TELLER_API_KEY=your_teller_api_key
TELLER_ENVIRONMENT=sandbox
OPENAI_API_KEY=sk-your-openai-key
FRONTEND_URL=http://localhost:3000
```

### 3. Setup Database

```bash
npm run prisma:migrate
```

When prompted for migration name, type: `init`

### 4. Start Server

```bash
npm run dev
```

### 5. Test It!

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","firstName":"Test","lastName":"User"}'
```

## ✅ That's It!

Your backend is running on `http://localhost:5000`

### What Works Now:
- ✅ User registration & login
- ✅ Bank account connection (Teller)
- ✅ Transaction sync & AI categorization
- ✅ Budget management
- ✅ Spending analytics
- ✅ AI chat (without voice/video)
- ✅ Real-time WebSocket notifications

### To Enable Voice/Video:
Add to `.env`:
```env
FISH_AUDIO_API_KEY=your_key
FISH_AUDIO_VOICE_ID=your_voice_id
TAVUS_API_KEY=your_key
TAVUS_AVATAR_ID=your_avatar_id
```

## 📚 Full Documentation

- `README.md` - Complete documentation
- `SETUP_GUIDE.md` - Detailed setup instructions
- `API_EXAMPLES.md` - API testing examples

## 🚀 Next: Build Your Frontend

Connect to:
- REST API: `http://localhost:5000/api/*`
- WebSocket: `ws://localhost:5000`

Use the JWT token from login/register for authentication.
