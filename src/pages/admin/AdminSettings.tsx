import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, Shield, Globe, Mail, Share2, Wrench } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getSiteSettings, updateSiteSettings, SiteSettings } from '../../lib/dbService';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { user, role } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    getSiteSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    if (role !== 'admin') {
      alert('Only administrators have permissions to modify site settings.');
      return;
    }

    setSaving(true);
    await updateSiteSettings(settings, user?.email || undefined);
    setSaving(false);
    setToast('Website settings saved and deployed to live runtime.');
    setTimeout(() => setToast(null), 3000);
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Brand Name</label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Brand Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  required
                />
              </div>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Hero Headline</label>
                <input
                  type="text"
                  value={settings.hero_heading}
                  onChange={(e) => setSettings({ ...settings, hero_heading: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Hero Description Copy</label>
                <textarea
                  rows={2}
                  value={settings.hero_description}
                  onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white leading-relaxed"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Studio Coordinates */}
          <div className="p-6 rounded-2xl bg-[#070A18]/90 border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/5 pb-3">
              <Mail className="w-4 h-4 text-violet-400" />
              <span>Contact Coordinates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Primary Contact Email</label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Studio Location</label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: SEO & OpenGraph */}
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
                  value={settings.seo_title}
                  onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1.5">Meta Description</label>
                <textarea
                  rows={2}
                  value={settings.seo_description}
                  onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving || role !== 'admin'}
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
