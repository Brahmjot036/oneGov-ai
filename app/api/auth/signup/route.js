import { NextResponse } from "next/server";
import getDb from "../../../../lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    console.log("Signup request received:", { name, email, password: "***" });

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
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

    // Check if user already exists - handle both sync and async
    const normalizedEmail = email.trim().toLowerCase();
    let existingUser;
    try {
      const existingUserQuery = db.prepare("SELECT id FROM users WHERE email = ?");
      const queryResult = existingUserQuery.get(normalizedEmail);
      
      // Check if result is a Promise (async) or direct value (sync)
      if (queryResult && typeof queryResult.then === 'function') {
        existingUser = await queryResult;
      } else {
        existingUser = queryResult;
      }
    } catch (queryError) {
      console.error("User query error:", queryError);
      return NextResponse.json(
        { error: "Failed to check existing user. Please try again." },
        { status: 500 }
      );
    }
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed successfully");

    // Normalize email and name
    const normalizedName = name.trim();
    
    console.log("📝 Creating user:", { name: normalizedName, email: normalizedEmail });

    // Insert user - handle both sync and async databases
    let result;
    try {
      const insertQuery = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
      const insertResult = insertQuery.run(normalizedName, normalizedEmail, hashedPassword);
      
      // Check if result is a Promise (async) or direct value (sync)
      if (insertResult && typeof insertResult.then === 'function') {
        console.log("📡 Using async database (Supabase)");
        result = await insertResult;
      } else {
        console.log("💾 Using sync database (SQLite/in-memory)");
        result = insertResult;
      }
    } catch (insertError) {
      console.error("❌ User insert error:", insertError);
      console.error("❌ Insert error details:", insertError.message);
      console.error("❌ Error stack:", insertError.stack);
      
      // Check if it's a duplicate email error
      if (insertError.message && insertError.message.includes('UNIQUE constraint')) {
        return NextResponse.json(
          { error: "User with this email already exists." },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: insertError.message || "Failed to create user. Please try again." },
        { status: 500 }
      );
    }

    if (!result || !result.lastInsertRowid) {
      console.error("❌ User insert failed - no ID returned");
      console.error("❌ Result:", result);
      return NextResponse.json(
        { error: "Failed to create user. Please try again." },
        { status: 500 }
      );
    }

    console.log("✅ User created successfully with ID:", result.lastInsertRowid);

    // Verify the user was created and retrieve full user data
    let newUser;
    try {
      const newUserQuery = db.prepare("SELECT id, name, email FROM users WHERE id = ?");
      const verifyResult = newUserQuery.get(result.lastInsertRowid);
      
      // Check if result is a Promise (async) or direct value (sync)
      if (verifyResult && typeof verifyResult.then === 'function') {
        newUser = await verifyResult;
      } else {
        newUser = verifyResult;
      }
      
      if (!newUser) {
        // Fallback: use the data we have
        console.warn("⚠️  User verification returned null, using fallback data");
        newUser = { id: result.lastInsertRowid, name: normalizedName, email: normalizedEmail };
      } else {
        console.log("✅ User verified in database:", { id: newUser.id, name: newUser.name, email: newUser.email });
      }
    } catch (verifyError) {
      console.error("⚠️  User verification error:", verifyError);
      // Still return success since user was created
      newUser = { id: result.lastInsertRowid, name: normalizedName, email: normalizedEmail };
    }
    
    console.log("✅ Signup completed successfully for user:", newUser);

    return NextResponse.json(
      { 
        message: "User created successfully", 
        userId: result.lastInsertRowid,
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: error.message || "Failed to create user. Please try again." },
      { status: 500 }
    );
  }
}

