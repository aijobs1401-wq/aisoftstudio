import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  Globe,
  Mail,
  Share2,
  Wrench,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getSiteSettings, updateSiteSettings, SiteSettings } from '../../lib/dbService';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { user, role } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isReadOnly = role !== 'admin';

  useEffect(() => {
    getSiteSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    if (isReadOnly) {
      alert('Only administrators have permissions to modify site settings.');
      return;
    }

    setSaving(true);
    await updateSiteSettings(settings, user?.email || undefined);
    setSaving(false);
    setToast('Website settings saved and deployed to live runtime.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddSocialLink = () => {
    if (!settings || isReadOnly) return;
    setSettings({
      ...settings,
      social_links: [
        ...settings.social_links,
        { name: 'Platform', url: 'https://', handle: '@handle' },
      ],
    });
  };

  const handleRemoveSocialLink = (index: number) => {
    if (!settings || isReadOnly) return;
    setSettings({
      ...settings,
      social_links: settings.social_links.filter((_, idx) => idx !== index),
    });
  };

  const handleUpdateSocialLink = (
    index: number,
    field: 'name' | 'url' | 'handle',
    val: string
  ) => {
    if (!settings || isReadOnly) return;
    const updated = [...settings.social_links];
    updated[index] = { ...updated[index], [field]: val };
    setSettings({ ...settings, social_links: updated });
  };

  if (loading || !settings) {
    return (
      <AdminLayout title="Website Settings">
        <div className="text-center py-20 text-xs text-gray-400">Loading settings...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Website Settings & Meta Configuration">
      <div className="space-y-6 max-w-4xl">
        {toast && (
          <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-400/50 text-xs text-cyan-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{toast}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Brand & Hero Messaging */}
          <div className="p-6 rounded-2xl bg-[#070A18]/90 border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/5 pb-3">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Identity & Hero Messaging</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Brand Name</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-bold disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Logo Text / Emblem</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={settings.logo_text || 'AI SOFT STUDIO'}
                  onChange={(e) => setSettings({ ...settings, logo_text: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Brand Tagline</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Hero Headline</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={settings.hero_heading}
                  onChange={(e) => setSettings({ ...settings, hero_heading: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-bold text-sm disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Hero Description Copy</label>
                <textarea
                  rows={2}
                  disabled={isReadOnly}
                  value={settings.hero_description}
                  onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white leading-relaxed disabled:opacity-50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Studio Coordinates */}
          <div className="p-6 rounded-2xl bg-[#070A18]/90 border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/5 pb-3">
              <Mail className="w-4 h-4 text-violet-400" />
              <span>Contact Coordinates & Footer Text</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Primary Contact Email</label>
                <input
                  type="email"
                  disabled={isReadOnly}
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Studio Location</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-gray-400 font-mono mb-1.5">Footer Description Copy</label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={
                  settings.footer_text ||
                  'Architecting high-performance digital systems, custom AI integrations, and responsive software.'
                }
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white leading-relaxed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Section 3: Social Links */}
          <div className="p-6 rounded-2xl bg-[#070A18]/90 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Social Links & Profiles</span>
              </div>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={handleAddSocialLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {settings.social_links.map((link, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-center p-2 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={link.name}
                      onChange={(e) => handleUpdateSocialLink(idx, 'name', e.target.value)}
                      placeholder="e.g. GitHub"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="url"
                      disabled={isReadOnly}
                      value={link.url}
                      onChange={(e) => handleUpdateSocialLink(idx, 'url', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px]"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={link.handle}
                      onChange={(e) => handleUpdateSocialLink(idx, 'handle', e.target.value)}
                      placeholder="@handle"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px]"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialLink(idx)}
                        className="p-2 text-gray-500 hover:text-rose-400 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: SEO & OpenGraph */}
          <div className="p-6 rounded-2xl bg-[#070A18]/90 border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/5 pb-3">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Search Engine Optimization & Meta</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Default Page Title</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={settings.seo_title}
                  onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Meta Description</label>
                <textarea
                  rows={2}
                  disabled={isReadOnly}
                  value={settings.seo_description}
                  onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white disabled:opacity-50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 5: Maintenance Mode */}
          <div className="p-6 rounded-2xl bg-[#070A18]/90 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Maintenance Mode</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono font-semibold uppercase ${
                    settings.maintenance_mode ? 'text-amber-400' : 'text-gray-500'
                  }`}
                >
                  {settings.maintenance_mode ? 'Active (Site Offline)' : 'Disabled (Live)'}
                </span>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={settings.maintenance_mode}
                  onChange={(e) =>
                    setSettings({ ...settings, maintenance_mode: e.target.checked })
                  }
                  className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              When maintenance mode is enabled, public visitors will see a futuristic maintenance notice
              explaining that systems are undergoing scheduled optimization. Staff can still access
              the admin portal at <code className="text-cyan-300 font-mono">/admin/login</code>.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving || isReadOnly}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Deploy Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
