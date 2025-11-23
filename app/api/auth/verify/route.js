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
      // Try JOIN query first (works for SQLite)
      const sessionQuery = db.prepare(
        "SELECT s.*, u.name, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime('now')"
      );
      const sessionResult = sessionQuery.get(token);
      
      if (sessionResult && typeof sessionResult.then === 'function') {
        // Async database (Supabase) - JOIN might not work, fallback to separate queries
        try {
          session = await sessionResult;
        } catch (joinError) {
          // Fallback: query separately
          const sessionDataQuery = db.prepare("SELECT * FROM sessions WHERE token = ?");
          const sessionDataResult = sessionDataQuery.get(token);
          const sessionData = sessionDataResult && typeof sessionDataResult.then === 'function'
            ? await sessionDataResult
            : sessionDataResult;
            
          if (sessionData && new Date(sessionData.expires_at) > new Date()) {
            const userQuery = db.prepare("SELECT * FROM users WHERE id = ?");
            const userResult = userQuery.get(sessionData.user_id);
            const user = userResult && typeof userResult.then === 'function'
              ? await userResult
              : userResult;
            session = sessionData ? { ...sessionData, name: user?.name, email: user?.email } : null;
          } else {
            session = null;
          }
        }
      } else {
        // Sync database (SQLite)
        session = sessionResult;
      }
    } catch (error) {
      // Fallback for in-memory database (doesn't support JOIN)
      const sessionDataQuery = db.prepare("SELECT * FROM sessions WHERE token = ?");
      const sessionDataResult = sessionDataQuery.get(token);
      const sessionData = sessionDataResult && typeof sessionDataResult.then === 'function'
        ? await sessionDataResult
        : sessionDataResult;
        
      if (sessionData && new Date(sessionData.expires_at) > new Date()) {
        const userQuery = db.prepare("SELECT * FROM users WHERE id = ?");
        const userResult = userQuery.get(sessionData.user_id);
        const user = userResult && typeof userResult.then === 'function'
          ? await userResult
          : userResult;
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

