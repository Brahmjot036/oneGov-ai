# Supabase Database Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up for free (no credit card required)
3. Create a new project
4. Wait for the project to be set up (takes ~2 minutes)

### Step 2: Get Your Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Step 3: Run SQL Setup
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

### Step 4: Set Environment Variables

#### For Local Development:
Create/update `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
GEMINI_API_KEY=your_gemini_key_here
```

#### For Vercel Deployment:
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `GEMINI_API_KEY` = your Gemini API key

### Step 5: Restart Your App
```bash
npm run dev
```

## How It Works

- **Local Development**: Uses Supabase if configured, otherwise falls back to SQLite
- **Vercel Deployment**: Automatically uses Supabase (persistent database)
- **No Data Loss**: All data is stored in Supabase cloud database

## Free Tier Limits

Supabase free tier includes:
- 500 MB database storage
- 2 GB bandwidth
- Unlimited API requests
- Perfect for development and small projects

## Troubleshooting

### "Supabase not configured" error
- Make sure you've set both environment variables
- Restart your dev server after adding env variables
- Check that variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Login still not working
- Make sure you've run the SQL setup script
- Check Supabase dashboard → Table Editor to see if tables exist
- Try creating a new user account

### Database connection issues
- Verify your Supabase project is active
- Check that RLS policies are set correctly (see SQL file)
- Make sure you're using the correct project URL and key

