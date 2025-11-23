import { NextResponse } from "next/server";
import getDb from "../../../../lib/db";

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const db = getDb();

    // Find session
    const session = db
      .prepare(
        "SELECT s.*, u.name, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime('now')"
      )
      .get(token);

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

