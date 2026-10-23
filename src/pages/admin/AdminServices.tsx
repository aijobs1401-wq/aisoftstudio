import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Briefcase,
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getServices, saveService, deleteService } from '../../lib/dbService';
import { ServiceItem } from '../../config/siteConfig';
import { useAuth } from '../../context/AuthContext';

export default function AdminServices() {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [highlightsInput, setHighlightsInput] = useState('');

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
    setEditingService({ ...service });
    setIsNew(isCreating);
    setHighlightsInput(service.highlights.join('\n'));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const highlights = highlightsInput
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    const updatedService: ServiceItem = {
      ...editingService,
      highlights,
    };

    await saveService(updatedService, user?.email || undefined);
    await fetchServicesList();
    setEditingService(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    await deleteService(deleteConfirmId, user?.email || undefined);
    await fetchServicesList();
    setDeleteConfirmId(null);
  };

  const handleCreateNew = () => {
    const nextNum = (services.length + 1).toString().padStart(2, '0');
    const newService: ServiceItem = {
      id: `service-${Date.now()}`,
      number: nextNum,
      title: '',
      description: '',
      highlights: [],
      gradient: 'from-violet-500/20 via-cyan-500/10 to-transparent',
      iconType: 'ai',
    };
    handleOpenEdit(newService, true);
  };

  return (
    <AdminLayout title="Services Management">
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Live Service Offerings</h2>
            <p className="text-xs text-gray-400">
              Manage capability cards, highlights, and icons displayed on the public website.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>

        {/* Services List Table */}
        <div className="rounded-2xl bg-[#070A18]/90 border border-white/10 overflow-hidden shadow-xl">
          {loading ? (
            <div className="text-center py-16 text-xs text-gray-400">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-16 text-xs text-gray-500">No services configured yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 font-mono text-[11px]">
                    <th className="py-3 px-4 font-medium">Index</th>
                    <th className="py-3 px-4 font-medium">Service Title</th>
                    <th className="py-3 px-4 font-medium">Icon Type</th>
                    <th className="py-3 px-4 font-medium">Highlights Count</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-white/[0.02] transition-colors">
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
                      <td className="py-3.5 px-4 font-mono text-gray-300">
                        {service.highlights.length} bullet points
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(service, false)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(service.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                <div className="col-span-2">
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
                  placeholder="e.g. AI Solutions"
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
              Are you sure you want to delete this service? It will no longer appear on the live website.
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
