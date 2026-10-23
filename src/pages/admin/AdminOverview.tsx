import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Users,
  Briefcase,
  Layers,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
  Plus,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getLeads,
  getServices,
  getProjects,
  getAuditLogs,
  Lead,
  AuditLog,
  updateLeadStatus,
  LeadStatus,
} from '../../lib/dbService';

export default function AdminOverview() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [servicesCount, setServicesCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [l, s, p, a] = await Promise.all([
      getLeads(),
      getServices(false),
      getProjects(false),
      getAuditLogs(),
    ]);
    setLeads(l);
    setServicesCount(s.length);
    setProjectsCount(p.length);
    setAuditLogs(a);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const inProgressLeads = leads.filter((l) => ['contacted', 'qualified', 'in_progress'].includes(l.status)).length;
  const convertedLeads = leads.filter((l) => l.status === 'converted').length;

  const handleQuickStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await updateLeadStatus(leadId, newStatus);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
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
    <AdminLayout title="Overview Dashboard">
      <div className="space-y-6">
        {/* Top KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Leads */}
          <div className="p-5 rounded-2xl bg-[#070A18]/90 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-gray-400">Total Leads</span>
              <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {loading ? '...' : totalLeads}
              </div>
              <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
                <span className="text-cyan-400 font-semibold">{newLeads} new</span>
                <span>awaiting initial review</span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Pipeline */}
          <div className="p-5 rounded-2xl bg-[#070A18]/90 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-gray-400">In Pipeline</span>
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {loading ? '...' : inProgressLeads}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Contacted, qualified & active deals
              </div>
            </div>
          </div>

          {/* Card 3: Published Services */}
          <div className="p-5 rounded-2xl bg-[#070A18]/90 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-gray-400">Published Services</span>
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {loading ? '...' : servicesCount}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Active on live public website
              </div>
            </div>
          </div>

          {/* Card 4: Portfolio Projects */}
          <div className="p-5 rounded-2xl bg-[#070A18]/90 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-gray-400">Portfolio Showcases</span>
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {loading ? '...' : projectsCount}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Concept & production systems
              </div>
            </div>
          </div>
        </div>

        {/* Lead Status Distribution Bar */}
        <div className="p-6 rounded-2xl bg-[#070A18]/90 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Lead Pipeline Distribution</h2>
              <p className="text-xs text-gray-400">Real-time status breakdown across incoming leads</p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              title="Refresh metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {totalLeads === 0 ? (
            <div className="text-center py-6 text-xs text-gray-500">
              No lead records found. Contact submissions from the website will populate here.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Proportional Segment Bar */}
              <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden flex">
                <div
                  style={{ width: `${(newLeads / totalLeads) * 100}%` }}
                  className="bg-cyan-400 h-full transition-all"
                  title={`New: ${newLeads}`}
                />
                <div
                  style={{ width: `${(inProgressLeads / totalLeads) * 100}%` }}
                  className="bg-violet-500 h-full transition-all"
                  title={`In Progress: ${inProgressLeads}`}
                />
                <div
                  style={{ width: `${(convertedLeads / totalLeads) * 100}%` }}
                  className="bg-emerald-400 h-full transition-all"
                  title={`Converted: ${convertedLeads}`}
                />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs font-mono pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="text-gray-300">New ({newLeads})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                  <span className="text-gray-300">In Pipeline ({inProgressLeads})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-gray-300">Converted ({convertedLeads})</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Split: Recent Leads & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Leads (Col 1-8) */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-[#070A18]/90 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Recent Inquiries</h2>
                <p className="text-xs text-gray-400">Latest business inquiries submitted from the website</p>
              </div>
              <Link
                href="/admin/leads"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Manage all leads</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {leads.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-500">
                No inquiries submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 font-mono text-[11px]">
                      <th className="pb-3 font-medium">Contact</th>
                      <th className="pb-3 font-medium">Service</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leads.slice(0, 5).map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pr-3">
                          <div className="font-semibold text-white">{lead.name}</div>
                          <div className="text-gray-400 text-[11px]">{lead.email}</div>
                        </td>
                        <td className="py-3 pr-3 text-gray-300">{lead.service}</td>
                        <td className="py-3 pr-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                              statusColors[lead.status]
                            }`}
                          >
                            {lead.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleQuickStatusChange(lead.id, e.target.value as LeadStatus)
                            }
                            className="px-2 py-1 rounded bg-[#090D1C] border border-white/10 text-[11px] text-gray-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="in_progress">In Progress</option>
                            <option value="converted">Converted</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Activity Feed (Col 9-12) */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-[#070A18]/90 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Audit Feed</h2>
                <p className="text-xs text-gray-400">System & admin event stream</p>
              </div>
              <Link
                href="/admin/audit-logs"
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
              >
                View all
              </Link>
            </div>

            {auditLogs.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-500">
                No activity recorded yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {auditLogs.slice(0, 6).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                    <div className="flex items-center justify-between font-mono text-[10px] text-gray-400 mb-1">
                      <span className="text-cyan-400 font-semibold">{log.action}</span>
                      <span>
                        {new Date(log.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="text-gray-300 text-[11px] truncate">
                      {log.entity_type} {log.entity_id ? `· ${log.entity_id}` : ''}
                    </div>
                    {log.actor_email && (
                      <div className="text-[10px] text-gray-500 mt-1 font-mono">
                        by {log.actor_email}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
