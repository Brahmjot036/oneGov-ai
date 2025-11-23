// Serverless-compatible database using in-memory storage
// This is a fallback for Vercel deployment where SQLite doesn't work

let memoryDb = {
  users: [],
  sessions: [],
  chatSessions: [],
  chatMessages: [],
  qaPairs: [],
};

let userIdCounter = 1;
let sessionIdCounter = 1;
let chatSessionIdCounter = 1;
let chatMessageIdCounter = 1;
let qaPairIdCounter = 1;

function getDb() {
  // Return a SQLite-compatible interface using in-memory storage
  const dbInstance = {
    prepare: (sql) => {
      return {
        get: (...params) => {
          // Handle SELECT queries
          if (sql.includes('SELECT') && sql.includes('FROM users')) {
            if (sql.includes('WHERE email = ?')) {
              const emailToFind = params[0]?.toLowerCase()?.trim();
              return memoryDb.users.find(u => u.email?.toLowerCase()?.trim() === emailToFind) || null;
            }
            if (sql.includes('WHERE id = ?')) {
              return memoryDb.users.find(u => u.id === parseInt(params[0])) || null;
            }
            // Handle SELECT id FROM users WHERE email = ?
            if (sql.includes('SELECT id') && sql.includes('WHERE email = ?')) {
              const emailToFind = params[0]?.toLowerCase()?.trim();
              const user = memoryDb.users.find(u => u.email?.toLowerCase()?.trim() === emailToFind);
              return user ? { id: user.id } : null;
            }
            // Handle SELECT * FROM users
            if (sql.includes('SELECT *')) {
              if (sql.includes('WHERE email = ?')) {
                const emailToFind = params[0]?.toLowerCase()?.trim();
                return memoryDb.users.find(u => u.email?.toLowerCase()?.trim() === emailToFind) || null;
              }
            }
          }
          if (sql.includes('SELECT') && sql.includes('FROM sessions')) {
            if (sql.includes('WHERE token = ?')) {
              const session = memoryDb.sessions.find(s => s.token === params[0]);
              if (session && new Date(session.expires_at) > new Date()) {
                const user = memoryDb.users.find(u => u.id === session.user_id);
                return session ? { ...session, user_id: session.user_id, name: user?.name, email: user?.email } : null;
              }
              return null;
            }
          }
          return null;
        },
        run: (...params) => {
          // Handle INSERT queries
          if (sql.includes('INSERT INTO users')) {
            // SQL: INSERT INTO users (name, email, password) VALUES (?, ?, ?)
            // So params[0] = name, params[1] = email, params[2] = password
            const user = {
              id: userIdCounter++,
              name: params[0],
              email: params[1],
              password: params[2],
              created_at: new Date().toISOString(),
            };
            memoryDb.users.push(user);
            return { lastInsertRowid: user.id };
          }
          if (sql.includes('INSERT INTO sessions')) {
            const session = {
              id: sessionIdCounter++,
              user_id: params[0],
              token: params[1],
              expires_at: params[2],
              created_at: new Date().toISOString(),
            };
            memoryDb.sessions.push(session);
            return { lastInsertRowid: session.id };
          }
          if (sql.includes('INSERT INTO chat_sessions')) {
            const session = {
              id: chatSessionIdCounter++,
              user_id: parseInt(params[0]),
              title: params[1],
              created_at: params[2] || new Date().toISOString(),
              updated_at: params[3] || new Date().toISOString(),
            };
            memoryDb.chatSessions.push(session);
            return { lastInsertRowid: session.id };
          }
          if (sql.includes('INSERT INTO chat_messages')) {
            const message = {
              id: chatMessageIdCounter++,
              session_id: params[0],
              role: params[1],
              content: params[2],
              created_at: params[3] || new Date().toISOString(),
            };
            memoryDb.chatMessages.push(message);
            return { lastInsertRowid: message.id };
          }
          if (sql.includes('INSERT INTO qa_pairs')) {
            const qa = {
              id: qaPairIdCounter++,
              user_id: params[0],
              question: params[1],
              answer: params[2],
              persona: params[3],
              state: params[4],
              language: params[5],
              created_at: new Date().toISOString(),
            };
            memoryDb.qaPairs.push(qa);
            return { lastInsertRowid: qa.id };
          }
          // Handle DELETE queries
          if (sql.includes('DELETE FROM sessions')) {
            if (sql.includes('WHERE expires_at')) {
              memoryDb.sessions = memoryDb.sessions.filter(
                s => new Date(s.expires_at) > new Date()
              );
            }
            return { changes: 0 };
          }
          return { lastInsertRowid: 0 };
        },
        all: (...params) => {
          // Handle SELECT queries that return multiple rows
          if (sql.includes('SELECT') && sql.includes('FROM chat_sessions')) {
            if (sql.includes('WHERE user_id = ?')) {
              const sessions = memoryDb.chatSessions
                .filter(cs => cs.user_id === parseInt(params[0]))
                .map(cs => {
                  const lastMessage = memoryDb.chatMessages
                    .filter(cm => cm.session_id === cs.id)
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
                  return {
                    id: cs.id,
                    title: cs.title,
                    created_at: cs.created_at,
                    updated_at: cs.updated_at,
                    lastMessage: lastMessage?.content || '',
                  };
                })
                .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                .slice(0, 50);
              return sessions;
            }
          }
          if (sql.includes('SELECT') && sql.includes('FROM chat_messages')) {
            if (sql.includes('WHERE session_id = ?')) {
              return memoryDb.chatMessages
                .filter(cm => cm.session_id === parseInt(params[0]))
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                .map(msg => ({
                  role: msg.role,
                  content: msg.content,
                  created_at: msg.created_at,
                }));
            }
          }
          return [];
        },
      };
    },
    exec: (sql) => {
      // Handle CREATE TABLE statements (no-op in memory, tables are implicit)
      return;
    },
    pragma: () => {},
    transaction: (callback) => {
      // Simple transaction wrapper - execute callback with messages array
      if (typeof callback === 'function') {
        callback(memoryDb.chatMessages);
      }
      return { lastInsertRowid: 0 };
    },
  };
  
  // Initialize tables (no-op in memory, but keep for compatibility)
  dbInstance.exec = (sql) => {
    // Tables are implicit in memory storage
    return;
  };
  
  dbInstance.pragma = () => {};
  
  return dbInstance;
}

export default getDb;

