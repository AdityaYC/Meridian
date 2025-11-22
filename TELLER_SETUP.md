# 🏦 Teller Bank Connection Setup

## Quick Start (Sandbox Mode)

For testing without real bank accounts, use Teller's sandbox:

### 1. Sign Up for Teller
- Go to: https://teller.io/register
- Create a free account
- Navigate to your dashboard

### 2. Get Your API Credentials
In your Teller dashboard, you'll find:
- **Application ID** (`TELLER_APP_ID`)
- **API Key** (`TELLER_API_KEY`)

### 3. Update Your .env File
```bash
TELLER_APP_ID=your_actual_app_id_here
TELLER_API_KEY=your_actual_api_key_here
TELLER_ENVIRONMENT=sandbox
```

### 4. Restart Your Backend
```bash
# Stop the backend (Ctrl+C)
# Then restart:
npm run dev
```

## Testing Bank Connection

### Sandbox Test Credentials
When connecting in sandbox mode, use these test credentials:

**Bank:** Chase
- Username: `test_good`
- Password: `test_good`

**Bank:** Bank of America  
- Username: `test_good`
- Password: `test_good`

### How to Connect

1. Go to **Accounts** page in your app
2. Click **"Connect Account"**
3. Select a bank (e.g., Chase)
4. Enter test credentials above
5. Complete the connection flow

## Supported Banks (Production)

Once you're ready for production, Teller supports:
- ✅ Chase
- ✅ Bank of America
- ✅ Wells Fargo
- ✅ Citibank
- ✅ Capital One
- ✅ American Express
- ✅ US Bank
- ✅ PNC Bank
- ✅ TD Bank
- ✅ And 100+ more institutions

## Security

- ✅ Bank-level encryption
- ✅ Credentials never stored on your servers
- ✅ Read-only access to accounts
- ✅ SOC 2 Type II certified
- ✅ OAuth 2.0 authentication

## Troubleshooting

### "Invalid credentials" error
- Make sure you're using `test_good` / `test_good` in sandbox
- Check that `TELLER_ENVIRONMENT=sandbox` in .env

### Connection popup blocked
- Allow popups for localhost in your browser
- Or use the inline connection flow

### No accounts showing
- Check backend logs for errors
- Verify DATABASE_URL is correct
- Run `npx prisma migrate dev` if needed

## Going to Production

When ready for real bank connections:

1. **Get approved by Teller**
   - Submit your app for review
   - Provide privacy policy & terms of service
   
2. **Update environment**
   ```bash
   TELLER_ENVIRONMENT=production
   ```

3. **Test with your own accounts first**
   - Connect your personal bank account
   - Verify transactions sync correctly
   - Test all features thoroughly

## API Endpoints

The backend already has these Teller endpoints:

- `GET /api/teller/connect` - Get connection URL
- `POST /api/teller/connect/callback` - Complete connection
- `GET /api/teller/accounts` - List connected accounts
- `POST /api/teller/accounts/:id/sync` - Sync transactions
- `DELETE /api/teller/accounts/:id` - Disconnect account

## Need Help?

- Teller Docs: https://teller.io/docs
- Teller Support: support@teller.io
- Sandbox Guide: https://teller.io/docs/sandbox
