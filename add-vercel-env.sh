#!/bin/bash

# Script to add environment variables to Vercel
# Make sure you have your credentials ready before running this

echo "🚀 Adding Environment Variables to Vercel"
echo "=========================================="
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in
echo "📋 Checking Vercel login status..."
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "🔐 Please login to Vercel first..."
    vercel login
fi

echo ""
echo "📝 You'll be prompted to enter values for each variable."
echo "   Make sure you have these ready:"
echo "   1. NEXT_PUBLIC_SUPABASE_URL (from Supabase dashboard)"
echo "   2. NEXT_PUBLIC_SUPABASE_ANON_KEY (from Supabase dashboard)"
echo "   3. GEMINI_API_KEY (your Google Gemini API key)"
echo ""
read -p "Press Enter to continue..."

# Add Supabase URL
echo ""
echo "1️⃣  Adding NEXT_PUBLIC_SUPABASE_URL..."
echo "   Enter your Supabase Project URL (e.g., https://xxxxx.supabase.co)"
vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development

# Add Supabase Anon Key
echo ""
echo "2️⃣  Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "   Enter your Supabase anon/public key"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development

# Add Gemini API Key
echo ""
echo "3️⃣  Adding GEMINI_API_KEY..."
echo "   Enter your Google Gemini API key"
vercel env add GEMINI_API_KEY production preview development

echo ""
echo "✅ Environment variables added!"
echo ""
echo "🔄 Now redeploying your project..."
vercel --prod

echo ""
echo "🎉 Done! Your app should be working now."
echo "   Visit: https://one-gov-ai-buildit.vercel.app"

