# AI SOFT STUDIO — Supabase Integration & SSR Setup Guide

This guide details the Supabase configuration with `@supabase/supabase-js` and `@supabase/ssr` for **AI SOFT STUDIO**.

---

## 1. Architecture & Helper Structure

- **Client-Side Helper (`/utils/supabase/client.ts`)**: Uses `@supabase/ssr` `createBrowserClient` with auto session persistence and cookie/local storage.
- **Server-Side Helper (`/utils/supabase/server.ts`)**: Uses `@supabase/ssr` `createServerClient` for server components, route handlers, or API middleware with cookie syncing.
- **Session Middleware (`/utils/supabase/middleware.ts`)**: Provides `updateSession` to refresh user credentials and validate JWT tokens with `supabase.auth.getUser()`.
- **Legacy / Vite Compatibility (`/src/lib/supabase.ts`)**: Standard client wrapping `utils/supabase/client.ts` with instant fallback when keys are unconfigured.

---

## 2. Environment Variables Configuration

Create or update `.env.local` in your root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-anon-or-publishable-key"
```

> **Security Note:**
> - `.env.local` is listed in `.gitignore` and must never be committed to Git.
> - Never place your `SUPABASE_SERVICE_ROLE_KEY` or database password in `.env.local` or any browser-accessible file.

---

## 3. Database Schema & Row Level Security (RLS)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and navigate to **SQL Editor**.
2. Open `/supabase/schema.sql` from this repository.
3. Paste and run the SQL script. This executes:
   - Creation of `profiles`, `leads`, `services`, `projects`, `site_settings`, `notifications`, and `audit_logs`.
   - Security helper functions (`is_admin()`, `is_editor_or_admin()`).
   - `handle_new_user()` trigger to automatically create profile records upon auth user creation.
   - Strict Row Level Security:
     - Public visitors (`anon`) can only `INSERT` into `leads` and `SELECT` published `services` & `projects`.
     - Only authenticated users with `role = 'admin'` or `role = 'editor'` can view or mutate leads and administrative settings.
     - Public visitors have **zero access** to read private customer leads or user profiles.

---

## 4. Secure First Administrator Provisioning

Registration of administrators is restricted to prevent self-elevation by visitors.

1. Go to **Authentication > Users** in the Supabase Dashboard.
2. Click **Add User** -> **Create user**.
3. Enter your administrator email (e.g. `admin@aisoftstudio.io`) and a strong password. Toggle "Auto Confirm User".
4. Elevate the user profile to `admin` in the **SQL Editor**:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@aisoftstudio.io';
```

---

## 5. Admin Authentication & Route Protection

- **Login Screen**: `/admin/login`
  - Validates credentials directly against Supabase Auth (`signInWithPassword`).
  - Rate-limited to prevent brute-force attacks (5 failed attempts locks for 60 seconds).
  - Rejects arbitrary or mock credentials.
- **Protected Routes**:
  - `/admin`, `/admin/leads`, `/admin/services`, `/admin/projects`, `/admin/users`, `/admin/notifications`, `/admin/settings`, `/admin/audit-logs`.
  - Unauthenticated visitors are automatically routed to `/admin/login`.

---

## 6. Manual Actions Required by You

1. **Paste Credentials**: Add your real Supabase URL and Publishable/Anon Key into `.env.local`.
2. **Execute Schema**: Run `/supabase/schema.sql` in your Supabase SQL Editor.
3. **Create First Admin**: Add your admin user in Supabase Authentication and elevate role to `admin` in `public.profiles`.
