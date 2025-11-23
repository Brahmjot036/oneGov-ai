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

    const db = getDb();

    // Check if user already exists
    const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email.trim().toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    // Insert user
    const result = db
      .prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")
      .run(name.trim(), email.trim().toLowerCase(), hashedPassword);

    console.log("User created with ID:", result.lastInsertRowid);

    // Verify the user was created
    const newUser = db.prepare("SELECT id, name, email FROM users WHERE id = ?").get(result.lastInsertRowid);
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

