// Supabase database adapter - provides SQLite-like interface using Supabase
import { getSupabaseClient, isSupabaseConfigured } from './supabase'

function getDb() {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    throw new Error('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }

  // Return a SQLite-compatible interface using Supabase
  // Note: All methods return Promises for async operations
  return {
    prepare: (sql) => {
      return {
        get: (...params) => {
          // Return a Promise for async operations
          return (async () => {
          // Handle SELECT queries
          if (sql.includes('SELECT') && sql.includes('FROM users')) {
            if (sql.includes('WHERE email = ?')) {
              if (!params[0]) {
                return null
              }
              const email = String(params[0] || '').toLowerCase().trim()
              if (!email) {
                return null
              }
              const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single()
              
              if (error && error.code !== 'PGRST116') {
                console.error('Supabase error:', error)
                return null
              }
              return data || null
            }
            if (sql.includes('WHERE id = ?')) {
              if (!params[0]) {
                return null
              }
              const id = parseInt(params[0])
              if (isNaN(id)) {
                return null
              }
              const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single()
              
              if (error && error.code !== 'PGRST116') {
                console.error('Supabase error:', error)
                return null
              }
              return data || null
            }
            if (sql.includes('SELECT id') && sql.includes('WHERE email = ?')) {
              if (!params[0]) {
                return null
              }
              const email = String(params[0] || '').toLowerCase().trim()
              if (!email) {
                return null
              }
              const { data, error } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single()
              
              if (error && error.code !== 'PGRST116') {
                return null
              }
              return data || null
            }
          }
          
          if (sql.includes('SELECT') && sql.includes('FROM sessions')) {
            if (sql.includes('WHERE token = ?')) {
              if (!params[0]) {
                return null
              }
              const token = String(params[0] || '')
              if (!token) {
                return null
              }
              // First get the session
              const { data: session, error: sessionError } = await supabase
                .from('sessions')
                .select('*')
                .eq('token', token)
                .gt('expires_at', new Date().toISOString())
                .single()
              
              if (sessionError && sessionError.code !== 'PGRST116') {
                return null
              }
              
              if (!session) {
                return null
              }
              
              // Then get the user
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('name, email')
                .eq('id', session.user_id)
                .single()
              
              if (userError) {
                console.error('Error fetching user:', userError)
                return null
              }
              
              return {
                ...session,
                user_id: session.user_id,
                name: user?.name || null,
                email: user?.email || null,
              }
            }
          }
          
          if (sql.includes('SELECT') && sql.includes('FROM chat_sessions')) {
            if (sql.includes('WHERE user_id = ?')) {
              const { data: sessions, error } = await supabase
                .from('chat_sessions')
                .select(`
                  id,
                  title,
                  created_at,
                  updated_at,
                  chat_messages(content)
                `)
                .eq('user_id', parseInt(params[0]))
                .order('updated_at', { ascending: false })
                .limit(50)
              
              if (error) {
                console.error('Supabase error:', error)
                return []
              }
              
              return sessions.map(session => ({
                id: session.id,
                title: session.title,
                created_at: session.created_at,
                updated_at: session.updated_at,
                lastMessage: session.chat_messages?.[0]?.content || '',
              }))
            }
          }
          
          if (sql.includes('SELECT') && sql.includes('FROM chat_messages')) {
            if (sql.includes('WHERE session_id = ?')) {
              const { data, error } = await supabase
                .from('chat_messages')
                .select('role, content, created_at')
                .eq('session_id', parseInt(params[0]))
                .order('created_at', { ascending: true })
              
              if (error) {
                console.error('Supabase error:', error)
                return []
              }
              
              return data || []
            }
          }
          
          return null
          })()
        },
        
        run: (...params) => {
          // Return a Promise for async operations
          return (async () => {
          // Handle INSERT queries
          if (sql.includes('INSERT INTO users')) {
            if (!params[0] || !params[1] || !params[2]) {
              throw new Error('Missing required parameters for user insert')
            }
            const { data, error } = await supabase
              .from('users')
              .insert({
                name: String(params[0] || '').trim(),
                email: String(params[1] || '').toLowerCase().trim(),
                password: String(params[2] || ''),
              })
              .select('id')
              .single()
            
            if (error) {
              console.error('Supabase insert error:', error)
              throw error
            }
            
            return { lastInsertRowid: data?.id || 0 }
          }
          
          if (sql.includes('INSERT INTO sessions')) {
            if (!params[0] || !params[1] || !params[2]) {
              throw new Error('Missing required parameters for session insert')
            }
            const { data, error } = await supabase
              .from('sessions')
              .insert({
                user_id: parseInt(params[0]) || 0,
                token: String(params[1] || ''),
                expires_at: String(params[2] || ''),
              })
              .select('id')
              .single()
            
            if (error) {
              console.error('Supabase insert error:', error)
              throw error
            }
            
            return { lastInsertRowid: data?.id || 0 }
          }
          
          if (sql.includes('INSERT INTO chat_sessions')) {
            if (!params[0] || !params[1]) {
              throw new Error('Missing required parameters for chat session insert')
            }
            const { data, error } = await supabase
              .from('chat_sessions')
              .insert({
                user_id: parseInt(params[0]) || 0,
                title: String(params[1] || ''),
                created_at: params[2] ? String(params[2]) : new Date().toISOString(),
                updated_at: params[3] ? String(params[3]) : new Date().toISOString(),
              })
              .select('id')
              .single()
            
            if (error) {
              console.error('Supabase insert error:', error)
              throw error
            }
            
            return { lastInsertRowid: data?.id || 0 }
          }
          
          if (sql.includes('INSERT INTO chat_messages')) {
            if (!params[0] || !params[1] || !params[2]) {
              throw new Error('Missing required parameters for chat message insert')
            }
            const { data, error } = await supabase
              .from('chat_messages')
              .insert({
                session_id: parseInt(params[0]) || 0,
                role: String(params[1] || ''),
                content: String(params[2] || ''),
                created_at: params[3] ? String(params[3]) : new Date().toISOString(),
              })
              .select('id')
              .single()
            
            if (error) {
              console.error('Supabase insert error:', error)
              throw error
            }
            
            return { lastInsertRowid: data?.id || 0 }
          }
          
          if (sql.includes('INSERT INTO qa_pairs')) {
            if (!params[1] || !params[2]) {
              // Don't throw for QA pairs, just return
              return { lastInsertRowid: 0 }
            }
            const { data, error } = await supabase
              .from('qa_pairs')
              .insert({
                user_id: params[0] ? parseInt(params[0]) : null,
                question: String(params[1] || ''),
                answer: String(params[2] || ''),
                persona: params[3] ? String(params[3]) : null,
                state: params[4] ? String(params[4]) : null,
                language: params[5] ? String(params[5]) : null,
              })
              .select('id')
              .single()
            
            if (error) {
              console.error('Supabase insert error:', error)
              // Don't throw for QA pairs, just log
              return { lastInsertRowid: 0 }
            }
            
            return { lastInsertRowid: data?.id || 0 }
          }
          
          // Handle DELETE queries
          if (sql.includes('DELETE FROM sessions')) {
            if (sql.includes('WHERE expires_at')) {
              const { error } = await supabase
                .from('sessions')
                .delete()
                .lt('expires_at', new Date().toISOString())
              
              if (error) {
                console.error('Supabase delete error:', error)
              }
            }
            return { changes: 0 }
          }
          
          return { lastInsertRowid: 0 }
          })()
        },
        
        all: (...params) => {
          // Return a Promise for async operations
          return (async () => {
          // Handle SELECT queries that return multiple rows
          if (sql.includes('SELECT') && sql.includes('FROM chat_sessions')) {
            if (sql.includes('WHERE user_id = ?')) {
              // Get sessions
              const { data: sessions, error: sessionsError } = await supabase
                .from('chat_sessions')
                .select('id, title, created_at, updated_at')
                .eq('user_id', parseInt(params[0]))
                .order('updated_at', { ascending: false })
                .limit(50)
              
              if (sessionsError) {
                console.error('Supabase error:', sessionsError)
                return []
              }
              
              // Get last message for each session
              const sessionsWithMessages = await Promise.all(
                sessions.map(async (session) => {
                  const { data: messages } = await supabase
                    .from('chat_messages')
                    .select('content')
                    .eq('session_id', session.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                  
                  return {
                    id: session.id,
                    title: session.title,
                    created_at: session.created_at,
                    updated_at: session.updated_at,
                    lastMessage: messages?.[0]?.content || '',
                  }
                })
              )
              
              return sessionsWithMessages
            }
          }
          
          if (sql.includes('SELECT') && sql.includes('FROM chat_messages')) {
            if (sql.includes('WHERE session_id = ?')) {
              const { data, error } = await supabase
                .from('chat_messages')
                .select('role, content, created_at')
                .eq('session_id', parseInt(params[0]))
                .order('created_at', { ascending: true })
              
              if (error) {
                console.error('Supabase error:', error)
                return []
              }
              
              return data || []
            }
          }
          
          return []
          })()
        },
      }
    },
    
    exec: (sql) => {
      // CREATE TABLE statements are handled by Supabase migrations
      return
    },
    
    pragma: () => {},
    
    transaction: (callback) => {
      // Supabase handles transactions automatically
      // For compatibility, just execute the callback
      if (typeof callback === 'function') {
        callback([])
      }
      return { lastInsertRowid: 0 }
    },
  }
}

export default getDb

