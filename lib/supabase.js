import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
// These will be set as environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabaseClient = null

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found. Using fallback database.')
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseKey)
  }

  return supabaseClient
}

// Check if Supabase is configured
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseKey)
}

