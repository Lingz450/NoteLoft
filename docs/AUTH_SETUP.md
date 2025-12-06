# Authentication Setup Guide - GhostDesk

This document explains the authentication system implementation and how to set it up.

## Overview

GhostDesk uses a modern, secure authentication system built with:

- **NextAuth.js v4** - Authentication framework for Next.js
- **JWT Sessions** - Stateless, fast sessions
- **bcrypt** - Secure password hashing
- **Zod** - Input validation
- **Prisma** - Database ORM with PostgreSQL

## Architecture

### Authentication Flow

1. **Registration** (`/auth/register`)
   - User enters name, email, and password
   - Input validated with Zod schemas
   - Password hashed with bcrypt (10 rounds)
   - User created in database
   - Automatic sign-in after registration

2. **Login** (`/auth/login`)
   - User enters email and password
   - NextAuth Credentials provider validates
   - Password compared with bcrypt
   - JWT token issued on success

3. **Protected Routes**
   - Middleware protects all `/workspace/*` routes
   - API routes check workspace membership
   - Unauthorized users redirected to login

### File Structure

```
lib/
├── auth.ts                          # NextAuth config & auth helpers
└── validation/
    └── auth.ts                      # Zod validation schemas

app/
├── api/
│   └── auth/
│       ├── [...nextauth]/route.ts  # NextAuth API route
│       └── register/route.ts       # Registration endpoint
├── auth/
│   ├── login/page.tsx              # Login UI
│   ├── register/page.tsx           # Registration UI
│   └── error/page.tsx              # Auth error page
└── workspace/
    └── [workspaceId]/
        └── layout.tsx              # Workspace auth check

middleware.ts                        # Route protection middleware
```

## Environment Variables Setup

### Required Configuration

Create a `.env.local` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ghostdesk"

# NextAuth (REQUIRED)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Environment
NODE_ENV="development"
```

### Generate NEXTAUTH_SECRET

**Option 1: Using OpenSSL**
```bash
openssl rand -base64 32
```

**Option 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and set it as your `NEXTAUTH_SECRET`.

## API Endpoints

### POST /api/auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe" // optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (400):**
```json
{
  "error": "User with this email already exists"
}
```

### NextAuth Endpoints

- `POST /api/auth/signin/credentials` - Sign in
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/providers` - List auth providers
- `GET /api/auth/csrf` - Get CSRF token

## Authentication Helpers

### Server-Side

```typescript
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

// Get current user or throw error
const user = await requireUser();

// Check workspace membership
const { user, workspace, role } = await requireWorkspaceMember(workspaceId);
```

### Client-Side

```typescript
import { useSession, signIn, signOut } from "next-auth/react";

// Get session in component
const { data: session, status } = useSession();

// Sign in
await signIn("credentials", {
  email: "user@example.com",
  password: "password",
  callbackUrl: "/"
});

// Sign out
await signOut({ callbackUrl: "/auth/login" });
```

## Route Protection

### Middleware Protection

All routes matching these patterns are protected:

- `/workspace/:path*` - All workspace pages
- `/api/workspaces/:path*` - Workspace API endpoints
- `/api/pages/:path*` - Pages API endpoints
- `/api/tasks/:path*` - Tasks API endpoints

Unauthenticated users are redirected to `/auth/login`.

### Workspace Membership Enforcement

Every workspace route checks:
1. User is authenticated
2. User is a member or owner of the workspace

If checks fail, user is redirected with an error.

## Security Features

✅ **Password Security**
- Minimum 8 characters enforced
- Hashed with bcrypt (10 rounds)
- Never stored in plaintext

✅ **Input Validation**
- All inputs validated with Zod
- Email format validation
- SQL injection prevention (Prisma)

✅ **Session Security**
- JWT tokens signed with secret
- 30-day expiration
- Secure httpOnly cookies

✅ **CSRF Protection**
- NextAuth built-in CSRF tokens
- Double-submit cookie pattern

✅ **Route Protection**
- Middleware-level authentication
- Server-side session checks
- Workspace membership enforcement

## Validation Rules

### Registration

- **Email:** Required, valid email format
- **Password:** Required, minimum 8 characters, maximum 100
- **Name:** Optional, maximum 100 characters

### Login

- **Email:** Required, valid email format
- **Password:** Required

## Database Schema

The authentication system uses these Prisma models:

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relations
  workspaces   Workspace[]
  memberships  WorkspaceMember[]
  sessions     Session[]
  accounts     Account[]
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(...)
}

model Account {
  // For future OAuth providers
}
```

## Troubleshooting

### "NEXTAUTH_SECRET" warning

**Problem:** Warning about missing NEXTAUTH_SECRET in console.

**Solution:** Add `NEXTAUTH_SECRET` to your `.env.local` file.

### "Illegal arguments: string, undefined" error

**Problem:** Authentication fails with bcrypt error.

**Solution:** 
1. Ensure `NEXTAUTH_SECRET` is set
2. Check database connection
3. Verify user's passwordHash is not null

### Redirected to login repeatedly

**Problem:** Can't access protected routes even when logged in.

**Solution:**
1. Clear browser cookies
2. Restart dev server after env changes
3. Check `NEXTAUTH_URL` matches your domain

### "Forbidden - not a member" error

**Problem:** Can't access a workspace you should have access to.

**Solution:**
1. Verify WorkspaceMember record exists
2. Check workspace ID is correct
3. Ensure user is workspace owner or member

## Production Deployment

### Checklist

- [ ] Set strong `NEXTAUTH_SECRET` (32+ bytes)
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Enable HTTPS (required for cookies)
- [ ] Set `NODE_ENV=production`
- [ ] Run database migrations
- [ ] Test authentication flow
- [ ] Enable rate limiting (recommended)

### Environment Variables

```bash
# Production
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<strong-random-secret>"
NODE_ENV="production"
```

## Testing

### Manual Testing Checklist

- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Access protected route when logged out (should redirect)
- [ ] Access workspace as member (should work)
- [ ] Access workspace as non-member (should redirect)
- [ ] Sign out
- [ ] Session persists after page reload

## Future Enhancements

Possible improvements to consider:

- OAuth providers (Google, GitHub, etc.)
- Email verification
- Password reset functionality
- Two-factor authentication (2FA)
- Rate limiting on auth endpoints
- Account lockout after failed attempts
- Session management UI

---

**Built with ❤️ for GhostDesk**




