# 🚨 URGENT: Database Setup Required

## Error: "Could not find the table 'public.users'"

This error means the database tables haven't been created in Supabase yet.

## Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **"New Query"**

### Step 2: Run the Schema
1. Open the file `supabase-setup.sql` from this project
2. **Copy the ENTIRE file** (all lines)
3. Paste into Supabase SQL Editor
4. Click **"Run"** button (or press Cmd/Ctrl + Enter)
5. Wait for it to complete

### Step 3: Verify Tables Were Created
1. In Supabase Dashboard, click **Table Editor** (left sidebar)
2. You should see these 5 tables:
   - ✅ `users`
   - ✅ `sessions`
   - ✅ `chat_sessions`
   - ✅ `chat_messages`
   - ✅ `qa_pairs`

### Step 4: Test Again
1. Try signing up or logging in
2. It should work now! ✅

## What the SQL Does

The `supabase-setup.sql` file:
- Creates all 5 required tables
- Sets up indexes for performance
- Configures Row Level Security (RLS)
- Creates automatic triggers for `updated_at` fields
- Sets up foreign key relationships

## Troubleshooting

**Still getting the error?**
- Make sure you copied the ENTIRE SQL file
- Check Supabase SQL Editor → History to see if it ran successfully
- Look for any error messages in the SQL Editor output

**Tables not showing?**
- Refresh the Supabase dashboard
- Check if you're looking at the correct project
- Verify the SQL ran without errors

**Need help?**
- Check Supabase → Logs for any errors
- Make sure your Supabase project is active (not paused)

## After Setup

Once tables are created:
- ✅ Signup will work
- ✅ Login will work
- ✅ Data will be stored persistently
- ✅ Chat history will be saved

