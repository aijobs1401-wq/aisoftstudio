import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Users2,
  Plus,
  Upload,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Tag,
  Phone,
  Mail,
  User,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  consent_status: 'opted_in' | 'opted_out' | 'pending';
  consent_source?: string;
  consent_timestamp?: string;
  created_at: string;
}

export default function AdminContacts() {
  const { session } = useAuth();
  const token = session?.access_token || localStorage.getItem('sb-access-token') || '';
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedConsent, setSelectedConsent] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Add Contact Form
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTags, setFormTags] = useState('lead');
  const [formConsent, setFormConsent] = useState<'opted_in' | 'opted_out' | 'pending'>('opted_in');

  // CSV Import State
  const [csvText, setCsvText] = useState('');

  const fetchContacts = async () => {
    try {
      let url = '/api/contacts?';
      if (selectedTag) url += `tag=${encodeURIComponent(selectedTag)}&`;
      if (selectedConsent) url += `consent=${encodeURIComponent(selectedConsent)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setContacts(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchContacts().finally(() => setLoading(false));
    }
  }, [token, selectedTag, selectedConsent]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          email: formEmail || null,
          tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
          consent_status: formConsent,
          consent_source: 'manual'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Contact added / updated successfully.');
        setShowAddModal(false);
        setFormName('');
        setFormPhone('');
        setFormEmail('');
        fetchContacts();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lines = csvText.split('\n').filter(Boolean);
      const parsedContacts = [];

      for (let i = 0; i < lines.length; i++) {
        // Expected format: Name,Phone,Email,Tags,Consent (opted_in/pending)
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length >= 2) {
          parsedContacts.push({
            name: parts[0],
            phone: parts[1],
            email: parts[2] || '',
            tags: parts[3] ? parts[3].split(';').map((t) => t.trim()) : ['imported'],
            consent_status: parts[4] === 'opted_in' ? 'opted_in' : 'pending'
          });
        }
      }

      if (parsedContacts.length === 0) {
        setError('No valid contacts found in CSV text. Format: Name, Phone, Email, Tags, Consent');
        return;
      }

      const res = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ contacts: parsedContacts })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Imported ${data.imported} contacts successfully (${data.skipped} skipped).`);
        setShowImportModal(false);
        setCsvText('');
        fetchContacts();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg('Contact deleted.');
        fetchContacts();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleConsent = async (contact: Contact) => {
    const nextConsent = contact.consent_status === 'opted_in' ? 'opted_out' : 'opted_in';
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          tags: contact.tags,
          consent_status: nextConsent,
          consent_source: 'dashboard_toggle'
        })
      });
      if (res.ok) {
        setSuccessMsg(`Updated consent for ${contact.name} to ${nextConsent}.`);
        fetchContacts();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const consentBadge = (status: string) => {
    const map: Record<string, string> = {
      opted_in: 'bg-emerald-950 text-emerald-300 border-emerald-500/30',
      opted_out: 'bg-rose-950 text-rose-300 border-rose-500/30',
      pending: 'bg-amber-950 text-amber-300 border-amber-500/30'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono border uppercase tracking-wider ${map[status] || map.pending}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <AdminLayout activePath="/admin/contacts" title="Contacts & Audience Management">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#090D1F] border border-white/10 rounded-2xl p-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users2 className="w-5 h-5 text-cyan-400" />
              <span>Contact Directory & Consent Segmentation</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Maintain E.164 phone contacts, track verified marketing opt-ins, prevent unauthorized spam, and segment audiences by tags.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-opacity cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
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

        {/* Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#090D1F] border border-white/10 rounded-2xl p-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, email..."
              className="w-full bg-[#050711] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-cyan-400 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedConsent}
              onChange={(e) => setSelectedConsent(e.target.value)}
              className="bg-[#050711] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
            >
              <option value="">All Consent Statuses</option>
              <option value="opted_in">Opted In</option>
              <option value="opted_out">Opted Out</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-[#090D1F] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Contacts Directory</h3>
            <span className="text-xs text-gray-400 font-mono">{filteredContacts.length} contacts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-gray-400 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Contact Name</th>
                  <th className="p-4">Phone (E.164)</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4">Consent Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono text-xs">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td className="p-4 font-mono text-gray-300">{c.phone}</td>
                    <td className="p-4 text-gray-400">{c.email || '—'}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(c.tags || []).map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 text-gray-300 border border-white/10">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">{consentBadge(c.consent_status)}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => toggleConsent(c)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors font-mono text-[11px]"
                        title="Toggle Opt-In/Opt-Out"
                      >
                        Toggle Consent
                      </button>
                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredContacts.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 text-xs">
                      No contacts found. Click "Add Contact" or "Import CSV" to add subscribers.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Contact Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#090D1F] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-sm font-bold text-white">Add New Subscriber Contact</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddContact} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Phone Number (E.164 Format)</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +14155552671"
                    className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="alex@domain.com"
                    className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="vip, lead, developer"
                    className="w-full bg-[#050711] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Consent Status</label>
                  <select
                    value={formConsent}
                    onChange={(e: any) => setFormConsent(e.target.value)}
                    className="w-full bg-[#050711] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  >
                    <option value="opted_in">Opted In (Verified Marketing Consent)</option>
                    <option value="pending">Pending</option>
                    <option value="opted_out">Opted Out</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-medium hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CSV Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#090D1F] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  <span>Import Contacts via CSV / Paste</span>
                </h3>
                <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Paste CSV lines in format: <code className="text-cyan-400 font-mono">Name, Phone (+E.164), Email, Tags (semi-colon separated), opted_in</code>
              </p>

              <form onSubmit={handleImportCsv} className="space-y-4">
                <textarea
                  rows={8}
                  required
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Alex Morgan, +14155552671, alex@domain.com, vip;lead, opted_in&#10;Sarah Connor, +14155550199, sarah@domain.com, customer, opted_in"
                  className="w-full bg-[#050711] border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:border-cyan-400 outline-none resize-none"
                />

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-medium hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20"
                  >
                    Process & Import
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
