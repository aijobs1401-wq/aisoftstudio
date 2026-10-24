import React, { useState, useEffect } from 'react';
import { Bot, Save, CheckCircle2, AlertTriangle, RefreshCw, Settings, HelpCircle, Shield } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminChatbot() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [settings, setSettings] = useState({
    bot_name: 'AI Support Assistant',
    welcome_message: 'Hello! Welcome to our automated support. How can I assist you today?',
    business_name: '',
    business_description: '',
    supported_languages: ['English'],
    working_hours: { enabled: false, start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5] },
    instructions: 'Be polite, professional, and concise. Use only the provided knowledge base.',
    handoff_rules: 'If the customer asks for a human or asks about unlisted topics, escalate to human support.',
    is_enabled: false,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sb-access-token') || '';
      const res = await fetch('/api/chatbot/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.tenant_id) {
          setSettings({
            bot_name: data.bot_name || 'AI Support Assistant',
            welcome_message: data.welcome_message || '',
            business_name: data.business_name || '',
            business_description: data.business_description || '',
            supported_languages: data.supported_languages || ['English'],
            working_hours: data.working_hours || { enabled: false, start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5] },
            instructions: data.instructions || '',
            handoff_rules: data.handoff_rules || '',
            is_enabled: data.is_enabled ?? false,
          });
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const token = localStorage.getItem('sb-access-token') || '';
      const res = await fetch('/api/chatbot/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to save chatbot settings');
      setSuccessMessage('Chatbot settings updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="AI Chatbot Settings">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span>AI Chatbot Configuration</span>
            </h2>
            <p className="text-xs text-gray-400">
              Configure your automated WhatsApp AI assistant persona, business knowledge, and rules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-400">Status:</span>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, is_enabled: !settings.is_enabled })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                settings.is_enabled
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900 text-gray-400 border-white/10'
              }`}
            >
              {settings.is_enabled ? '● AI Enabled' : '○ AI Disabled'}
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 font-mono">Loading chatbot configuration...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#070A18] border border-white/10 space-y-5">
              <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-3">
                General Persona & Welcome
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Bot Name</label>
                  <input
                    type="text"
                    value={settings.bot_name}
                    onChange={(e) => setSettings({ ...settings, bot_name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050711] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Business Name</label>
                  <input
                    type="text"
                    value={settings.business_name}
                    onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050711] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Welcome Message</label>
                <textarea
                  rows={2}
                  value={settings.welcome_message}
                  onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050711] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Business Description & Context</label>
                <textarea
                  rows={3}
                  value={settings.business_description}
                  onChange={(e) => setSettings({ ...settings, business_description: e.target.value })}
                  placeholder="Describe your products, services, operating model, pricing tiers, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050711] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#070A18] border border-white/10 space-y-5">
              <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-3">
                AI Instructions & Handoff Rules
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Custom Bot Instructions</label>
                <textarea
                  rows={3}
                  value={settings.instructions}
                  onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050711] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Human Handoff Rules</label>
                <textarea
                  rows={2}
                  value={settings.handoff_rules}
                  onChange={(e) => setSettings({ ...settings, handoff_rules: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050711] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
