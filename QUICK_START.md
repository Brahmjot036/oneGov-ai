# 🚀 Quick Start Guide - Get Your Database Working in 5 Minutes

## The Problem
SQLite doesn't work on Vercel (serverless). I've set up **Supabase** (free PostgreSQL database) that works everywhere!

## Setup Steps

### 1. Create Supabase Account (2 minutes)
- Go to https://supabase.com
- Click "Start your project" → Sign up (free, no credit card)
- Click "New Project"
- Fill in:
  - **Name**: onegov-ai (or any name)
  - **Database Password**: Create a strong password (save it!)
  - **Region**: Choose closest to you
- Click "Create new project"
- Wait ~2 minutes for setup

### 2. Get Your Credentials (1 minute)
Once project is ready:
1. Go to **Settings** (gear icon) → **API**
2. Copy these 2 values:
   - **Project URL** → This is `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → This is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Create Database Tables (1 minute)
1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `supabase-setup.sql` from this project
4. Copy **ALL** the SQL code
5. Paste into Supabase SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see: ✅ "Success. No rows returned"

### 4. Add Environment Variables (1 minute)

#### For Local Development:
Create `.env.local` in `my-nextjs-app/` folder:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-key-here
```

#### For Vercel:
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add these 3 variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `GEMINI_API_KEY` = your Gemini key

### 5. Test It! (30 seconds)
```bash
npm run dev
```

Try signing up a new user - it should work! 🎉

## How It Works

- **Local**: Uses Supabase if configured, falls back to SQLite
- **Vercel**: Automatically uses Supabase (persistent!)
- **No Data Loss**: Everything stored in cloud database

## Troubleshooting

**"Supabase not configured" error?**
- Check `.env.local` file exists
- Restart dev server: `npm run dev`
- Verify variable names are exact: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Login not working?**
- Make sure you ran the SQL setup (Step 3)
- Check Supabase → Table Editor → See if `users` table exists
- Try creating a new account

**Still issues?**
- Check Supabase dashboard → Logs (for errors)
- Make sure RLS policies are enabled (they should be from the SQL script)

## That's It! 🎊

Your database is now working on both local and Vercel!

