import { NextResponse } from "next/server";
import getDb from "../../../../lib/db";

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const db = getDb();

    // Find session - handle both sync and async databases
    let session;
    try {
      const sessionQuery = db.prepare(
        "SELECT s.*, u.name, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime('now')"
      );
      
      if (typeof sessionQuery.get === 'function') {
        // Sync database (SQLite)
        session = sessionQuery.get(token);
      } else {
        // Async database (Supabase) - try JOIN first
        try {
          session = await sessionQuery.get(token);
        } catch (joinError) {
          // Fallback: query separately if JOIN doesn't work
          const sessionDataQuery = db.prepare("SELECT * FROM sessions WHERE token = ?");
          const sessionData = typeof sessionDataQuery.get === 'function' 
            ? sessionDataQuery.get(token)
            : await sessionDataQuery.get(token);
            
          if (sessionData && new Date(sessionData.expires_at) > new Date()) {
            const userQuery = db.prepare("SELECT * FROM users WHERE id = ?");
            const user = typeof userQuery.get === 'function'
              ? userQuery.get(sessionData.user_id)
              : await userQuery.get(sessionData.user_id);
            session = sessionData ? { ...sessionData, name: user?.name, email: user?.email } : null;
          } else {
            session = null;
          }
        }
      }
    } catch (error) {
      // Fallback for in-memory database (doesn't support JOIN)
      const sessionDataQuery = db.prepare("SELECT * FROM sessions WHERE token = ?");
      const sessionData = typeof sessionDataQuery.get === 'function'
        ? sessionDataQuery.get(token)
        : await sessionDataQuery.get(token);
        
      if (sessionData && new Date(sessionData.expires_at) > new Date()) {
        const userQuery = db.prepare("SELECT * FROM users WHERE id = ?");
        const user = typeof userQuery.get === 'function'
          ? userQuery.get(sessionData.user_id)
          : await userQuery.get(sessionData.user_id);
        session = sessionData ? { ...sessionData, name: user?.name, email: user?.email } : null;
      } else {
        session = null;
      }
    }

    if (!session) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user: { id: session.user_id, name: session.name, email: session.email },
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

