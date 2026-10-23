-- ==============================================================================
-- AI SOFT STUDIO - Production Database Schema & Row Level Security (RLS)
-- Version: 1.0.0
-- Compatible with PostgreSQL 15+ and Supabase
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. User Profiles & Role-Based Access Control (RBAC)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role and email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Automatic Profile Creation Trigger on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. Contact Form Leads Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  service TEXT NOT NULL,
  budget TEXT,
  details TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'contacted', 'qualified', 'in_progress', 'converted', 'closed')) DEFAULT 'new',
  notes TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- ==============================================================================
-- 4. Editable Website Services Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  highlights TEXT[] NOT NULL DEFAULT '{}',
  icon_type TEXT NOT NULL DEFAULT 'ai',
  gradient TEXT NOT NULL DEFAULT 'from-violet-500/20 via-cyan-500/10 to-transparent',
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_display_order ON public.services(display_order);
CREATE INDEX IF NOT EXISTS idx_services_published ON public.services(published);

-- ==============================================================================
-- 5. Portfolio Projects Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  category TEXT NOT NULL,
  all_categories TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT NOT NULL,
  concept_summary TEXT NOT NULL,
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  accent_color TEXT NOT NULL DEFAULT '#8B5CF6',
  is_concept BOOLEAN NOT NULL DEFAULT true,
  project_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_display_order ON public.projects(display_order);
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(published);

-- ==============================================================================
-- 6. Configurable Website Settings Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_name TEXT NOT NULL DEFAULT 'AI SOFT STUDIO',
  logo_text TEXT NOT NULL DEFAULT 'AI SOFT STUDIO',
  tagline TEXT NOT NULL DEFAULT 'Futuristic Digital Experience & Software Engineering',
  hero_heading TEXT NOT NULL DEFAULT 'We Build What''s Next.',
  hero_description TEXT NOT NULL DEFAULT 'AI-powered experiences, intelligent automation, and digital products engineered to move your business forward.',
  contact_email TEXT NOT NULL DEFAULT 'hello@aisoftstudio.io',
  location TEXT NOT NULL DEFAULT 'Distributed Global Studio · Remote-First',
  footer_text TEXT NOT NULL DEFAULT 'Architecting high-performance digital systems, custom AI integrations, and responsive software.',
  social_links JSONB NOT NULL DEFAULT '[
    {"name": "GitHub", "url": "https://github.com", "handle": "aisoftstudio"},
    {"name": "X / Twitter", "url": "https://twitter.com", "handle": "@aisoftstudio"},
    {"name": "LinkedIn", "url": "https://linkedin.com", "handle": "ai-soft-studio"},
    {"name": "Discord", "url": "https://discord.com", "handle": "aisoft-community"}
  ]'::jsonb,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  seo_title TEXT NOT NULL DEFAULT 'AI SOFT STUDIO — Futuristic Digital Experience & Software Engineering',
  seo_description TEXT NOT NULL DEFAULT 'AI-powered experiences, intelligent automation, and digital products engineered to move your business forward.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. In-Dashboard Notifications Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lead', 'status', 'security', 'system')) DEFAULT 'system',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ==============================================================================
-- 8. Security & Audit Logs Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- ==============================================================================
-- 9. Helper Authorization Functions (Security Definer)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 10. Enable Row Level Security (RLS) on All Tables
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 11. Row Level Security Policies
-- ==============================================================================

-- Profiles:
-- Any authenticated user can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

-- Only admins can update profiles (including roles)
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Leads:
-- Public visitors (anon + authenticated) can insert new leads (contact form)
CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) >= 2 AND
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    char_length(details) >= 10
  );

-- Only Admin & Editor can view leads
CREATE POLICY "Authorized staff can read leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.is_editor_or_admin());

-- Only Admin & Editor can update lead statuses and notes
CREATE POLICY "Authorized staff can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (public.is_editor_or_admin());

-- Only Admin can delete leads
CREATE POLICY "Admins can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Services:
-- Public can view published services
CREATE POLICY "Public can view published services"
  ON public.services FOR SELECT
  TO anon, authenticated
  USING (published = true OR public.is_editor_or_admin());

-- Admin & Editor can manage services
CREATE POLICY "Staff can manage services"
  ON public.services FOR ALL
  TO authenticated
  USING (public.is_editor_or_admin());

-- Projects:
-- Public can view published projects
CREATE POLICY "Public can view published projects"
  ON public.projects FOR SELECT
  TO anon, authenticated
  USING (published = true OR public.is_editor_or_admin());

-- Admin & Editor can manage projects
CREATE POLICY "Staff can manage projects"
  ON public.projects FOR ALL
  TO authenticated
  USING (public.is_editor_or_admin());

-- Site Settings:
-- Public can view site settings
CREATE POLICY "Public can read site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only Admin can update site settings
CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Notifications:
-- Authorized staff can read and manage notifications
CREATE POLICY "Staff can read notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (public.is_editor_or_admin());

CREATE POLICY "Staff can update notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (public.is_editor_or_admin());

-- Audit Logs:
-- Authorized staff can insert audit logs
CREATE POLICY "Staff can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only Admin can view audit logs (immutable logs: no update or delete allowed!)
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- 12. Seed Default Settings
-- ==============================================================================
INSERT INTO public.site_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 13. Instructions for Creating the First Administrator
-- ==============================================================================
-- Step 1: Create a user via Supabase Dashboard -> Authentication -> Users -> "Invite user" or "Add user".
-- Step 2: Run the following SQL query to elevate that user to 'admin':
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'your-admin-email@domain.com';
-- ==============================================================================
