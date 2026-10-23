# Cloudflare Deployment & Production Setup Guide

This guide details how to deploy **AI SOFT STUDIO** to **Cloudflare Pages** or **Cloudflare Workers**.

---

## 1. Cloudflare Pages Deployment (Recommended)

Cloudflare Pages provides global low-latency CDN delivery, automatic SSL, asset caching, and zero-cold-start performance.

### Step 1: Connect Git Repository
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository containing the AI SOFT STUDIO project.

### Step 2: Build & Output Configuration
In the Cloudflare Pages build setup screen, configure:

| Setting | Value |
| :--- | :--- |
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Node.js Version** | `20.x` or `22.x` (Set env `NODE_VERSION=20`) |

### Step 3: Environment Variables
Under **Settings** > **Environment variables**, define your production Supabase keys for both **Production** and **Preview** environments:

```ini
VITE_SUPABASE_URL = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-public-key
```

*Note: If using Next.js / SSR style keys, you can also define `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.*

### Step 4: Single-Page Application (SPA) Routing Rule
Cloudflare Pages serves SPAs out of the box. To ensure all deep admin routes (e.g., `/admin`, `/admin/leads`, `/admin/login`) route to `index.html` without 404s, create `public/_redirects`:

```
/*    /index.html   200
```

*(This file is already included in `/public/_redirects`).*

---

## 2. Cloudflare Headers & Security Configuration

A `public/_headers` file is provided to enforce enterprise security:
- `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 3. Local Production Preview & Testing

To test the exact production build locally before triggering a deployment:

```bash
# 1. Typecheck & build production bundle
npm run build

# 2. Preview the built dist folder locally
npm run preview
```

---

## 4. Verification Checklist
- [ ] Public site loads at root URL with 3D AI Core and continuous animations.
- [ ] Direct navigation to `/admin/login` loads login interface.
- [ ] Direct navigation to `/admin/leads` and other admin routes succeeds without 404.
- [ ] Contact form submissions insert into Supabase `leads` and notify staff.
- [ ] RLS policies block unauthorized read access to `leads` and `audit_logs`.
