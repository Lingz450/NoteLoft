# 🚀 Easy OAuth Sign-In Setup

Add "Sign in with Google" and "Sign in with GitHub" to NOTELOFT!

## ✨ What You Get

- **One-click sign in** with Google or GitHub
- **No password needed** for users
- **Auto-create workspace** on first OAuth login
- **Keep email/password** as backup option

---

## 🔧 Setup Instructions

### **Option 1: Google OAuth (Recommended - Most Students Have Gmail)**

#### Step 1: Go to Google Cloud Console

Visit: https://console.cloud.google.com/

#### Step 2: Create a Project

1. Click "Select a project" → "New Project"
2. Name it "NOTELOFT" → Create

#### Step 3: Enable Google+ API

1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

#### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: **NOTELOFT**
   - User support email: **your email**
   - Developer contact: **your email**
   - Save and Continue (skip scopes, test users)

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **NOTELOFT**
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google` (for production)
   - Click **Create**

#### Step 5: Copy Credentials

You'll see:
- **Client ID**: `123456789-abcdef.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abc123...`

Add to your `.env.local`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

---

### **Option 2: GitHub OAuth**

#### Step 1: Go to GitHub Settings

Visit: https://github.com/settings/developers

#### Step 2: Create OAuth App

1. Click "OAuth Apps" → "New OAuth App"
2. Fill in:
   - **Application name**: NOTELOFT
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Click **Register application**

#### Step 3: Generate Client Secret

1. Click "Generate a new client secret"
2. Copy the secret (you won't see it again!)

#### Step 4: Copy Credentials

Add to your `.env.local`:

```bash
# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

---

## 📝 Complete .env.local Example

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-from-before"

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID="123456789-abcdefghijk.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"

# GitHub OAuth (get from GitHub Developer Settings)
GITHUB_CLIENT_ID="abc123def456"
GITHUB_CLIENT_SECRET="github-secret-here"
```

---

## 🔄 Apply Changes

After adding credentials:

### Step 1: Update Database Schema

```bash
npx prisma migrate dev --name oauth-support
```

### Step 2: Restart Server

```bash
npm run dev
```

### Step 3: Test!

1. Visit `http://localhost:3000/auth/login`
2. Click **"Continue with Google"** or **"Continue with GitHub"**
3. Authorize the app
4. You're in! 🎉

---

## ✅ What Happens on First OAuth Login

1. User clicks "Continue with Google/GitHub"
2. OAuth provider authenticates user
3. NOTELOFT creates user account automatically
4. Default workspace "My Semester" is created
5. User is redirected to dashboard

---

## 🎯 Benefits

### For Users
- ✅ **No password to remember**
- ✅ **One-click sign in**
- ✅ **Secure** (handled by Google/GitHub)
- ✅ **Fast** (no email verification needed)

### For You
- ✅ **Higher conversion** (easier signup = more users)
- ✅ **Less support** (no password reset emails)
- ✅ **More secure** (OAuth providers handle security)
- ✅ **Professional** (like Notion, Slack, etc.)

---

## 🐛 Troubleshooting

### "OAuth provider not configured"

**Solution**: Make sure you added both `CLIENT_ID` and `CLIENT_SECRET` to `.env.local`

### "Redirect URI mismatch"

**Solution**: Check that the callback URL in Google/GitHub matches exactly:
- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/github`

### "Access blocked: This app's request is invalid"

**Solution**: 
1. Go to OAuth consent screen in Google Cloud Console
2. Add your email as a test user
3. Or publish the app (for production)

### Still using old schema

**Solution**: 
```bash
npx prisma migrate reset
npx prisma db seed
```

---

## 🚀 Production Deployment

When deploying to production (Vercel, Railway, etc.):

1. **Add production URLs** to OAuth providers:
   - Google: Add `https://yourdomain.com` and callback URL
   - GitHub: Add `https://yourdomain.com` and callback URL

2. **Update environment variables** on hosting platform:
   ```
   NEXTAUTH_URL="https://yourdomain.com"
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   GITHUB_CLIENT_ID="..."
   GITHUB_CLIENT_SECRET="..."
   ```

3. **Publish OAuth consent screen** (Google only):
   - Go to OAuth consent screen in Google Cloud Console
   - Click "Publish App"

---

## 💡 Tips

- **Google is preferred** for students (everyone has Gmail)
- **GitHub is great** for developer/CS students
- **Email/password still works** as backup
- Users can use **different providers** with same email
- OAuth users don't need email verification

---

## 🎉 Done!

You now have **professional OAuth authentication** just like Notion, Slack, and other modern apps!

**Try it**: http://localhost:3000/auth/login

Click "Continue with Google" and you're in! 🚀



