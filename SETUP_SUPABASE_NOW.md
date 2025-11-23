# 🚨 URGENT: Set Up Supabase to Fix Login Issue

## The Problem
Your app is using an **in-memory database** on Vercel, which means:
- ✅ Signup works (creates user in memory)
- ❌ Login fails (memory resets on each request = data lost)
- ❌ No data persistence

## The Solution: Set Up Supabase (5 minutes)

### Step 1: Create Supabase Account & Project (2 minutes)

1. Go to **https://supabase.com**
2. Click **"Start your project"** → Sign up (free, no credit card)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `onegov-ai` (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you (e.g., `Southeast Asia (Mumbai)`)
5. Click **"Create new project"**
6. Wait ~2 minutes for setup

### Step 2: Get Your Credentials (1 minute)

Once project is ready:

1. In Supabase dashboard, click **Settings** (gear icon ⚙️) → **API**
2. Copy these 2 values:
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
     - Example: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Create Database Tables (1 minute)

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase-setup.sql` from this project
4. Copy **ALL** the SQL code (lines 1-78)
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see: ✅ **"Success. No rows returned"**

**Verify tables were created:**
- Click **Table Editor** (left sidebar)
- You should see 5 tables: `users`, `sessions`, `chat_sessions`, `chat_messages`, `qa_pairs`

### Step 4: Add Environment Variables to Vercel (1 minute)

1. Go to **https://vercel.com/dashboard**
2. Find your project: **one-gov-ai-buildit** (or similar)
3. Click on the project name
4. Click **Settings** (top navigation)
5. Click **Environment Variables** (left sidebar)
6. Add these **3 variables** one by one:

#### Variable 1: Supabase URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Your Supabase Project URL (from Step 2)
- **Environment**: ✅ Select all (Production, Preview, Development)
- Click **Save**

#### Variable 2: Supabase Anon Key
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon key (from Step 2)
- **Environment**: ✅ Select all (Production, Preview, Development)
- Click **Save**

#### Variable 3: Gemini API Key (if not already set)
- **Key**: `GEMINI_API_KEY`
- **Value**: Your Google Gemini API key
- **Environment**: ✅ Select all (Production, Preview, Development)
- Click **Save**

### Step 5: Redeploy (30 seconds)

1. After adding all variables, go to **Deployments** tab
2. Click the **3 dots** (⋯) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (~2 minutes)

### Step 6: Test It! 🎉

1. Visit **https://one-gov-ai-buildit.vercel.app**
2. Try **signing up** a new account
3. Try **logging in** with that account
4. ✅ Should work now!

## Verify It's Working

1. Go to Supabase dashboard → **Table Editor** → **users**
2. You should see your newly created user!
3. Data is now **persistent** ✅

## Troubleshooting

**Still getting 401 error?**
- Check Vercel deployment logs: Settings → Logs
- Look for "✅ Using Supabase database" message
- If you see "⚠️ Using in-memory database", environment variables aren't set correctly

**Tables not showing in Supabase?**
- Make sure you ran the SQL script (Step 3)
- Check SQL Editor → History to see if it ran successfully

**Environment variables not working?**
- Make sure variable names are EXACT: `NEXT_PUBLIC_SUPABASE_URL` (case-sensitive)
- Make sure you selected all environments (Production, Preview, Development)
- Redeploy after adding variables

## Need Help?

Check the logs in:
- **Vercel**: Settings → Logs
- **Supabase**: Dashboard → Logs

The app will now log which database it's using. Look for:
- ✅ "Using Supabase database" = Working!
- ⚠️ "Using in-memory database" = Not configured yet

