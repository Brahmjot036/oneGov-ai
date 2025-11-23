import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { isSupabaseConfigured } from './supabase';

let db = null;
let serverlessDb = null;
let supabaseDb = null;

function getDb() {
  // Priority 1: Check if we're on Vercel (serverless environment)
  // SQLite doesn't work on Vercel, so use in-memory fallback
  if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV) {
    console.log('🌐 Running on Vercel - checking database configuration...');
    
    // Try Supabase first if configured
    try {
      if (isSupabaseConfigured()) {
        console.log('✅ Supabase is configured - initializing...');
        if (!supabaseDb) {
          const getSupabaseDb = require('./db-supabase.js').default;
          supabaseDb = getSupabaseDb();
          console.log('✅ Supabase database initialized successfully (persistent storage)');
        }
        return supabaseDb;
      } else {
        console.error('❌ Supabase not configured. Environment variables status:');
        console.error('   - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? `✅ Set (${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...)` : '❌ Missing');
        console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
        console.error('   📝 Action required: Add these variables in Vercel → Settings → Environment Variables');
      }
    } catch (error) {
      console.error('❌ Supabase initialization failed:', error.message);
      console.error('   Error details:', error);
      console.warn('⚠️  Falling back to in-memory database (data will NOT persist)');
    }
    
    // Use serverless-compatible database
    console.error('⚠️  ⚠️  ⚠️  USING IN-MEMORY DATABASE - DATA RESETS ON EACH REQUEST! ⚠️  ⚠️  ⚠️');
    console.error('   This means:');
    console.error('   - Signup will work (creates user in memory)');
    console.error('   - Login will FAIL (memory resets = user gone)');
    console.error('   - Chat history will be lost');
    console.error('');
    console.error('   🔧 TO FIX:');
    console.error('   1. Set up Supabase: https://supabase.com');
    console.error('   2. Run SQL from supabase-setup.sql in Supabase SQL Editor');
    console.error('   3. Add environment variables in Vercel:');
    console.error('      - NEXT_PUBLIC_SUPABASE_URL');
    console.error('      - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.error('   4. Redeploy on Vercel');
    
    if (!serverlessDb) {
      const getServerlessDbModule = require('./db-serverless.js');
      serverlessDb = getServerlessDbModule.default();
    }
    return serverlessDb;
  }

  // Priority 2: Use Supabase if configured (for local development)
  try {
    if (isSupabaseConfigured()) {
      if (!supabaseDb) {
        const getSupabaseDb = require('./db-supabase.js').default;
        supabaseDb = getSupabaseDb();
      }
      return supabaseDb;
    }
  } catch (error) {
    console.warn('Supabase initialization failed, using SQLite:', error.message);
  }

  if (db) {
    return db;
  }

  // Get the database directory
  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'users.db');
  
  try {
    db = new Database(dbPath);
  } catch (error) {
    // Fallback to in-memory if SQLite fails
    console.warn('SQLite initialization failed, using in-memory fallback:', error.message);
    if (!serverlessDb) {
      const getServerlessDbModule = require('./db-serverless.js');
      serverlessDb = getServerlessDbModule.default();
    }
    return serverlessDb;
  }

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create users table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create sessions table for tracking logged-in users
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create chat_sessions table for storing chat conversations
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create chat_messages table for storing individual messages
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    )
  `);

  // Create qa_pairs table for storing questions and answers for model training
  db.exec(`
    CREATE TABLE IF NOT EXISTS qa_pairs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      persona TEXT,
      state TEXT,
      language TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  console.log('Database initialized at:', dbPath);
  return db;
}

export default getDb;

