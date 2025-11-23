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

    let db;
    try {
      db = getDb();
    } catch (dbError) {
      console.error("Database initialization error:", dbError);
      return NextResponse.json(
        { error: "Database initialization failed. Please try again." },
        { status: 500 }
      );
    }

    // Find user - handle both sync (SQLite) and async (Supabase) databases
    let user;
    try {
      const userQuery = db.prepare("SELECT * FROM users WHERE email = ?");
      if (typeof userQuery.get === 'function') {
        // Sync database (SQLite or in-memory)
        user = userQuery.get(email.trim().toLowerCase());
      } else {
        // Async database (Supabase)
        user = await userQuery.get(email.trim().toLowerCase());
      }
    } catch (queryError) {
      console.error("User query error:", queryError);
      return NextResponse.json(
        { error: "Failed to query user. Please try again." },
        { status: 500 }
      );
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
    if (typeof sessionInsert.run === 'function') {
      sessionInsert.run(user.id, token, expiresAt.toISOString());
    } else {
      await sessionInsert.run(user.id, token, expiresAt.toISOString());
    }

    // Clean up expired sessions
    const sessionDelete = db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')");
    if (typeof sessionDelete.run === 'function') {
      sessionDelete.run();
    } else {
      await sessionDelete.run();
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

