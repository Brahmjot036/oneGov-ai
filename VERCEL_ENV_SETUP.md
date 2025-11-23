# 🔐 Add Environment Variables to Vercel Deployment

Your app is deployed at: **https://one-gov-ai-buildit.vercel.app**

## Method 1: Using Vercel Dashboard (Easiest - 2 minutes)

### Step 1: Go to Your Project
1. Visit https://vercel.com/dashboard
2. Find your project: **one-gov-ai-buildit** (or similar)
3. Click on the project name

### Step 2: Add Environment Variables
1. Click **Settings** (top navigation)
2. Click **Environment Variables** (left sidebar)
3. Add these **3 variables** one by one:

#### Variable 1: Supabase URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://your-project-id.supabase.co` (from Supabase dashboard)
- **Environment**: Select all (Production, Preview, Development)
- Click **Save**

#### Variable 2: Supabase Anon Key
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon key (from Supabase dashboard)
- **Environment**: Select all (Production, Preview, Development)
- Click **Save**

#### Variable 3: Gemini API Key
- **Key**: `GEMINI_API_KEY`
- **Value**: Your Google Gemini API key
- **Environment**: Select all (Production, Preview, Development)
- Click **Save**

### Step 3: Redeploy
1. After adding all variables, go to **Deployments** tab
2. Click the **3 dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (~2 minutes)

### Step 4: Verify
1. Visit https://one-gov-ai-buildit.vercel.app
2. Try signing up a new account
3. If it works, you're done! 🎉

---

## Method 2: Using Vercel CLI (Alternative)

If you prefer command line:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project (if not already linked)
cd my-nextjs-app
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add GEMINI_API_KEY

# Redeploy
vercel --prod
```

---

## ⚠️ Important Notes

1. **Get Supabase Credentials First**: 
   - If you haven't set up Supabase yet, follow `QUICK_START.md`
   - You need: Supabase Project URL and Anon Key

2. **Select All Environments**: 
   - Make sure to check all boxes (Production, Preview, Development)
   - This ensures variables work in all deployments

3. **Redeploy After Adding Variables**:
   - Environment variables only take effect after redeployment
   - Vercel will automatically redeploy if you push new code, but you can manually redeploy too

4. **Variable Names Must Match Exactly**:
   - `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not `SUPABASE_KEY`)
   - `GEMINI_API_KEY` (exact match)

---

## 🐛 Troubleshooting

**Variables not working?**
- Make sure you selected all environments (Production, Preview, Development)
- Redeploy after adding variables
- Check variable names are exact (case-sensitive)

**Still getting "Supabase not configured"?**
- Verify Supabase credentials are correct
- Make sure you ran the SQL setup in Supabase (see `QUICK_START.md` Step 3)
- Check Vercel deployment logs for errors

**Need help?**
- Check Vercel deployment logs: Settings → Logs
- Check Supabase logs: Supabase Dashboard → Logs

