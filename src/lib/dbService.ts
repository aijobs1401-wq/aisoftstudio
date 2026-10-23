/**
 * Database Service Layer
 * Interfaces directly with Supabase with fallback to local defaults when unconfigured.
 */
import { supabase, isSupabaseConfigured } from './supabase';
import { SITE_CONFIG, ServiceItem, ShowcaseProject } from '../config/siteConfig';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'in_progress' | 'converted' | 'closed';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  service: string;
  budget?: string | null;
  details: string;
  status: LeadStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'lead' | 'status' | 'security' | 'system';
  read: boolean;
  link?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, unknown>;
  ip_address?: string | null;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  logo_text?: string;
  tagline: string;
  hero_heading: string;
  hero_description: string;
  contact_email: string;
  location: string;
  footer_text?: string;
  social_links: { name: string; url: string; handle: string }[];
  maintenance_mode: boolean;
  seo_title: string;
  seo_description: string;
  updated_at: string;
}

// In-memory fallback stores when Supabase is not yet configured
let inMemoryLeads: Lead[] = [
  {
    id: 'demo-lead-1',
    name: 'Sarah Connor',
    email: 'sarah@skynet-defense.com',
    company: 'Skynet Research',
    service: 'AI Solutions',
    budget: '$25,000 – $50,000',
    details: 'Need a multi-agent autonomous monitoring pipeline for distributed edge nodes.',
    status: 'new',
    notes: 'High-priority inquiry received via public hero CTA.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'demo-lead-2',
    name: 'Marcus Vance',
    email: 'marcus@vance-fintech.io',
    company: 'Vance Capital',
    service: 'Workflow Automation',
    budget: '$50,000+',
    details: 'Looking to automate CRM ingestion, lead scoring, and automated compliance routing.',
    status: 'contacted',
    notes: 'Sent initial discovery questionnaire on Oct 22.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'demo-lead-3',
    name: 'Elena Rostova',
    email: 'elena@quantum-health.org',
    company: 'Quantum Health',
    service: 'Web Development',
    budget: '$10,000 – $25,000',
    details: 'Redesigning patient analytics portal with interactive WebGL visualizers.',
    status: 'qualified',
    notes: 'Scheduled technical architecture scoping session.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
];

let inMemoryNotifications: AdminNotification[] = [
  {
    id: 'notif-1',
    title: 'New Lead Received',
    message: 'Sarah Connor submitted a project inquiry for AI Solutions.',
    type: 'lead',
    read: false,
    link: '/admin/leads',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'System Security Notice',
    message: 'Row Level Security (RLS) is ready. Verify policies in Supabase dashboard.',
    type: 'security',
    read: false,
    link: '/admin/audit-logs',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

let inMemoryAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    actor_email: 'admin@aisoftstudio.io',
    action: 'INITIALIZE_SCHEMA',
    entity_type: 'SYSTEM',
    details: { version: '1.0.0', status: 'ready' },
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'audit-2',
    actor_email: 'admin@aisoftstudio.io',
    action: 'UPDATE_LEAD_STATUS',
    entity_type: 'LEAD',
    entity_id: 'demo-lead-2',
    details: { previous: 'new', current: 'contacted' },
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

let inMemoryServices: ServiceItem[] = SITE_CONFIG.services.map((s, idx) => ({
  ...s,
  displayOrder: idx + 1,
  published: true,
}));

let inMemoryProjects: ShowcaseProject[] = SITE_CONFIG.projects.map((p, idx) => ({
  ...p,
  displayOrder: idx + 1,
  published: true,
  isConcept: true,
  projectUrl: '',
}));

let inMemorySettings: SiteSettings = {
  id: 'default',
  site_name: SITE_CONFIG.brand.name,
  logo_text: 'AI SOFT STUDIO',
  tagline: SITE_CONFIG.brand.tagline,
  hero_heading: "We Build What's Next.",
  hero_description:
    'AI-powered experiences, intelligent automation, and digital products engineered to move your business forward.',
  contact_email: SITE_CONFIG.contact.email,
  location: SITE_CONFIG.contact.location,
  footer_text:
    'Architecting high-performance digital systems, custom AI integrations, and responsive software.',
  social_links: [...SITE_CONFIG.socials],
  maintenance_mode: false,
  seo_title: 'AI SOFT STUDIO — Futuristic Digital Experience & Software Engineering',
  seo_description:
    'AI-powered experiences, intelligent automation, and digital products engineered to move your business forward.',
  updated_at: new Date().toISOString(),
};

// ============================================================================
// Lead Management
// ============================================================================

export async function createLead(leadData: {
  name: string;
  email: string;
  company?: string;
  service: string;
  budget?: string;
  details: string;
}): Promise<{ success: boolean; leadId?: string; error?: string }> {
  // Validate
  if (!leadData.name || !leadData.email || !leadData.details) {
    return { success: false, error: 'Required fields missing' };
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([
          {
            name: leadData.name.trim(),
            email: leadData.email.trim(),
            company: leadData.company?.trim() || null,
            service: leadData.service,
            budget: leadData.budget || null,
            details: leadData.details.trim(),
            status: 'new',
          },
        ])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Automatically create a notification
      await supabase.from('notifications').insert([
        {
          title: 'New Lead Inbound',
          message: `${leadData.name} inquired about ${leadData.service}`,
          type: 'lead',
          link: '/admin/leads',
        },
      ]);

      return { success: true, leadId: data.id };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Database error';
      return { success: false, error: message };
    }
  } else {
    // In-memory fallback
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: leadData.name.trim(),
      email: leadData.email.trim(),
      company: leadData.company?.trim() || null,
      service: leadData.service,
      budget: leadData.budget || null,
      details: leadData.details.trim(),
      status: 'new',
      notes: 'Captured locally in development mode.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryLeads.unshift(newLead);

    inMemoryNotifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Lead Inbound (Local)',
      message: `${leadData.name} inquired about ${leadData.service}`,
      type: 'lead',
      read: false,
      link: '/admin/leads',
      created_at: new Date().toISOString(),
    });

    return { success: true, leadId: newLead.id };
  }
}

export async function getLeads(filters?: {
  status?: string;
  search?: string;
}): Promise<Lead[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Lead[];
    } catch {
      return inMemoryLeads;
    }
  }

  // Filter in-memory
  let result = [...inMemoryLeads];
  if (filters?.status && filters.status !== 'all') {
    result = result.filter((l) => l.status === filters.status);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s) ||
        (l.company && l.company.toLowerCase().includes(s))
    );
  }
  return result;
}

export async function updateLeadStatus(
  leadId: string,
  newStatus: LeadStatus,
  notes?: string,
  actorEmail?: string
): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const updates: { status: LeadStatus; updated_at: string; notes?: string } = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (notes !== undefined) updates.notes = notes;

      const { error } = await supabase.from('leads').update(updates).eq('id', leadId);
      if (error) throw error;

      await logAuditEvent(
        'UPDATE_LEAD_STATUS',
        'LEAD',
        leadId,
        { status: newStatus },
        actorEmail
      );
      return true;
    } catch {
      return false;
    }
  }

  const idx = inMemoryLeads.findIndex((l) => l.id === leadId);
  if (idx !== -1) {
    inMemoryLeads[idx].status = newStatus;
    inMemoryLeads[idx].updated_at = new Date().toISOString();
    if (notes !== undefined) inMemoryLeads[idx].notes = notes;
    await logAuditEvent(
      'UPDATE_LEAD_STATUS',
      'LEAD',
      leadId,
      { status: newStatus },
      actorEmail
    );
    return true;
  }
  return false;
}

export async function deleteLead(leadId: string, actorEmail?: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('leads').delete().eq('id', leadId);
      if (error) throw error;
      await logAuditEvent('DELETE_LEAD', 'LEAD', leadId, {}, actorEmail);
      return true;
    } catch {
      return false;
    }
  }

  inMemoryLeads = inMemoryLeads.filter((l) => l.id !== leadId);
  await logAuditEvent('DELETE_LEAD', 'LEAD', leadId, {}, actorEmail);
  return true;
}

// ============================================================================
// Services CRUD
// ============================================================================

export async function getServices(onlyPublished: boolean = true): Promise<ServiceItem[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (onlyPublished) {
        query = query.eq('published', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((d, index) => ({
          id: d.id,
          number: d.number,
          title: d.title,
          description: d.description,
          highlights: d.highlights || [],
          iconType: (d.icon_type || 'ai') as ServiceItem['iconType'],
          gradient: d.gradient || 'from-violet-500/20 via-cyan-500/10 to-transparent',
          displayOrder: d.display_order ?? index + 1,
          published: d.published ?? true,
        })) as ServiceItem[];
      }
    } catch {
      // Fallback below
    }
  }

  let list = [...inMemoryServices];
  if (onlyPublished) {
    list = list.filter((s) => s.published !== false);
  }
  return list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export async function saveService(
  service: ServiceItem,
  actorEmail?: string
): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('services').upsert([
        {
          id: service.id,
          number: service.number,
          title: service.title,
          description: service.description,
          highlights: service.highlights,
          icon_type: service.iconType,
          gradient: service.gradient,
          display_order: service.displayOrder ?? 0,
          published: service.published ?? true,
          updated_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
      await logAuditEvent('UPSERT_SERVICE', 'SERVICE', service.id, { title: service.title, published: service.published }, actorEmail);
      return true;
    } catch {
      return false;
    }
  }

  const idx = inMemoryServices.findIndex((s) => s.id === service.id);
  if (idx !== -1) {
    inMemoryServices[idx] = { ...service };
  } else {
    inMemoryServices.push(service);
  }
  await logAuditEvent('UPSERT_SERVICE', 'SERVICE', service.id, { title: service.title, published: service.published }, actorEmail);
  return true;
}

export async function deleteService(id: string, actorEmail?: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      await logAuditEvent('DELETE_SERVICE', 'SERVICE', id, {}, actorEmail);
      return true;
    } catch {
      return false;
    }
  }

  inMemoryServices = inMemoryServices.filter((s) => s.id !== id);
  await logAuditEvent('DELETE_SERVICE', 'SERVICE', id, {}, actorEmail);
  return true;
}

// ============================================================================
// Projects CRUD
// ============================================================================

export async function getProjects(onlyPublished: boolean = true): Promise<ShowcaseProject[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });

      if (onlyPublished) {
        query = query.eq('published', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((d, index) => ({
          id: d.id,
          title: d.title,
          subtitle: d.subtitle,
          category: d.category as ShowcaseProject['category'],
          allCategories: (d.all_categories || [d.category]) as ShowcaseProject['allCategories'],
          image: d.image_url,
          conceptSummary: d.concept_summary,
          challenge: d.challenge,
          solution: d.solution,
          technologies: d.technologies || [],
          metrics: d.metrics || [],
          accentColor: d.accent_color || '#8B5CF6',
          isConcept: d.is_concept ?? true,
          projectUrl: d.project_url || '',
          displayOrder: d.display_order ?? index + 1,
          published: d.published ?? true,
        })) as ShowcaseProject[];
      }
    } catch {
      // Fallback below
    }
  }

  let list = [...inMemoryProjects];
  if (onlyPublished) {
    list = list.filter((p) => p.published !== false);
  }
  return list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export async function saveProject(
  project: ShowcaseProject,
  actorEmail?: string
): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('projects').upsert([
        {
          id: project.id,
          title: project.title,
          subtitle: project.subtitle,
          category: project.category,
          all_categories: project.allCategories,
          image_url: project.image,
          concept_summary: project.conceptSummary,
          challenge: project.challenge,
          solution: project.solution,
          technologies: project.technologies,
          metrics: project.metrics,
          accent_color: project.accentColor,
          is_concept: project.isConcept ?? true,
          project_url: project.projectUrl || null,
          display_order: project.displayOrder ?? 0,
          published: project.published ?? true,
          updated_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
      await logAuditEvent('UPSERT_PROJECT', 'PROJECT', project.id, { title: project.title, published: project.published }, actorEmail);
      return true;
    } catch {
      return false;
    }
  }

  const idx = inMemoryProjects.findIndex((p) => p.id === project.id);
  if (idx !== -1) {
    inMemoryProjects[idx] = { ...project };
  } else {
    inMemoryProjects.push(project);
  }
  await logAuditEvent('UPSERT_PROJECT', 'PROJECT', project.id, { title: project.title, published: project.published }, actorEmail);
  return true;
}

export async function deleteProject(id: string, actorEmail?: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      await logAuditEvent('DELETE_PROJECT', 'PROJECT', id, {}, actorEmail);
      return true;
    } catch {
      return false;
    }
  }

  inMemoryProjects = inMemoryProjects.filter((p) => p.id !== id);
  await logAuditEvent('DELETE_PROJECT', 'PROJECT', id, {}, actorEmail);
  return true;
}

// ============================================================================
// Site Settings
// ============================================================================

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (error) throw error;
      if (data) return data as SiteSettings;
    } catch {
      // Fallback
    }
  }
  return inMemorySettings;
}

export async function updateSiteSettings(
  settings: Partial<SiteSettings>,
  actorEmail?: string
): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'default');
      if (error) throw error;
      await logAuditEvent('UPDATE_SETTINGS', 'SITE_SETTINGS', 'default', settings, actorEmail);
      return true;
    } catch {
      return false;
    }
  }

  inMemorySettings = {
    ...inMemorySettings,
    ...settings,
    updated_at: new Date().toISOString(),
  };
  await logAuditEvent('UPDATE_SETTINGS', 'SITE_SETTINGS', 'default', settings, actorEmail);
  return true;
}

// ============================================================================
// Users & Roles
// ============================================================================

export interface UserItem {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
}

let inMemoryUsers: UserItem[] = [
  {
    id: 'user-admin-1',
    email: 'admin@aisoftstudio.io',
    full_name: 'Lead Architect',
    role: 'admin',
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  },
  {
    id: 'user-editor-1',
    email: 'editor@aisoftstudio.io',
    full_name: 'Content Director',
    role: 'editor',
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
  },
  {
    id: 'user-viewer-1',
    email: 'analyst@aisoftstudio.io',
    full_name: 'Lead Operations',
    role: 'viewer',
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
];

export async function getUsers(): Promise<UserItem[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) return data as UserItem[];
    } catch {
      // Fallback
    }
  }
  return inMemoryUsers;
}

export async function updateUserRole(
  userId: string,
  newRole: 'admin' | 'editor' | 'viewer',
  actorEmail?: string
): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
      await logAuditEvent('UPDATE_USER_ROLE', 'USER', userId, { role: newRole }, actorEmail);
      return true;
    } catch {
      return false;
    }
  }

  const idx = inMemoryUsers.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    inMemoryUsers[idx].role = newRole;
    await logAuditEvent('UPDATE_USER_ROLE', 'USER', userId, { role: newRole }, actorEmail);
    return true;
  }
  return false;
}

// ============================================================================
// Notifications
// ============================================================================

export async function getNotifications(): Promise<AdminNotification[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      if (data) return data as AdminNotification[];
    } catch {
      // Fallback
    }
  }
  return inMemoryNotifications;
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      return true;
    } catch {
      return false;
    }
  }

  const idx = inMemoryNotifications.findIndex((n) => n.id === id);
  if (idx !== -1) {
    inMemoryNotifications[idx].read = true;
    return true;
  }
  return false;
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('notifications').update({ read: true }).eq('read', false);
      return true;
    } catch {
      return false;
    }
  }

  inMemoryNotifications = inMemoryNotifications.map((n) => ({ ...n, read: true }));
  return true;
}

// ============================================================================
// Audit Logs
// ============================================================================

export async function getAuditLogs(): Promise<AuditLog[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      if (data) return data as AuditLog[];
    } catch {
      // Fallback
    }
  }
  return inMemoryAuditLogs;
}

export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId?: string | null,
  details: Record<string, unknown> = {},
  actorEmail?: string | null
): Promise<void> {
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    actor_email: actorEmail || 'system',
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    details,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('audit_logs').insert([
        {
          action,
          entity_type: entityType,
          entity_id: entityId || null,
          details,
          actor_email: actorEmail || null,
        },
      ]);
    } catch {
      inMemoryAuditLogs.unshift(newLog);
    }
  } else {
    inMemoryAuditLogs.unshift(newLog);
  }
}
