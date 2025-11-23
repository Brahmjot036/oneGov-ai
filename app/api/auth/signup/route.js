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
    let existingUser;
    try {
      const existingUserQuery = db.prepare("SELECT id FROM users WHERE email = ?");
      if (typeof existingUserQuery.get === 'function') {
        existingUser = existingUserQuery.get(email.trim().toLowerCase());
      } else {
        existingUser = await existingUserQuery.get(email.trim().toLowerCase());
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    // Insert user - handle both sync and async
    let result;
    try {
      const insertQuery = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
      if (typeof insertQuery.run === 'function') {
        result = insertQuery.run(name.trim(), email.trim().toLowerCase(), hashedPassword);
      } else {
        result = await insertQuery.run(name.trim(), email.trim().toLowerCase(), hashedPassword);
      }
    } catch (insertError) {
      console.error("User insert error:", insertError);
      return NextResponse.json(
        { error: insertError.message || "Failed to create user. Please try again." },
        { status: 500 }
      );
    }

    if (!result || !result.lastInsertRowid) {
      console.error("User insert failed - no ID returned");
      return NextResponse.json(
        { error: "Failed to create user. Please try again." },
        { status: 500 }
      );
    }

    console.log("User created with ID:", result.lastInsertRowid);

    // Verify the user was created
    let newUser;
    try {
      const newUserQuery = db.prepare("SELECT id, name, email FROM users WHERE id = ?");
      if (typeof newUserQuery.get === 'function') {
        newUser = newUserQuery.get(result.lastInsertRowid);
      } else {
        newUser = await newUserQuery.get(result.lastInsertRowid);
      }
    } catch (verifyError) {
      console.error("User verification error:", verifyError);
      // Still return success since user was created
      newUser = { id: result.lastInsertRowid, name: name.trim(), email: email.trim().toLowerCase() };
    }
    console.log("User data stored:", newUser);

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

