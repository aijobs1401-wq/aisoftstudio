import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  User,
  Database,
  Code2,
  ExternalLink,
  Info,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAuditLogs, AuditLog } from '../../lib/dbService';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    const data = await getAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.actor_email && log.actor_email.toLowerCase().includes(search.toLowerCase())) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(search.toLowerCase()));

    const matchesEntity =
      entityFilter === 'ALL' || log.entity_type.toUpperCase() === entityFilter.toUpperCase();

    return matchesSearch && matchesEntity;
  });

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('DELETE')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {action}
        </span>
      );
    }
    if (act.includes('CREATE') || act.includes('INSERT')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {action}
        </span>
      );
    }
    if (act.includes('UPDATE') || act.includes('UPSERT')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {action}
        </span>
      );
    }
    if (act.includes('ROLE') || act.includes('AUTH') || act.includes('SECURITY')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-violet-500/10 text-violet-400 border border-violet-500/20">
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
        {action}
      </span>
    );
  };

  const exportAuditLogsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ai_soft_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Security & Audit Logs</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <ShieldCheck className="w-3 h-3" />
                Immutable Trail
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Append-only audit register recording administrative actions, role updates, and system events.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition"
              title="Refresh log stream"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportAuditLogsJSON}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-500/20"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Security Notice Banner */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-white">Database Row-Level Security Enforced</p>
            <p className="text-slate-400">
              In Supabase PostgreSQL, audit logs are protected by strict RLS policies: only verified administrators can view records. Audit entries cannot be updated or deleted through the client application.
            </p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by actor, action, or entity ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
            >
            </input>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">All Entities</option>
              <option value="LEAD">Leads</option>
              <option value="SERVICE">Services</option>
              <option value="PROJECT">Projects</option>
              <option value="SITE_SETTINGS">Settings</option>
              <option value="USER">Users & Roles</option>
              <option value="AUTH">Authentication</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-400" />
                      Loading audit records...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No audit records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-white text-xs font-mono">
                            {log.actor_email || 'system'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-300 font-medium">
                          <Database className="w-3 h-3 text-cyan-400" />
                          {log.entity_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-400">
                        {log.entity_id || '—'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium transition"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {filteredLogs.length} of {logs.length} logged events</span>
            <span className="font-mono">Storage: Supabase PostgreSQL / audit_logs</span>
          </div>
        </div>

        {/* Payload Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-violet-400" />
                    Audit Entry Inspection
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    ID: {selectedLog.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
                >
                  Close
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Timestamp</span>
                    <span className="text-white font-mono">{new Date(selectedLog.created_at).toISOString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Actor</span>
                    <span className="text-white font-mono">{selectedLog.actor_email || 'system'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Action</span>
                    <div>{getActionBadge(selectedLog.action)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Entity</span>
                    <span className="text-cyan-400 font-mono">{selectedLog.entity_type} {selectedLog.entity_id ? `(${selectedLog.entity_id})` : ''}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                    Payload / Mutation Context
                  </label>
                  <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto">
                    {JSON.stringify(selectedLog.details || {}, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
