# 🚧 Skip Authentication for Development

This guide shows you how to temporarily disable authentication during development.

## Quick Setup

### 1. Add to `.env.local`

Add this line to your `.env.local` file:

```bash
SKIP_AUTH=true
```

Your complete `.env.local` should look like:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ghostdesk"

# Skip authentication for development
SKIP_AUTH=true

# NextAuth (not needed when SKIP_AUTH=true, but good to have)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-value-for-now"

# Environment
NODE_ENV="development"
```

### 2. Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Done! 🎉

You can now access all routes without logging in:

- Visit `http://localhost:3000`
- Access any workspace directly
- No login required

## What Gets Skipped

When `SKIP_AUTH=true`:

✅ **Middleware Protection** - All routes are accessible  
✅ **Workspace Layout Checks** - No session required  
✅ **API Route Authentication** - All APIs work without auth  
✅ **Workspace Membership** - No membership checks  

## Default Values in Dev Mode

When auth is skipped, these defaults are used:

- **User Email:** `dev@example.com`
- **User ID:** `dev-user-id`
- **Workspace Access:** All workspaces accessible

## Re-Enable Authentication

To turn authentication back on:

### Option 1: Change the value

```bash
SKIP_AUTH=false
```

### Option 2: Remove the line

Just delete or comment out the `SKIP_AUTH` line:

```bash
# SKIP_AUTH=true
```

### Option 3: Leave it unset

Don't set `SKIP_AUTH` at all - authentication will be enabled by default.

Then restart your dev server.

## Important Notes

⚠️ **Development Only**

This feature is for local development ONLY. Never deploy to production with `SKIP_AUTH=true`.

⚠️ **Database State**

You might need a real user in the database for certain operations. If you get database errors, create a user with ID `dev-user-id`:

```sql
-- Optional: Create a dev user in PostgreSQL
INSERT INTO "User" (id, email, name, "passwordHash", "createdAt", "updatedAt")
VALUES (
  'dev-user-id',
  'dev@example.com',
  'Dev User',
  '$2a$10$dummy.hash.for.dev.only',
  NOW(),
  NOW()
);
```

⚠️ **NextAuth Still Needed**

Even with auth skipped, NextAuth configuration is still in place. When you're ready to test authentication, just change `SKIP_AUTH=false` and restart.

## Troubleshooting

### "Still redirecting to login"

- Make sure `.env.local` file is in the project root
- Verify `SKIP_AUTH=true` (exactly, case-sensitive)
- Restart the dev server completely
- Check terminal for any environment variable errors

### "Database errors about user ID"

The app tries to use `dev-user-id` as the user ID. Either:
- Create a user with that ID in the database (see SQL above)
- Or temporarily modify the `dev-user-id` value in the code to match an existing user

### "Changes not applying"

- Environment variables are loaded on server start
- You MUST restart the dev server after changing `.env.local`
- Clear browser cookies if still having issues

---

**When you're ready to test the full authentication system:**

1. Set `SKIP_AUTH=false` (or remove it)
2. Set proper `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
3. Restart dev server
4. Test login/register flows

See `AUTH_SETUP.md` for complete authentication documentation.




