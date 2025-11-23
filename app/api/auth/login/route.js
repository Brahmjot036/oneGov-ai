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
    const normalizedEmail = email.trim().toLowerCase();
    console.log("🔍 Searching for user with email:", normalizedEmail);
    
    let user;
    try {
      const userQuery = db.prepare("SELECT * FROM users WHERE email = ?");
      const queryResult = userQuery.get(normalizedEmail);
      
      // Check if result is a Promise (async) or direct value (sync)
      if (queryResult && typeof queryResult.then === 'function') {
        // Async database (Supabase)
        console.log("📡 Using async database (Supabase)");
        user = await queryResult;
      } else {
        // Sync database (SQLite or in-memory)
        console.log("💾 Using sync database (SQLite/in-memory)");
        user = queryResult;
      }
      
      console.log("👤 Query result:", user ? `User found (ID: ${user.id})` : "User not found");
    } catch (queryError) {
      console.error("❌ User query error:", queryError);
      console.error("❌ Query error stack:", queryError.stack);
      return NextResponse.json(
        { error: "Failed to query user. Please try again." },
        { status: 500 }
      );
    }
    
    if (!user) {
      console.log("User not found for email:", normalizedEmail);
      // Debug: Log all users in database (for serverless DB debugging)
      if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV) {
        try {
          // Try to get all users for debugging (only in serverless mode)
          const allUsersQuery = db.prepare("SELECT id, email FROM users");
          let allUsers = [];
          if (typeof allUsersQuery.all === 'function') {
            allUsers = allUsersQuery.all();
          }
          console.log("All users in database:", allUsers);
          console.log("Database is in-memory (stateless) - data resets between requests on Vercel");
        } catch (debugError) {
          console.log("Could not debug users:", debugError.message);
        }
      }
      // Check if we're using in-memory database
      const isUsingInMemory = process.env.VERCEL && !process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      return NextResponse.json(
        { 
          error: isUsingInMemory 
            ? "Invalid email or password. The app is using an in-memory database that resets between requests. Please set up Supabase and add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables in Vercel, then redeploy."
            : "Invalid email or password.",
          requiresDatabase: isUsingInMemory
        },
        { status: 401 }
      );
    }

    console.log("User found:", { id: user.id, name: user.name, email: user.email });

    // Verify password
    if (!user.password) {
      console.error("User has no password stored:", user.id);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log("Invalid password for user:", normalizedEmail);
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
    try {
      const sessionInsert = db.prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
      const sessionResult = sessionInsert.run(user.id, token, expiresAt.toISOString());
      
      // Check if result is a Promise (async) or direct value (sync)
      if (sessionResult && typeof sessionResult.then === 'function') {
        await sessionResult;
      }
    } catch (sessionError) {
      console.error("Session creation error:", sessionError);
      // Don't fail login if session creation fails, but log it
    }

    // Clean up expired sessions (non-blocking)
    try {
      const sessionDelete = db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')");
      const deleteResult = sessionDelete.run();
      if (deleteResult && typeof deleteResult.then === 'function') {
        await deleteResult;
      }
    } catch (cleanupError) {
      // Non-critical error, just log it
      console.warn("Session cleanup error:", cleanupError);
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

