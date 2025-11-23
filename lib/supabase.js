import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
// These will be set as environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabaseClient = null

export function getSupabaseClient() {
  // Log for debugging (without exposing sensitive data)
  console.log('🔍 Checking Supabase configuration...');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `✅ Set (${supabaseUrl.substring(0, 20)}...)` : '❌ Missing');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? `✅ Set (${supabaseKey.substring(0, 20)}...)` : '❌ Missing');
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials not found. Using fallback database.');
    console.warn('   Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables');
    return null
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseKey)
      console.log('✅ Supabase client created successfully');
    } catch (error) {
      console.error('❌ Failed to create Supabase client:', error.message);
      return null;
    }
  }

  return supabaseClient
}

// Check if Supabase is configured
export function isSupabaseConfigured() {
  const isConfigured = !!(supabaseUrl && supabaseKey);
  if (!isConfigured) {
    console.warn('⚠️  Supabase not configured - missing environment variables');
  }
  return isConfigured;
}

