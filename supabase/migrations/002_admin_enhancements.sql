-- ==============================================================================
-- AI SOFT STUDIO — Migration 002: Admin Enhancements & Feature Expansion
-- Version: 1.1.0
-- Applies schema enhancements for site_settings, services, and projects
-- Safe and idempotent (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- ==============================================================================

-- 1. Ensure site_settings has logo_text and footer_text columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'logo_text'
  ) THEN
    ALTER TABLE public.site_settings ADD COLUMN logo_text TEXT NOT NULL DEFAULT 'AI SOFT STUDIO';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'footer_text'
  ) THEN
    ALTER TABLE public.site_settings ADD COLUMN footer_text TEXT NOT NULL DEFAULT 'Architecting high-performance digital systems, custom AI integrations, and responsive software.';
  END IF;
END $$;

-- 2. Ensure services has display_order and published columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE public.services ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'published'
  ) THEN
    ALTER TABLE public.services ADD COLUMN published BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- 3. Ensure projects has concept, url, display_order, and published columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'is_concept'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN is_concept BOOLEAN NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'project_url'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN project_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'published'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN published BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- 4. Verify indexes
CREATE INDEX IF NOT EXISTS idx_services_display_order ON public.services(display_order);
CREATE INDEX IF NOT EXISTS idx_services_published ON public.services(published);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON public.projects(display_order);
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(published);
