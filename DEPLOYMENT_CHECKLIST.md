# 🚀 Finance Buddy - Deployment Checklist

## Pre-Deployment Checklist

### 🔐 Security
- [ ] Change `JWT_SECRET` to a secure random string (32+ characters)
- [ ] Set `NODE_ENV=production` in production environment
- [ ] Remove any test/debug code
- [ ] Verify `.env` is in `.gitignore`
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins (not `*`)
- [ ] Review and update rate limiting if needed
- [ ] Ensure all API keys are secure

### 🗄️ Database
- [ ] Production database is set up (Railway, Supabase, etc.)
- [ ] `DATABASE_URL` points to production database
- [ ] Run migrations: `npm run prisma:migrate`
- [ ] Test database connection
- [ ] Set up database backups
- [ ] Configure connection pooling if needed

### 🔑 API Keys
- [ ] Teller API keys (production mode)
- [ ] OpenAI API key with sufficient credits
- [ ] Fish Audio API key (if using voice)
- [ ] Tavus API key (if using video)
- [ ] All keys are production-ready

### 🌐 Environment Variables
```env
# Production .env template
PORT=5000
NODE_ENV=production

DATABASE_URL="postgresql://prod-url"
JWT_SECRET="secure-random-string-min-32-chars"

TELLER_APP_ID=prod_app_id
TELLER_API_KEY=prod_api_key
TELLER_ENVIRONMENT=production
TELLER_WEBHOOK_SECRET=prod_webhook_secret

OPENAI_API_KEY=sk-prod-key

FISH_AUDIO_API_KEY=prod_key
FISH_AUDIO_VOICE_ID=prod_voice_id

TAVUS_API_KEY=prod_key
TAVUS_AVATAR_ID=prod_avatar_id

FRONTEND_URL=https://your-frontend-domain.com
```

### 📦 Build & Dependencies
- [ ] Run `npm run build` successfully
- [ ] All dependencies installed
- [ ] No critical vulnerabilities (`npm audit`)
- [ ] TypeScript compiles without errors

### 🧪 Testing
- [ ] Health endpoint works: `/health`
- [ ] Auth endpoints tested
- [ ] Teller integration tested
- [ ] AI categorization tested
- [ ] WebSocket connection tested
- [ ] All critical paths tested

## Deployment Options

### Option 1: Railway (Recommended)

#### Steps:
1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Create Railway Project**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL**
   - In Railway project, click "New"
   - Select "Database" → "PostgreSQL"
   - Copy the `DATABASE_URL` from variables

4. **Configure Environment Variables**
   - Click on your service
   - Go to "Variables"
   - Add all environment variables from checklist above

5. **Deploy**
   - Railway auto-deploys on push
   - Check logs for any errors
   - Note your deployment URL

6. **Run Migrations**
   ```bash
   # In Railway service shell or locally with prod DATABASE_URL
   npm run prisma:migrate
   ```

#### Railway Configuration
Create `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Option 2: Heroku

#### Steps:
1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku  # macOS
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create finance-buddy-api
   ```

3. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   heroku config:set TELLER_APP_ID=your-id
   heroku config:set TELLER_API_KEY=your-key
   heroku config:set OPENAI_API_KEY=your-key
   # ... add all other variables
   ```

5. **Create Procfile**
   ```
   web: npm start
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **Run Migrations**
   ```bash
   heroku run npm run prisma:migrate
   ```

### Option 3: DigitalOcean App Platform

1. **Connect GitHub**
   - Go to DigitalOcean App Platform
   - Create new app from GitHub

2. **Configure Build**
   - Build Command: `npm run build`
   - Run Command: `npm start`

3. **Add Database**
   - Create managed PostgreSQL database
   - Add `DATABASE_URL` to environment variables

4. **Deploy**
   - DigitalOcean handles deployment

### Option 4: AWS (EC2 + RDS)

1. **Setup RDS PostgreSQL**
2. **Launch EC2 instance**
3. **Install Node.js**
4. **Clone repository**
5. **Configure environment variables**
6. **Use PM2 for process management**
7. **Setup nginx as reverse proxy**
8. **Configure SSL with Let's Encrypt**

## Post-Deployment

### ✅ Verification
- [ ] Health check endpoint responds
- [ ] Can register new user
- [ ] Can login
- [ ] Can connect bank account
- [ ] Transactions sync properly
- [ ] AI categorization works
- [ ] WebSocket connects
- [ ] Alerts are sent
- [ ] All endpoints respond correctly

### 🔧 Configuration
- [ ] Set up Teller webhooks pointing to your domain
- [ ] Configure CORS for your frontend domain
- [ ] Set up monitoring (e.g., Sentry, LogRocket)
- [ ] Configure logging service
- [ ] Set up uptime monitoring
- [ ] Configure CDN if needed

### 📊 Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure application monitoring (New Relic, DataDog)
- [ ] Set up log aggregation (Loggly, Papertrail)
- [ ] Configure uptime monitoring (UptimeRobot)
- [ ] Set up performance monitoring

### 🔒 Security
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure firewall rules
- [ ] Set up DDoS protection (Cloudflare)
- [ ] Enable rate limiting
- [ ] Configure security headers
- [ ] Set up API key rotation schedule
- [ ] Enable database encryption at rest

### 📈 Scaling
- [ ] Configure auto-scaling if needed
- [ ] Set up load balancer for multiple instances
- [ ] Configure Redis for session management
- [ ] Set up database read replicas
- [ ] Configure CDN for static assets

## Teller Webhook Configuration

Once deployed, configure Teller webhooks:

1. **Go to Teller Dashboard**
   - https://teller.io/dashboard

2. **Add Webhook URL**
   ```
   https://your-domain.com/api/teller/webhook
   ```

3. **Select Events**
   - `transaction.created`
   - `account.balance_changed`
   - `enrollment.disconnected`

4. **Add Webhook Secret**
   - Copy secret to `TELLER_WEBHOOK_SECRET` env var

## Maintenance

### Regular Tasks
- [ ] Monitor error logs daily
- [ ] Check API usage and costs
- [ ] Review database performance
- [ ] Update dependencies monthly
- [ ] Backup database regularly
- [ ] Review security alerts
- [ ] Monitor API rate limits

### Updates
```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Rebuild and redeploy
npm run build
git push
```

## Rollback Plan

If deployment fails:

1. **Railway/Heroku**
   - Use platform's rollback feature
   - Or redeploy previous commit

2. **Manual Rollback**
   ```bash
   git revert HEAD
   git push
   ```

3. **Database Rollback**
   ```bash
   # Prisma doesn't have built-in rollback
   # Restore from backup if needed
   ```

## Performance Optimization

### Production Optimizations
- [ ] Enable compression middleware (already included)
- [ ] Configure database connection pooling
- [ ] Add Redis caching for frequent queries
- [ ] Optimize Prisma queries with `select` and `include`
- [ ] Add database indexes for common queries
- [ ] Configure CDN for static assets
- [ ] Enable HTTP/2
- [ ] Minify responses

### Database Optimization
```typescript
// Example: Add indexes in schema.prisma
@@index([userId, date])
@@index([category])
```

## Cost Estimation

### Free Tier Options
- **Railway**: $5/month credit (enough for small apps)
- **Heroku**: Free tier (with limitations)
- **Supabase**: Free PostgreSQL (500MB)

### Paid Tier Estimates
- **Database**: $7-15/month (Railway, Supabase)
- **Hosting**: $7-25/month (Railway, Heroku)
- **OpenAI**: Pay per use (~$0.50-5/month for moderate use)
- **Teller**: Free sandbox, paid for production
- **Fish Audio**: Pay per use
- **Tavus**: Pay per use

**Total Estimate**: $15-50/month for small to medium usage

## Support & Documentation

### Resources
- [Railway Docs](https://docs.railway.app)
- [Heroku Docs](https://devcenter.heroku.com)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Teller Docs](https://teller.io/docs)

### Troubleshooting
- Check deployment logs
- Verify environment variables
- Test database connection
- Check API key validity
- Review CORS configuration

## 🎉 Deployment Complete!

Once all items are checked:
- ✅ Your backend is live
- ✅ Database is configured
- ✅ All services are connected
- ✅ Monitoring is active
- ✅ Security is configured

**Your API is now accessible at**: `https://your-domain.com`

### Next Steps:
1. Update frontend to use production API URL
2. Test all features in production
3. Monitor logs for first 24 hours
4. Set up alerts for errors
5. Document any production-specific configurations

---

**Need Help?** Check the logs first, then review documentation.
