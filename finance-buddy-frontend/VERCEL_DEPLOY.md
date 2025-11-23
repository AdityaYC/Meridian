# Quick Vercel Deployment

## Step 1: Set Environment Variables

Create a `.env.production` file in this directory with:

```env
VITE_API_URL=https://your-railway-backend.railway.app/api
VITE_TELLER_APP_ID=your-teller-app-id
VITE_ANAM_API_KEY=your-anam-api-key
VITE_ANAM_PERSONA_ID=your-anam-persona-id
```

## Step 2: Deploy

Run this command:

```bash
vercel --prod
```

Or use the Vercel dashboard at https://vercel.com

## Step 3: Add Environment Variables in Vercel

After deployment, go to your project settings in Vercel and add the same environment variables.

Then redeploy to apply the changes.
