# Vercel Deployment Notes

## Important: Database Configuration

⚠️ **SQLite (better-sqlite3) does NOT work on Vercel serverless functions** because:
- Vercel functions are stateless and ephemeral
- The filesystem is read-only (except `/tmp`)
- SQLite requires a persistent writable file

## Solutions for Production

### Option 1: Use Vercel Postgres (Recommended)
1. Add Vercel Postgres to your project
2. Update `lib/db.js` to use PostgreSQL instead of SQLite
3. Use a PostgreSQL client like `@vercel/postgres` or `pg`

### Option 2: Use External Database Service
- **Supabase** (PostgreSQL) - Free tier available
- **PlanetScale** (MySQL) - Free tier available
- **MongoDB Atlas** (MongoDB) - Free tier available
- **Railway** (PostgreSQL) - Free tier available

### Option 3: Use Vercel KV (Redis) for Sessions
- Use Vercel KV for session storage
- Keep SQLite for local development only

## Current Status

The app is configured to externalize `better-sqlite3` which allows the build to succeed, but database operations will fail at runtime on Vercel.

## Environment Variables Needed

Make sure to set these in Vercel:
- `GEMINI_API_KEY` - Your Google Gemini API key

## Migration Steps

1. Choose a database solution (recommend Vercel Postgres)
2. Update `lib/db.js` to use the new database
3. Update all API routes to use the new database client
4. Test locally with the new database
5. Deploy to Vercel

## Local Development

SQLite will continue to work fine for local development. The database file is in `/data/users.db` and is gitignored.

