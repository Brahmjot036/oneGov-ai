import { NextResponse } from "next/server";
import getDb from "../../../../lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    console.log("Login request received:", { email, password: "***" });

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const db = getDb();

    // Find user - handle both sync (SQLite) and async (Supabase) databases
    let user;
    const userQuery = db.prepare("SELECT * FROM users WHERE email = ?");
    const result = userQuery.get(email.trim().toLowerCase());
    // Check if result is a Promise (async) or direct value (sync)
    if (result && typeof result.then === 'function') {
      // Async database (Supabase)
      user = await result;
    } else {
      // Sync database (SQLite or in-memory)
      user = result;
    }
    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    console.log("User found:", { id: user.id, name: user.name, email: user.email });

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log("Invalid password for user:", email);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    console.log("Password verified successfully");

    // Create session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store session - handle both sync and async
    const sessionInsert = db.prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
    const sessionResult = sessionInsert.run(user.id, token, expiresAt.toISOString());
    if (sessionResult && typeof sessionResult.then === 'function') {
      await sessionResult;
    }

    // Clean up expired sessions
    const sessionDelete = db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')");
    const deleteResult = sessionDelete.run();
    if (deleteResult && typeof deleteResult.then === 'function') {
      await deleteResult;
    }

    console.log("Session created for user:", user.id);

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: error.message || "Failed to login. Please try again." },
      { status: 500 }
    );
  }
}

