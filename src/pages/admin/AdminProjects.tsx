import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  Cpu,
  Sparkles,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getProjects, saveProject, deleteProject } from '../../lib/dbService';
import { ShowcaseProject } from '../../config/siteConfig';
import { useAuth } from '../../context/AuthContext';

export default function AdminProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<ShowcaseProject | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [techInput, setTechInput] = useState('');

  const fetchProjectsList = async () => {
    setLoading(true);
    const data = await getProjects(false);
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjectsList();
  }, []);

  const handleOpenEdit = (project: ShowcaseProject, isCreating = false) => {
    setEditingProject({ ...project });
    setIsNew(isCreating);
    setTechInput(project.technologies.join(', '));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const technologies = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updated: ShowcaseProject = {
      ...editingProject,
      technologies,
    };

    await saveProject(updated, user?.email || undefined);
    await fetchProjectsList();
    setEditingProject(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    await deleteProject(deleteConfirmId, user?.email || undefined);
    await fetchProjectsList();
    setDeleteConfirmId(null);
  };

  const handleCreateNew = () => {
    const newProj: ShowcaseProject = {
      id: `project-${Date.now()}`,
      title: '',
      subtitle: '',
      category: 'AI',
      allCategories: ['AI'],
      image: '/src/assets/images/concept_ai_dashboard_1792785468334.jpg',
      conceptSummary: '',
      challenge: '',
      solution: '',
      technologies: ['React 19', 'TypeScript', 'Tailwind CSS'],
      metrics: [
        { label: 'Efficiency', value: '+40%' },
        { label: 'Latency', value: '< 100ms' },
      ],
      accentColor: '#8B5CF6',
    };
    handleOpenEdit(newProj, true);
  };

  return (
    <AdminLayout title="Portfolio & Showcase Management">
      <div className="space-y-6">
        {/* Top Header Action */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Project Showcase Systems</h2>
            <p className="text-xs text-gray-400">
              Manage concept artifacts, architecture details, and illustrative showcase metrics.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Showcase Item</span>
          </button>
        </div>

        {/* Project Cards Table */}
        <div className="rounded-2xl bg-[#070A18]/90 border border-white/10 overflow-hidden shadow-xl">
          {loading ? (
            <div className="text-center py-16 text-xs text-gray-400">Loading showcase items...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 text-xs text-gray-500">No projects configured.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 font-mono text-[11px]">
                    <th className="py-3 px-4 font-medium">Preview</th>
                    <th className="py-3 px-4 font-medium">Title & Subtitle</th>
                    <th className="py-3 px-4 font-medium">Category</th>
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 w-24">
                        <div className="w-20 aspect-video rounded-lg overflow-hidden bg-slate-900 border border-white/10">
                          <img
                            src={proj.image}
                            alt={proj.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-sm">{proj.title}</div>
                        <div className="text-[11px] text-gray-400 line-clamp-1">{proj.subtitle}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-cyan-300 font-medium">
                        {proj.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                          Concept Project
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(proj, false)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
                            title="Edit Project"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(proj.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                            title="Delete Project"
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

      {/* Edit / Add Modal */}
      {editingProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#090D1C] border border-cyan-500/30 p-6 sm:p-8 text-left shadow-2xl">
            <button
              type="button"
              onClick={() => setEditingProject(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {isNew ? 'Add Showcase System' : `Edit — ${editingProject.title}`}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-mono mb-1">Title</label>
                  <input
                    type="text"
                    value={editingProject.title}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, title: e.target.value })
                    }
                    placeholder="e.g. AI Operations Dashboard"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-mono mb-1">Primary Category</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        category: e.target.value as ShowcaseProject['category'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#070A18] border border-white/10 text-white font-mono"
                  >
                    <option value="AI">AI</option>
                    <option value="Web">Web</option>
                    <option value="Automation">Automation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1">Subtitle</label>
                <input
                  type="text"
                  value={editingProject.subtitle}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, subtitle: e.target.value })
                  }
                  placeholder="e.g. Neural topology monitoring & autonomous agent orchestrator"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1">Image Asset Path / URL</label>
                <input
                  type="text"
                  value={editingProject.image}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, image: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1">Concept Summary</label>
                <textarea
                  rows={2}
                  value={editingProject.conceptSummary}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, conceptSummary: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-mono mb-1">The Challenge</label>
                  <textarea
                    rows={2}
                    value={editingProject.challenge}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, challenge: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-mono mb-1">The Solution</label>
                  <textarea
                    rows={2}
                    value={editingProject.solution}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, solution: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1">
                  Technologies (comma separated)
                </label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="React 19, TypeScript, Tailwind CSS, WebSockets"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[#090D1C] border border-rose-500/40 p-6 text-left shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-white">Delete Project</h4>
            </div>
            <p className="text-xs text-gray-300 mb-6">
              Are you sure you want to delete this showcase item from the public catalog?
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
