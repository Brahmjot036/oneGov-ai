import { NextResponse } from "next/server";
import getDb from "../../../../lib/db";

export async function POST(req) {
  try {
    const { userId, title, messages } = await req.json();

    if (!userId || !title || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "userId, title, and messages array are required." },
        { status: 400 }
      );
    }

    const db = getDb();

    // Create a new chat session - handle both sync and async
    const now = new Date().toISOString();
    const sessionInsert = db.prepare(`
      INSERT INTO chat_sessions (user_id, title, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `);
    
    const sessionResult = sessionInsert.run(parseInt(userId), title, now, now);
    let result;
    if (sessionResult && typeof sessionResult.then === 'function') {
      result = await sessionResult;
    } else {
      result = sessionResult;
    }

    const sessionId = result?.lastInsertRowid;

    if (!sessionId) {
      throw new Error('Failed to create chat session');
    }

    // Insert all messages - handle both sync and async
    const insertMessage = db.prepare(`
      INSERT INTO chat_messages (session_id, role, content, created_at)
      VALUES (?, ?, ?, ?)
    `);

    const messageNow = new Date().toISOString();
    
    // Handle both sync and async databases
    const firstMessageResult = insertMessage.run(sessionId, messages[0]?.role, messages[0]?.content, messageNow);
    const isAsync = firstMessageResult && typeof firstMessageResult.then === 'function';
    
    if (isAsync) {
      // Async database (Supabase)
      for (const msg of messages) {
        await insertMessage.run(sessionId, msg.role, msg.content, messageNow);
      }
    } else {
      // Sync database
      if (typeof db.transaction === 'function') {
        const insertMany = db.transaction((msgs) => {
          for (const msg of msgs) {
            insertMessage.run(sessionId, msg.role, msg.content, messageNow);
          }
        });
        insertMany(messages);
      } else {
        for (const msg of messages) {
          insertMessage.run(sessionId, msg.role, msg.content, messageNow);
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      sessionId,
      message: "Chat history saved successfully"
    });

  } catch (error) {
    console.error("Save chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save chat history." },
      { status: 500 }
    );
  }
}

