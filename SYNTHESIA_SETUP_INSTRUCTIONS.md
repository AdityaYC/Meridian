# 🎥 Synthesia Integration Setup Instructions

## ✅ What Was Changed

The Meridian Personal Banker has been migrated from Tavus to Synthesia:

- **Old**: Tavus API with Raj/Marcus Bennett
- **New**: Synthesia API with Michael, CFP®

## 🔑 Step 1: Update Environment Variables

### Backend (.env)
Add these lines to `/Users/adityapunjani/Desktop/finance buddy/.env`:

```bash
# Synthesia API
SYNTHESIA_API_KEY=04b702bffee779e53320fb3f76c3649d
SYNTHESIA_AVATAR_ID=8c040674-0673-4f39-8975-2e6305336ba1
```

**Remove or comment out**:
```bash
# TAVUS_API_KEY=...
# TAVUS_PERSONA_ID=...
```

### Frontend (.env)
Add these lines to `/Users/adityapunjani/Desktop/finance buddy/finance-buddy-frontend/.env`:

```bash
# Synthesia API
VITE_SYNTHESIA_API_KEY=04b702bffee779e53320fb3f76c3649d
VITE_SYNTHESIA_AVATAR_ID=8c040674-0673-4f39-8975-2e6305336ba1
```

## 🚀 Step 2: Restart Servers

After updating the environment variables, restart both servers:

### Backend
```bash
# Stop the current backend (Ctrl+C)
cd /Users/adityapunjani/Desktop/finance\ buddy
npm run dev
```

### Frontend
```bash
# Stop the current frontend (Ctrl+C)
cd /Users/adityapunjani/Desktop/finance\ buddy/finance-buddy-frontend
npm run dev
```

## 📝 Step 3: Test the Integration

1. **Navigate to the Personal Banker page**
   - Open http://localhost:5173
   - Login with your credentials
   - Click "Talk to Michael" in the sidebar

2. **Start a consultation**
   - Click "Start Consultation"
   - Allow microphone access when prompted
   - Speak a question like: "What's my account balance?"

3. **Expected behavior**:
   - Michael will generate a video response (takes 30-60 seconds)
   - The video will play automatically
   - The system will listen for your next question
   - Conversation transcript appears in the sidebar

## ⚙️ How It Works

### Video Generation Flow
1. User speaks a question
2. Speech recognition converts to text
3. Text is sent to Synthesia API
4. Synthesia generates video (30-60 seconds)
5. Video URL is returned
6. Video plays automatically in the interface

### Key Files Created/Updated

**Created**:
- `finance-buddy-frontend/src/services/synthesia/SynthesiaService.ts` - Synthesia API integration
- `finance-buddy-frontend/src/config/michael.persona.ts` - Michael's personality and context
- `.env.synthesia` - Environment variable template (backend)
- `finance-buddy-frontend/.env.synthesia` - Environment variable template (frontend)

**Updated**:
- `finance-buddy-frontend/src/pages/dashboard/BankerPage.tsx` - Complete rewrite for Synthesia
- `finance-buddy-frontend/src/components/layout/DashboardLayout.tsx` - Navigation label updated

**Deleted**:
- `finance-buddy-frontend/src/services/tavus/` - Old Tavus integration removed

## 🎯 Features

### Michael, Your Personal Banker
- **Name**: Michael
- **Title**: Certified Financial Planner® (CFP®)
- **Experience**: 15+ years in wealth management
- **Specialization**: Wealth Management
- **Languages**: English, Spanish

### Capabilities
- ✅ Voice-activated conversations
- ✅ Real-time video responses
- ✅ Financial advice and insights
- ✅ Budget analysis
- ✅ Investment recommendations
- ✅ Spending pattern analysis
- ✅ Conversation transcript

## ⚠️ Important Notes

### Video Generation Time
- **Normal**: 30-60 seconds per response
- This is expected behavior for Synthesia
- A loading indicator shows during generation
- Consider pre-generating common responses for demos

### Browser Compatibility
- **Speech Recognition**: Chrome, Edge (WebKit-based browsers)
- **Safari**: May require additional permissions
- **Firefox**: Speech recognition not supported

### API Limits
- Check your Synthesia plan for video generation limits
- Test mode videos have watermarks
- Production mode requires paid plan

## 🐛 Troubleshooting

### "Failed to generate video"
- Check that `VITE_SYNTHESIA_API_KEY` is correct
- Verify API key has video generation permissions
- Check Synthesia dashboard for quota limits

### "Speech recognition not supported"
- Use Chrome or Edge browser
- Check microphone permissions
- Ensure HTTPS or localhost (required for speech API)

### Video not playing
- Check browser console for errors
- Verify video URL is accessible
- Try refreshing the page

### "Michael" still shows as "Raj" or "Marcus"
- Hard refresh the browser (Cmd+Shift+R or Ctrl+Shift+R)
- Clear browser cache
- Restart the frontend dev server

## 📚 API Documentation

- **Synthesia API Docs**: https://docs.synthesia.io/
- **Video Generation**: https://docs.synthesia.io/reference/create-video
- **Avatar Management**: https://docs.synthesia.io/reference/list-avatars

## 🎬 Demo Tips

For the best demo experience:

1. **Pre-generate videos** for common questions:
   - "What's my account balance?"
   - "How much did I spend last month?"
   - "Should I invest in Apple?"

2. **Use short responses** (already configured in persona)

3. **Show the loading state** as a feature:
   - "Michael is analyzing your finances..."
   - "Preparing personalized advice..."

4. **Highlight the transcript** feature in the sidebar

## ✅ Verification Checklist

- [ ] Backend .env updated with Synthesia credentials
- [ ] Frontend .env updated with Synthesia credentials
- [ ] Both servers restarted
- [ ] Can navigate to "Talk to Michael" page
- [ ] "Start Consultation" button works
- [ ] Microphone permission granted
- [ ] Video generates successfully (wait 30-60 seconds)
- [ ] Video plays automatically
- [ ] Conversation transcript appears
- [ ] Can end session successfully

## 🎉 Success!

If all steps are completed, you now have a fully functional Synthesia-powered personal banker named Michael!

The integration uses:
- ✅ Synthesia for AI video generation
- ✅ Web Speech API for voice input
- ✅ React for the UI
- ✅ Real-time conversation tracking
- ✅ Professional financial advisor persona
