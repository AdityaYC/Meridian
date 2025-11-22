# 🧪 Finance Buddy API Testing Examples

## Quick Test Commands

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2025-11-22T00:00:00.000Z"
  }
}
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### 4. Get User Profile
```bash
# Replace YOUR_TOKEN with the JWT from login/register
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Get Teller Connect URL
```bash
curl -X GET http://localhost:5000/api/teller/connect \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "connectUrl": "https://sandbox.teller.io/connect?application_id=...",
  "enrollmentId": "user_uuid_timestamp"
}
```

### 6. Connect Bank Account
```bash
# After user completes Teller Connect flow
curl -X POST http://localhost:5000/api/teller/connect/callback \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentId": "enrollment_id_from_step_5"
  }'
```

### 7. Get Connected Accounts
```bash
curl -X GET http://localhost:5000/api/teller/accounts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Sync Account Transactions
```bash
# Replace ACCOUNT_ID with actual account ID
curl -X POST http://localhost:5000/api/teller/accounts/ACCOUNT_ID/sync \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 9. Get Transactions
```bash
# Get all transactions
curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get transactions for specific account
curl -X GET "http://localhost:5000/api/transactions?accountId=ACCOUNT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get transactions by category
curl -X GET "http://localhost:5000/api/transactions?category=Food%20%26%20Dining" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Limit results
curl -X GET "http://localhost:5000/api/transactions?limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 10. Chat with AI Avatar
```bash
curl -X POST http://localhost:5000/api/avatar/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How much did I spend on food this month?"
  }'
```

**Response:**
```json
{
  "message": "You spent $450 on food this month, which is within your budget! 🎉",
  "audioUrl": "https://fish.audio/...",
  "messageId": "message-uuid"
}
```

### 11. Get Chat History
```bash
curl -X GET http://localhost:5000/api/avatar/history \
  -H "Authorization: Bearer YOUR_TOKEN"

# Limit results
curl -X GET "http://localhost:5000/api/avatar/history?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 12. Create Budget
```bash
curl -X POST http://localhost:5000/api/budgets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Food & Dining",
    "monthlyLimit": 500,
    "alertThreshold": 80
  }'
```

### 13. Get Budgets
```bash
curl -X GET http://localhost:5000/api/budgets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 14. Update Budget
```bash
curl -X PUT http://localhost:5000/api/budgets/BUDGET_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyLimit": 600,
    "alertThreshold": 85
  }'
```

### 15. Delete Budget
```bash
curl -X DELETE http://localhost:5000/api/budgets/BUDGET_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 16. Get Alerts
```bash
# Get all alerts
curl -X GET http://localhost:5000/api/alerts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get only unread alerts
curl -X GET "http://localhost:5000/api/alerts?unread=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 17. Mark Alert as Read
```bash
curl -X PATCH http://localhost:5000/api/alerts/ALERT_ID/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 18. Mark All Alerts as Read
```bash
curl -X PATCH http://localhost:5000/api/alerts/read-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 19. Get Spending Analytics
```bash
# Last 30 days (default)
curl -X GET http://localhost:5000/api/analytics/spending \
  -H "Authorization: Bearer YOUR_TOKEN"

# Last 90 days
curl -X GET "http://localhost:5000/api/analytics/spending?days=90" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  {
    "category": "Food & Dining",
    "total": 450.50,
    "count": 23
  },
  {
    "category": "Transportation",
    "total": 120.00,
    "count": 8
  }
]
```

### 20. Get Monthly Trends
```bash
# Last 6 months (default)
curl -X GET http://localhost:5000/api/analytics/trends \
  -H "Authorization: Bearer YOUR_TOKEN"

# Last 12 months
curl -X GET "http://localhost:5000/api/analytics/trends?months=12" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  {
    "month": "2025-11",
    "income": 5000,
    "expenses": 3200
  },
  {
    "month": "2025-10",
    "income": 5000,
    "expenses": 2800
  }
]
```

### 21. Get Investments
```bash
curl -X GET http://localhost:5000/api/investments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 22. Add Investment
```bash
curl -X POST http://localhost:5000/api/investments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "type": "stock",
    "quantity": 10,
    "purchasePrice": 150.00,
    "currentPrice": 175.00
  }'
```

## WebSocket Testing

### Using JavaScript
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('new_transaction', (data) => {
  console.log('New transaction:', data);
});

socket.on('alert', (alert) => {
  console.log('New alert:', alert);
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket');
});
```

### Using Postman
1. Create new WebSocket request
2. URL: `ws://localhost:5000`
3. Add authentication in connection settings
4. Listen for events: `new_transaction`, `alert`

## Testing Flow

### Complete User Journey
```bash
# 1. Register
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","firstName":"Test","lastName":"User"}' \
  | jq -r '.token')

# 2. Get Teller Connect URL
curl -X GET http://localhost:5000/api/teller/connect \
  -H "Authorization: Bearer $TOKEN"

# 3. After connecting bank, sync transactions
curl -X POST http://localhost:5000/api/teller/accounts/ACCOUNT_ID/sync \
  -H "Authorization: Bearer $TOKEN"

# 4. View transactions
curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN"

# 5. Create budget
curl -X POST http://localhost:5000/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"Food & Dining","monthlyLimit":500,"alertThreshold":80}'

# 6. Get spending analytics
curl -X GET http://localhost:5000/api/analytics/spending \
  -H "Authorization: Bearer $TOKEN"

# 7. Chat with AI
curl -X POST http://localhost:5000/api/avatar/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"How am I doing financially?"}'
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 400 Bad Request
```json
{
  "error": "User already exists"
}
```

### 404 Not Found
```json
{
  "error": "Account not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Something went wrong!",
  "message": "Detailed error message (dev mode only)"
}
```

## Tips

1. **Save your token**: After login/register, save the JWT token for subsequent requests
2. **Use environment variables**: Store your token in an env var for easier testing
3. **Check logs**: Server logs show detailed information about requests
4. **Prisma Studio**: Use `npm run prisma:studio` to view database directly
5. **WebSocket**: Test real-time features by keeping a WebSocket connection open while making API calls
