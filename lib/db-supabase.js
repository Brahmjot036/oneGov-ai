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
                console.warn('Supabase: No email parameter provided');
                return null;
              }
              const email = String(params[0]).toLowerCase().trim();
              console.log('Supabase: Searching for user with email:', email);
              
              const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single()
              
              if (error) {
                if (error.code === 'PGRST116') {
                  // No rows returned - user not found
                  console.log('Supabase: User not found for email:', email);
                  return null;
                }
                console.error('Supabase query error:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                return null;
              }
              
              if (data) {
                console.log('Supabase: User found:', { id: data.id, email: data.email, name: data.name });
              }
              return data || null
            }
            if (sql.includes('WHERE id = ?')) {
              const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', parseInt(params[0]))
                .single()
              
              if (error && error.code !== 'PGRST116') {
                console.error('Supabase error:', error)
                return null
              }
              return data || null
            }
            if (sql.includes('SELECT id') && sql.includes('WHERE email = ?')) {
              const { data, error } = await supabase
                .from('users')
                .select('id')
                .eq('email', params[0]?.toLowerCase()?.trim())
                .single()
              
              if (error && error.code !== 'PGRST116') {
                return null
              }
              return data || null
            }
          }
          
          if (sql.includes('SELECT') && sql.includes('FROM sessions')) {
            if (sql.includes('WHERE token = ?')) {
              // First get the session
              const { data: session, error: sessionError } = await supabase
                .from('sessions')
                .select('*')
                .eq('token', params[0])
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
                name: user?.name,
                email: user?.email,
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
              throw new Error('Missing required parameters for user insert: name, email, password');
            }
            
            const userData = {
              name: String(params[0]).trim(),
              email: String(params[1]).toLowerCase().trim(),
              password: String(params[2]),
            };
            
            console.log('Supabase: Inserting user with email:', userData.email);
            
            const { data, error } = await supabase
              .from('users')
              .insert(userData)
              .select('id')
              .single()
            
            if (error) {
              console.error('Supabase insert error:', error);
              console.error('Error code:', error.code);
              console.error('Error message:', error.message);
              console.error('Error details:', error.details);
              throw error;
            }
            
            if (!data || !data.id) {
              throw new Error('User insert succeeded but no ID returned');
            }
            
            console.log('Supabase: User created with ID:', data.id);
            return { lastInsertRowid: data.id }
          }
          
          if (sql.includes('INSERT INTO sessions')) {
            if (!params[0] || !params[1] || !params[2]) {
              throw new Error('Missing required parameters for session insert');
            }
            
            const sessionData = {
              user_id: parseInt(params[0]) || 0,
              token: String(params[1]),
              expires_at: String(params[2]),
            };
            
            console.log('Supabase: Creating session for user_id:', sessionData.user_id);
            
            const { data, error } = await supabase
              .from('sessions')
              .insert(sessionData)
              .select('id')
              .single()
            
            if (error) {
              console.error('Supabase session insert error:', error);
              console.error('Error details:', error.details);
              throw error;
            }
            
            return { lastInsertRowid: data?.id || 0 }
          }
          
          if (sql.includes('INSERT INTO chat_sessions')) {
            const { data, error } = await supabase
              .from('chat_sessions')
              .insert({
                user_id: parseInt(params[0]),
                title: params[1],
                created_at: params[2] || new Date().toISOString(),
                updated_at: params[3] || new Date().toISOString(),
              })
              .select('id')
              .single()
            
            if (error) {
              console.error('Supabase insert error:', error)
              throw error
            }
            
            return { lastInsertRowid: data.id }
          }
          
          if (sql.includes('INSERT INTO chat_messages')) {
            const { data, error } = await supabase
              .from('chat_messages')
              .insert({
                session_id: params[0],
                role: params[1],
                content: params[2],
                created_at: params[3] || new Date().toISOString(),
              })
              .select('id')
              .single()
            
            if (error) {
              console.error('Supabase insert error:', error)
              throw error
            }
            
            return { lastInsertRowid: data.id }
          }
          
          if (sql.includes('INSERT INTO qa_pairs')) {
            const { data, error } = await supabase
              .from('qa_pairs')
              .insert({
                user_id: params[0],
                question: params[1],
                answer: params[2],
                persona: params[3],
                state: params[4],
                language: params[5],
              })
              .select('id')
              .single()
            
            if (error) {
              console.error('Supabase insert error:', error)
              // Don't throw for QA pairs, just log
              return { lastInsertRowid: 0 }
            }
            
            return { lastInsertRowid: data.id }
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

