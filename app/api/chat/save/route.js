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

    // Create a new chat session
    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO chat_sessions (user_id, title, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `).run(parseInt(userId), title, now, now);

    const sessionId = result.lastInsertRowid;

    // Insert all messages
    const insertMessage = db.prepare(`
      INSERT INTO chat_messages (session_id, role, content, created_at)
      VALUES (?, ?, ?, ?)
    `);

    // Handle transaction for both SQLite and in-memory
    const messageNow = new Date().toISOString();
    if (typeof db.transaction === 'function' && db.transaction.length > 0) {
      const insertMany = db.transaction((messages) => {
        for (const msg of messages) {
          insertMessage.run(sessionId, msg.role, msg.content, messageNow);
        }
      });
      insertMany(messages);
    } else {
      // Fallback for in-memory database
      for (const msg of messages) {
        insertMessage.run(sessionId, msg.role, msg.content, messageNow);
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

