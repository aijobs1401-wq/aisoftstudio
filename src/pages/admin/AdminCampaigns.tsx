import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Send,
  Plus,
  Play,
  Square,
  Copy,
  Trash2,
  RefreshCw,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Search,
  FileText,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Campaign {
  id: string;
  name: string;
  purpose: string;
  status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';
  target_filter: { tag?: string };
  template_name?: string;
  template_language?: string;
  message_body?: string;
  scheduled_at?: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  error_message?: string;
  created_at: string;
}

export default function AdminCampaigns() {
  const { session } = useAuth();
  const token = session?.access_token || localStorage.getItem('sb-access-token') || '';
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [whatsappAccounts, setWhatsappAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formAccountId, setFormAccountId] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formTemplateName, setFormTemplateName] = useState('');
  const [formMessageBody, setFormMessageBody] = useState('');
  const [formScheduledAt, setFormScheduledAt] = useState('');

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCampaigns(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/whatsapp/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTemplates(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/whatsapp/accounts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setWhatsappAccounts(data);
        if (data.length > 0 && !formAccountId) setFormAccountId(data[0].id);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      Promise.all([fetchCampaigns(), fetchTemplates(), fetchAccounts()]).finally(() => setLoading(false));
    }
  }, [token]);

  const handleSyncTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/whatsapp/templates/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Successfully synced ${data.count} templates from Meta WABA.`);
        fetchTemplates();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formName,
          purpose: formPurpose,
          whatsapp_account_id: formAccountId || null,
          target_filter: formTag ? { tag: formTag } : {},
          template_name: formTemplateName || null,
          message_body: formMessageBody || null,
          scheduled_at: formScheduledAt ? new Date(formScheduledAt).toISOString() : null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Campaign created successfully.');
        setShowCreateModal(false);
        setFormName('');
        setFormPurpose('');
        setFormMessageBody('');
        setFormTemplateName('');
        setFormScheduledAt('');
        fetchCampaigns();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStartCampaign = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/${id}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Campaign started! Dispatched to ${data.total_recipients} opted-in recipients.`);
        fetchCampaigns();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancelCampaign = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg('Campaign cancelled.');
        fetchCampaigns();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDuplicateCampaign = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/${id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg('Campaign duplicated.');
        fetchCampaigns();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg('Campaign deleted.');
        fetchCampaigns();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const viewDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setSelectedCampaign(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: 'bg-slate-800 text-gray-300 border-gray-700',
      scheduled: 'bg-blue-950 text-blue-300 border-blue-500/30',
      processing: 'bg-amber-950 text-amber-300 border-amber-500/30 animate-pulse',
      completed: 'bg-emerald-950 text-emerald-300 border-emerald-500/30',
      failed: 'bg-rose-950 text-rose-300 border-rose-500/30',
      cancelled: 'bg-gray-900 text-gray-400 border-gray-700'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono border uppercase tracking-wider ${map[status] || map.draft}`}>
        {status}
      </span>
    );
  };

  return (
    <AdminLayout activePath="/admin/campaigns" title="WhatsApp Campaigns & Broadcasts">
      <div className="space-y-6">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#090D1F] border border-white/10 rounded-2xl p-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-cyan-400" />
              <span>Broadcast Campaigns & Meta Templates</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Manage targeted WhatsApp broadcasts, official approved templates, and automated delivery queues with strict opt-in compliance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncTemplates}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sync Meta Templates</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-opacity cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Templates Overview Card */}
        <div className="bg-[#090D1F] border border-white/10 rounded-2xl p-5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Approved Meta Templates Available ({templates.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map((t) => (
              <div key={t.id} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">{t.template_name}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {t.category}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 line-clamp-2">
                  {t.components?.[0]?.text || 'No preview text'}
                </p>
              </div>
            ))}
            {templates.length === 0 && (
              <div className="col-span-full text-center py-4 text-xs text-gray-500">
                No templates synced yet. Click "Sync Meta Templates" above.
              </div>
            )}
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-[#090D1F] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Campaign History & Active Broadcasts</h3>
            <span className="text-xs text-gray-400 font-mono">{campaigns.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-gray-400 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Campaign Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Template / Body</th>
                  <th className="p-4">Recipients</th>
                  <th className="p-4">Delivery (Sent/Delivered/Failed)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-[11px] text-gray-400">{c.purpose || 'No description'}</div>
                    </td>
                    <td className="p-4">{statusBadge(c.status)}</td>
                    <td className="p-4 font-mono text-[11px] text-gray-300">
                      {c.template_name ? <span className="text-cyan-400">[{c.template_name}]</span> : 'Custom Text'}
                    </td>
                    <td className="p-4 font-mono text-gray-300">{c.total_recipients || 0}</td>
                    <td className="p-4 font-mono text-[11px]">
                      <span className="text-emerald-400">{c.sent_count || 0} sent</span> /{' '}
                      <span className="text-blue-400">{c.delivered_count || 0} del</span> /{' '}
                      <span className="text-rose-400">{c.failed_count || 0} fail</span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => viewDetails(c.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                        title="View Details"
                      >
                        Details
                      </button>
                      {c.status === 'draft' && (
                        <button
                          onClick={() => handleStartCampaign(c.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition-colors"
                          title="Start Now"
                        >
                          Start
                        </button>
                      )}
                      {c.status === 'processing' && (
                        <button
                          onClick={() => handleCancelCampaign(c.id)}
                          className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 transition-colors"
                          title="Cancel"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicateCampaign(c.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(c.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
                {campaigns.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 text-xs">
                      No broadcast campaigns created yet. Click "Create Campaign" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#090D1F] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-cyan-400" />
                  <span>Create WhatsApp Broadcast Campaign</span>
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. October VIP Product Launch"
                    className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Purpose / Notes</label>
                  <input
                    type="text"
                    value={formPurpose}
                    onChange={(e) => setFormPurpose(e.target.value)}
                    placeholder="e.g. Promote new AI tools to opted-in subscribers"
                    className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Sender WhatsApp Account</label>
                    <select
                      value={formAccountId}
                      onChange={(e) => setFormAccountId(e.target.value)}
                      className="w-full bg-[#050711] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                    >
                      {whatsappAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.phone_number || acc.phone_number_id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Audience Tag Filter (Optional)</label>
                    <input
                      type="text"
                      value={formTag}
                      onChange={(e) => setFormTag(e.target.value)}
                      placeholder="e.g. vip, lead, customer"
                      className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Meta Approved Template (Optional)</label>
                  <select
                    value={formTemplateName}
                    onChange={(e) => setFormTemplateName(e.target.value)}
                    className="w-full bg-[#050711] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  >
                    <option value="">Custom Free-Form Message (Requires Service Window)</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.template_name}>
                        {t.template_name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                {!formTemplateName && (
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Message Body</label>
                    <textarea
                      rows={4}
                      value={formMessageBody}
                      onChange={(e) => setFormMessageBody(e.target.value)}
                      placeholder="Type broadcast message for opted-in contacts..."
                      className="w-full bg-[#050711] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-cyan-400 outline-none resize-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Schedule For Later (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formScheduledAt}
                    onChange={(e) => setFormScheduledAt(e.target.value)}
                    className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-medium hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20"
                  >
                    Save Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Campaign Details Modal */}
        {selectedCampaign && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#090D1F] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedCampaign.name}</h3>
                  <p className="text-xs text-gray-400">{selectedCampaign.purpose || 'No description'}</p>
                </div>
                <button onClick={() => setSelectedCampaign(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] font-mono text-gray-400">Total Recipients</div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">{selectedCampaign.total_recipients || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <div className="text-[10px] font-mono text-emerald-300">Sent</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{selectedCampaign.sent_count || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30">
                  <div className="text-[10px] font-mono text-blue-300">Delivered</div>
                  <div className="text-lg font-bold text-blue-400 font-mono mt-0.5">{selectedCampaign.delivered_count || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30">
                  <div className="text-[10px] font-mono text-rose-300">Failed</div>
                  <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">{selectedCampaign.failed_count || 0}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-2">Recipient Status List</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {(selectedCampaign.recipients || []).map((rc: any) => (
                    <div key={rc.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono text-white">{rc.phone}</div>
                        {rc.error_message && <div className="text-[10px] text-rose-400">{rc.error_message}</div>}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${rc.status === 'sent' ? 'bg-emerald-950 text-emerald-300' : rc.status === 'failed' ? 'bg-rose-950 text-rose-300' : 'bg-gray-800 text-gray-300'}`}>
                        {rc.status}
                      </span>
                    </div>
                  ))}
                  {(!selectedCampaign.recipients || selectedCampaign.recipients.length === 0) && (
                    <div className="text-center py-4 text-gray-500 text-xs">No recipient logs recorded yet.</div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/20"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
