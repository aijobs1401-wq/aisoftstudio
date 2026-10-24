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
-- 13. Multi-Tenant WhatsApp Automation Tables
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'trial')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add tenant_id to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);

CREATE TABLE IF NOT EXISTS public.whatsapp_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone_number_id TEXT NOT NULL,
  waba_id TEXT,
  access_token TEXT NOT NULL,
  phone_number TEXT,
  name TEXT,
  status TEXT NOT NULL CHECK (status IN ('connected', 'disconnected', 'error', 'pending')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, phone_number_id)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_tenant ON public.whatsapp_accounts(tenant_id);

CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_keyword TEXT NOT NULL,
  response_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_tenant ON public.automation_rules(tenant_id);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  whatsapp_account_id UUID REFERENCES public.whatsapp_accounts(id) ON DELETE CASCADE,
  message_id TEXT,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_tenant ON public.messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);

CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  payload JSONB,
  response_status INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Tenants & WhatsApp Automation
CREATE POLICY "Users can read own tenant"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

CREATE POLICY "Tenant users can read own whatsapp accounts"
  ON public.whatsapp_accounts FOR SELECT
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

CREATE POLICY "Tenant users can read own automation rules"
  ON public.automation_rules FOR SELECT
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

CREATE POLICY "Tenant users can read own messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

-- ==============================================================================
-- 14. Phase 10: AI Chatbot Settings, Knowledge Base & Conversation Metadata
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.chatbot_settings (
  tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  bot_name TEXT NOT NULL DEFAULT 'AI Assistant',
  welcome_message TEXT NOT NULL DEFAULT 'Hello! Welcome to our automated support. How can I help you today?',
  business_name TEXT,
  business_description TEXT,
  supported_languages TEXT[] DEFAULT ARRAY['English'],
  working_hours JSONB DEFAULT '{"enabled": false, "start": "09:00", "end": "18:00", "days": [1,2,3,4,5]}'::jsonb,
  instructions TEXT,
  handoff_rules TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('faq', 'product', 'policy', 'general')) DEFAULT 'faq',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_tenant ON public.knowledge_base(tenant_id);

CREATE TABLE IF NOT EXISTS public.conversation_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('unread', 'active', 'resolved', 'escalated')) DEFAULT 'unread',
  assigned_to TEXT,
  takeover_mode BOOLEAN NOT NULL DEFAULT false,
  internal_notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, sender)
);

CREATE INDEX IF NOT EXISTS idx_conversation_metadata_tenant ON public.conversation_metadata(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversation_metadata_sender ON public.conversation_metadata(sender);

-- Enable RLS on new tables
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Chatbot Settings, Knowledge Base, & Conversation Metadata
CREATE POLICY "Tenant users can manage own chatbot settings"
  ON public.chatbot_settings FOR ALL
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

CREATE POLICY "Tenant users can manage own knowledge base"
  ON public.knowledge_base FOR ALL
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

CREATE POLICY "Tenant users can manage own conversation metadata"
  ON public.conversation_metadata FOR ALL
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

-- ==============================================================================
-- 16. Phase 11: WhatsApp Campaign & Broadcast Management Tables
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  consent_status TEXT NOT NULL CHECK (consent_status IN ('opted_in', 'opted_out', 'pending')) DEFAULT 'pending',
  consent_source TEXT,
  consent_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_contacts_tenant ON public.contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_consent ON public.contacts(consent_status);

CREATE TABLE IF NOT EXISTS public.contact_consent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('opt_in', 'opt_out', 'imported')),
  source TEXT,
  evidence TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_events_tenant ON public.contact_consent_events(tenant_id);

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  whatsapp_account_id UUID REFERENCES public.whatsapp_accounts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  purpose TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'draft',
  target_filter JSONB DEFAULT '{}'::jsonb,
  template_name TEXT,
  template_language TEXT DEFAULT 'en',
  template_variables JSONB DEFAULT '{}'::jsonb,
  message_body TEXT,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_tenant ON public.campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

CREATE TABLE IF NOT EXISTS public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'skipped')) DEFAULT 'pending',
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON public.campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON public.campaign_recipients(status);

CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  category TEXT NOT NULL CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')) DEFAULT 'MARKETING',
  status TEXT NOT NULL CHECK (status IN ('APPROVED', 'PENDING', 'REJECTED')) DEFAULT 'APPROVED',
  components JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, template_name, language)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_tenant ON public.whatsapp_templates(tenant_id);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_consent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tenant users can manage own contacts"
  ON public.contacts FOR ALL
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

CREATE POLICY "Tenant users can manage own consent events"
  ON public.contact_consent_events FOR ALL
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

CREATE POLICY "Tenant users can manage own campaigns"
  ON public.campaigns FOR ALL
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

CREATE POLICY "Tenant users can manage own campaign recipients"
  ON public.campaign_recipients FOR ALL
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

CREATE POLICY "Tenant users can manage own whatsapp templates"
  ON public.whatsapp_templates FOR ALL
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

-- ==============================================================================
-- 18. Phase 12: Subscription, Billing & Plan Management Tables
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  yearly_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'INR',
  max_whatsapp_accounts INTEGER NOT NULL DEFAULT 1,
  max_monthly_messages INTEGER NOT NULL DEFAULT 1000,
  max_contacts INTEGER NOT NULL DEFAULT 500,
  max_campaigns_per_month INTEGER NOT NULL DEFAULT 5,
  max_automation_rules INTEGER NOT NULL DEFAULT 10,
  trial_days INTEGER NOT NULL DEFAULT 14,
  is_active BOOLEAN NOT NULL DEFAULT true,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.client_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')) DEFAULT 'trialing',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')) DEFAULT 'monthly',
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_subscriptions_tenant ON public.client_subscriptions(tenant_id);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  gateway TEXT NOT NULL DEFAULT 'razorpay',
  order_id TEXT NOT NULL UNIQUE,
  payment_id TEXT UNIQUE,
  signature TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')) DEFAULT 'created',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_tenant ON public.payment_transactions(tenant_id);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'void', 'refunded')) DEFAULT 'pending',
  invoice_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pdf_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON public.invoices(tenant_id);

CREATE TABLE IF NOT EXISTS public.billing_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active subscription plans"
  ON public.subscription_plans FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage subscription plans"
  ON public.subscription_plans FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Tenant users can view own subscription"
  ON public.client_subscriptions FOR SELECT
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

CREATE POLICY "Tenant users can view own transactions"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

CREATE POLICY "Tenant users can view own invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

CREATE POLICY "Admins can view billing audit logs"
  ON public.billing_audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- 19. Instructions for Creating the First Administrator
-- ==============================================================================
-- Step 1: Create a user via Supabase Dashboard -> Authentication -> Users -> "Invite user".
-- Step 2: Run the following SQL query to elevate that user to 'admin':
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'your-admin-email@domain.com';
-- ==============================================================================
