import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Briefcase,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getServices, saveService, deleteService } from '../../lib/dbService';
import { ServiceItem } from '../../config/siteConfig';
import { useAuth } from '../../context/AuthContext';

export default function AdminServices() {
  const { user, role } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [highlightsInput, setHighlightsInput] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const isReadOnly = role === 'viewer';

  const fetchServicesList = async () => {
    setLoading(true);
    const data = await getServices(false);
    setServices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchServicesList();
  }, []);

  const handleOpenEdit = (service: ServiceItem, isCreating = false) => {
    if (isReadOnly) return;
    setEditingService({ ...service });
    setIsNew(isCreating);
    setHighlightsInput((service.highlights || []).join('\n'));
  };

  const handleTogglePublish = async (service: ServiceItem) => {
    if (isReadOnly) return;
    const updated = {
      ...service,
      published: !(service.published ?? true),
    };
    await saveService(updated, user?.email || undefined);
    setServices((prev) => prev.map((s) => (s.id === service.id ? updated : s)));
    setActionNotice(
      `Service "${service.title}" is now ${updated.published ? 'published' : 'draft (hidden)'}.`
    );
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleShiftOrder = async (index: number, direction: 'up' | 'down') => {
    if (isReadOnly) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const currentItem = services[index];
    const targetItem = services[targetIndex];

    const currentOrder = currentItem.displayOrder ?? index + 1;
    const targetOrder = targetItem.displayOrder ?? targetIndex + 1;

    const updatedCurrent = { ...currentItem, displayOrder: targetOrder };
    const updatedTarget = { ...targetItem, displayOrder: currentOrder };

    await Promise.all([
      saveService(updatedCurrent, user?.email || undefined),
      saveService(updatedTarget, user?.email || undefined),
    ]);

    await fetchServicesList();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || isReadOnly) return;

    const highlights = highlightsInput
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    const updatedService: ServiceItem = {
      ...editingService,
      highlights,
      displayOrder: Number(editingService.displayOrder) || 1,
      published: editingService.published ?? true,
    };

    await saveService(updatedService, user?.email || undefined);
    await fetchServicesList();
    setEditingService(null);
    setActionNotice(`Successfully saved service "${updatedService.title}".`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId || isReadOnly) return;
    await deleteService(deleteConfirmId, user?.email || undefined);
    await fetchServicesList();
    setDeleteConfirmId(null);
    setActionNotice('Service successfully deleted from database.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleCreateNew = () => {
    if (isReadOnly) return;
    const nextNum = (services.length + 1).toString().padStart(2, '0');
    const newService: ServiceItem = {
      id: `service-${Date.now()}`,
      number: nextNum,
      title: '',
      description: '',
      highlights: [],
      gradient: 'from-violet-500/20 via-cyan-500/10 to-transparent',
      iconType: 'ai',
      displayOrder: services.length + 1,
      published: true,
    };
    handleOpenEdit(newService, true);
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.number.includes(search);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && (s.published ?? true)) ||
      (statusFilter === 'draft' && s.published === false);
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Services Management">
      <div className="space-y-6">
        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-xs text-cyan-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search service title, number, keywords..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070A18] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/10">
              {(['all', 'published', 'draft'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-violet-600/40 text-white font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {!isReadOnly && (
              <button
                type="button"
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 shadow-md cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            )}
          </div>
        </div>

        {/* Services List Table */}
        <div className="rounded-2xl bg-[#070A18]/90 border border-white/10 overflow-hidden shadow-xl">
          {loading ? (
            <div className="text-center py-16 text-xs text-gray-400">Loading services...</div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-16 text-xs text-gray-500">
              No services found matching filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 font-mono text-[11px]">
                    <th className="py-3 px-4 font-medium w-16">Order</th>
                    <th className="py-3 px-4 font-medium w-16">Index</th>
                    <th className="py-3 px-4 font-medium">Service Title</th>
                    <th className="py-3 px-4 font-medium">Category</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Highlights</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredServices.map((service, index) => {
                    const isPublished = service.published ?? true;
                    return (
                      <tr key={service.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 font-mono text-gray-400">
                            <span className="tabular-nums font-semibold text-white">
                              {service.displayOrder ?? index + 1}
                            </span>
                            {!isReadOnly && (
                              <div className="flex flex-col ml-1">
                                <button
                                  type="button"
                                  onClick={() => handleShiftOrder(index, 'up')}
                                  disabled={index === 0}
                                  className="text-gray-500 hover:text-cyan-400 disabled:opacity-20 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleShiftOrder(index, 'down')}
                                  disabled={index === filteredServices.length - 1}
                                  className="text-gray-500 hover:text-cyan-400 disabled:opacity-20 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">
                          {service.number}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{service.title}</div>
                          <div className="text-[11px] text-gray-400 line-clamp-1 max-w-md">
                            {service.description}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-violet-300 uppercase">
                          {service.iconType}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(service)}
                            disabled={isReadOnly}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider border cursor-pointer transition-colors ${
                              isPublished
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50'
                                : 'bg-slate-900 text-gray-400 border-white/10 hover:bg-slate-800'
                            }`}
                          >
                            {isPublished ? (
                              <>
                                <Eye className="w-3 h-3 text-emerald-400" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 text-gray-500" />
                                <span>Draft (Hidden)</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-300">
                          {(service.highlights || []).length} highlights
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(service, false)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
                                title="Edit Service"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {role === 'admin' && (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(service.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                                title="Delete Service"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit / Create Service Modal */}
      {editingService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#090D1C] border border-cyan-500/30 p-6 sm:p-8 text-left shadow-2xl">
            <button
              type="button"
              onClick={() => setEditingService(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {isNew ? 'Create New Service' : `Edit Service — ${editingService.title}`}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 font-mono mb-1">Index Number</label>
                  <input
                    type="text"
                    value={editingService.number}
                    onChange={(e) =>
                      setEditingService({ ...editingService, number: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-mono mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={editingService.displayOrder ?? 1}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        displayOrder: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-mono mb-1">Icon Category</label>
                  <select
                    value={editingService.iconType}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        iconType: e.target.value as ServiceItem['iconType'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#070A18] border border-white/10 text-white"
                  >
                    <option value="ai">AI / Brain</option>
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile Application</option>
                    <option value="automation">Workflow Automation</option>
                    <option value="cloud">Cloud & Infrastructure</option>
                    <option value="design">UI/UX & Design</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1">Service Title</label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) =>
                    setEditingService({ ...editingService, title: e.target.value })
                  }
                  placeholder="e.g. Autonomous AI Agents"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={editingService.description}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  placeholder="Concise overview of what this offering delivers..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-400 font-mono">Highlights (1 per line)</label>
                  <span className="text-[10px] text-gray-500">Rendered as check-bullets</span>
                </div>
                <textarea
                  rows={4}
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
                  placeholder="Custom LLM Pipelines&#10;Autonomous Agents&#10;Workflow Orchestration"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                />
              </div>

              {/* Publish Toggle in Edit Form */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Publish on Live Website</div>
                  <div className="text-[11px] text-gray-400">
                    When active, this service appears in the public services section.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={editingService.published ?? true}
                  onChange={(e) =>
                    setEditingService({ ...editingService, published: e.target.checked })
                  }
                  className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[#090D1C] border border-rose-500/40 p-6 text-left shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-white">Delete Service</h4>
            </div>
            <p className="text-xs text-gray-300 mb-6">
              Are you sure you want to delete this service? It will be removed from the database and public site.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer"
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
