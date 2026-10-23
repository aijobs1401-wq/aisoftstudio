import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  X,
  Mail,
  Building,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getLeads,
  updateLeadStatus,
  deleteLead,
  Lead,
  LeadStatus,
} from '../../lib/dbService';
import { useAuth } from '../../context/AuthContext';

export default function AdminLeads() {
  const { user, role } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [deleteConfirmLead, setDeleteConfirmLead] = useState<Lead | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    const data = await getLeads({
      status: statusFilter,
      search: search.trim() || undefined,
    });
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await updateLeadStatus(leadId, newStatus, undefined, user?.email || undefined);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setSavingNotes(true);
    await updateLeadStatus(
      selectedLead.id,
      selectedLead.status,
      notesDraft,
      user?.email || undefined
    );
    setSelectedLead({ ...selectedLead, notes: notesDraft });
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? { ...l, notes: notesDraft } : l))
    );
    setSavingNotes(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirmLead) return;
    await deleteLead(deleteConfirmLead.id, user?.email || undefined);
    setLeads((prev) => prev.filter((l) => l.id !== deleteConfirmLead.id));
    if (selectedLead?.id === deleteConfirmLead.id) {
      setSelectedLead(null);
    }
    setDeleteConfirmLead(null);
  };

  const exportToCSV = () => {
    if (leads.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Company', 'Service', 'Budget', 'Status', 'Created At'];
    const rows = leads.map((l) => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${l.service.replace(/"/g, '""')}"`,
      `"${(l.budget || '').replace(/"/g, '""')}"`,
      l.status,
      l.created_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusColors: Record<LeadStatus, string> = {
    new: 'bg-cyan-950 text-cyan-300 border-cyan-500/30',
    contacted: 'bg-blue-950 text-blue-300 border-blue-500/30',
    qualified: 'bg-violet-950 text-violet-300 border-violet-500/30',
    in_progress: 'bg-amber-950 text-amber-300 border-amber-500/30',
    converted: 'bg-emerald-950 text-emerald-300 border-emerald-500/30',
    closed: 'bg-slate-900 text-gray-400 border-white/10',
  };

  return (
    <AdminLayout title="Lead Management">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, company..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070A18] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </form>

          {/* Export & Refresh buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={exportToCSV}
              disabled={leads.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={fetchLeads}
              className="p-2 rounded-xl text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/5">
          {['all', 'new', 'contacted', 'qualified', 'in_progress', 'converted', 'closed'].map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            )
          )}
        </div>

        {/* Leads Table Container */}
        <div className="rounded-2xl bg-[#070A18]/90 border border-white/10 overflow-hidden shadow-xl">
          {loading ? (
            <div className="text-center py-16 text-xs text-gray-400">Loading lead inquiries...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-16 text-xs text-gray-500">
              No inquiries matching filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 font-mono text-[11px]">
                    <th className="py-3 px-4 font-medium">Inbound Client</th>
                    <th className="py-3 px-4 font-medium">Requested Service</th>
                    <th className="py-3 px-4 font-medium">Budget</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Received</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{lead.name}</div>
                        <div className="text-gray-400 text-[11px] font-mono">{lead.email}</div>
                        {lead.company && (
                          <div className="text-[10px] text-cyan-400">{lead.company}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">{lead.service}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-400">
                        {lead.budget || 'Undisclosed'}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleStatusChange(lead.id, e.target.value as LeadStatus)
                          }
                          className={`px-2 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider border cursor-pointer ${
                            statusColors[lead.status]
                          }`}
                        >
                          <option value="new" className="bg-[#090D1C] text-white">New</option>
                          <option value="contacted" className="bg-[#090D1C] text-white">Contacted</option>
                          <option value="qualified" className="bg-[#090D1C] text-white">Qualified</option>
                          <option value="in_progress" className="bg-[#090D1C] text-white">In Progress</option>
                          <option value="converted" className="bg-[#090D1C] text-white">Converted</option>
                          <option value="closed" className="bg-[#090D1C] text-white">Closed</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] font-mono text-gray-400">
                        {new Date(lead.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLead(lead);
                              setNotesDraft(lead.notes || '');
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmLead(lead)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Lead Detail & Internal Notes Modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#090D1C] border border-violet-500/30 p-6 sm:p-8 text-left shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedLead(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider border ${
                  statusColors[selectedLead.status]
                }`}
              >
                {selectedLead.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Received on {new Date(selectedLead.created_at).toLocaleString()}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{selectedLead.name}</h3>
            <div className="flex flex-wrap gap-4 text-xs text-gray-300 font-mono mb-6">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedLead.email}</span>
              </div>
              {selectedLead.company && (
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-violet-400" />
                  <span>{selectedLead.company}</span>
                </div>
              )}
              {selectedLead.budget && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedLead.budget}</span>
                </div>
              )}
            </div>

            {/* Scope / Details Box */}
            <div className="mb-6">
              <div className="text-xs font-mono uppercase text-gray-400 mb-2">Project Brief</div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                {selectedLead.details}
              </div>
            </div>

            {/* Internal Staff Notes (Private) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-violet-300">
                  Internal Staff Notes (Private)
                </span>
                <span className="text-[10px] text-gray-500">Not visible to public visitors</span>
              </div>
              <textarea
                rows={3}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Log call summary, client requirements, proposal status..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors cursor-pointer"
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[#090D1C] border border-rose-500/40 p-6 text-left shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-white">Delete Lead Inbound</h4>
            </div>
            <p className="text-xs text-gray-300 mb-6">
              Are you sure you want to permanently delete the inquiry from{' '}
              <strong className="text-white">{deleteConfirmLead.name}</strong>? This action will be logged in the audit trail.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmLead(null)}
                className="px-3.5 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
