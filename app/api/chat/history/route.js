import { NextResponse } from "next/server";
import getDb from "../../../../lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required." },
        { status: 400 }
      );
    }

    const db = getDb();

    // Get all chat sessions for the user - handle both sync and async
    const sessionsQuery = db.prepare(`
      SELECT 
        cs.id,
        cs.title,
        cs.created_at,
        cs.updated_at,
        (SELECT content FROM chat_messages 
         WHERE session_id = cs.id 
         ORDER BY created_at DESC LIMIT 1) as lastMessage
      FROM chat_sessions cs
      WHERE cs.user_id = ?
      ORDER BY cs.updated_at DESC
      LIMIT 50
    `);
    
    const sessionsResultPromise = sessionsQuery.all(parseInt(userId));
    let sessionsResult;
    if (sessionsResultPromise && typeof sessionsResultPromise.then === 'function') {
      sessionsResult = await sessionsResultPromise;
    } else {
      sessionsResult = sessionsResultPromise;
    }
    
    // Handle both array and object results
    const sessions = Array.isArray(sessionsResult) ? sessionsResult : (sessionsResult ? [sessionsResult] : []);

    return NextResponse.json({ 
      history: sessions.map(session => ({
        id: session.id.toString(),
        title: session.title,
        lastMessage: session.lastMessage || '',
        timestamp: new Date(session.updated_at)
      }))
    });

  } catch (error) {
    console.error("Get chat history API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chat history." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required." },
        { status: 400 }
      );
    }

    const db = getDb();

    // Get all messages for a specific session - handle both sync and async
    const messagesQuery = db.prepare(`
      SELECT role, content, created_at
      FROM chat_messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `);
    
    const messagesPromise = messagesQuery.all(parseInt(sessionId));
    let messages;
    if (messagesPromise && typeof messagesPromise.then === 'function') {
      messages = await messagesPromise;
    } else {
      messages = messagesPromise;
    }

    return NextResponse.json({ 
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }))
    });

  } catch (error) {
    console.error("Get chat messages API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chat messages." },
      { status: 500 }
    );
  }
}

