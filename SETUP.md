# Setup Instructions

## Installation

1. Install dependencies:
```bash
npm install
```

## Database Setup

The SQLite database will be automatically created in the `data/` directory when you first run the application. No manual setup required!

## Environment Variables

Create a `.env.local` file in the root directory:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Running the Application

```bash
npm run dev
```

## Features

- **Landing Page**: Beautiful animated landing page with feature highlights
- **Authentication**: Login/Signup with secure password hashing
- **Protected Chatbot**: Access chatbot only after login
- **SQLite Database**: Local database for user management
- **Modern UI**: Gradient designs, animations, and responsive layout

## File Structure

- `/app/page.js` - Landing page
- `/app/login/page.js` - Login/Signup page
- `/app/chatbot/page.js` - Protected chatbot page
- `/app/api/auth/` - Authentication API routes
- `/app/api/chat/route.js` - Chatbot API (unchanged)
- `/lib/db.js` - Database setup
- `/components/` - React components

## Notes

- The database file (`data/users.db`) is automatically created
- User sessions are stored in the database
- Passwords are hashed using bcrypt
- The chatbot backend route remains unchanged

