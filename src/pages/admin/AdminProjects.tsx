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
  Search,
  Filter,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getProjects, saveProject, deleteProject } from '../../lib/dbService';
import { ShowcaseProject } from '../../config/siteConfig';
import { useAuth } from '../../context/AuthContext';

export default function AdminProjects() {
  const { user, role } = useAuth();
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'AI' | 'Web' | 'Automation'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [editingProject, setEditingProject] = useState<ShowcaseProject | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [techInput, setTechInput] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const isReadOnly = role === 'viewer';

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
    if (isReadOnly) return;
    setEditingProject({ ...project });
    setIsNew(isCreating);
    setTechInput((project.technologies || []).join(', '));
  };

  const handleTogglePublish = async (project: ShowcaseProject) => {
    if (isReadOnly) return;
    const updated = {
      ...project,
      published: !(project.published ?? true),
    };
    await saveProject(updated, user?.email || undefined);
    setProjects((prev) => prev.map((p) => (p.id === project.id ? updated : p)));
    setActionNotice(
      `Project "${project.title}" is now ${updated.published ? 'published' : 'draft (hidden)'}.`
    );
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleShiftOrder = async (index: number, direction: 'up' | 'down') => {
    if (isReadOnly) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const currentItem = projects[index];
    const targetItem = projects[targetIndex];

    const currentOrder = currentItem.displayOrder ?? index + 1;
    const targetOrder = targetItem.displayOrder ?? targetIndex + 1;

    const updatedCurrent = { ...currentItem, displayOrder: targetOrder };
    const updatedTarget = { ...targetItem, displayOrder: currentOrder };

    await Promise.all([
      saveProject(updatedCurrent, user?.email || undefined),
      saveProject(updatedTarget, user?.email || undefined),
    ]);

    await fetchProjectsList();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || isReadOnly) return;

    const technologies = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updated: ShowcaseProject = {
      ...editingProject,
      technologies,
      displayOrder: Number(editingProject.displayOrder) || 1,
      published: editingProject.published ?? true,
      isConcept: editingProject.isConcept ?? true,
      projectUrl: editingProject.projectUrl?.trim() || undefined,
    };

    await saveProject(updated, user?.email || undefined);
    await fetchProjectsList();
    setEditingProject(null);
    setActionNotice(`Successfully saved project "${updated.title}".`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId || isReadOnly) return;
    await deleteProject(deleteConfirmId, user?.email || undefined);
    await fetchProjectsList();
    setDeleteConfirmId(null);
    setActionNotice('Project successfully deleted from database.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleCreateNew = () => {
    if (isReadOnly) return;
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
      isConcept: true,
      projectUrl: '',
      displayOrder: projects.length + 1,
      published: true,
    };
    handleOpenEdit(newProj, true);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All' || p.allCategories.includes(categoryFilter);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && (p.published ?? true)) ||
      (statusFilter === 'draft' && p.published === false);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <AdminLayout title="Portfolio & Showcase Management">
      <div className="space-y-6">
        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-xs text-cyan-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search project title, category, keywords..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070A18] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
              {(['All', 'AI', 'Web', 'Automation'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
              {(['all', 'published', 'draft'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-colors cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-violet-600/40 text-white font-semibold'
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
                <span>Add Project</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Cards Table */}
        <div className="rounded-2xl bg-[#070A18]/90 border border-white/10 overflow-hidden shadow-xl">
          {loading ? (
            <div className="text-center py-16 text-xs text-gray-400">Loading showcase items...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 text-xs text-gray-500">
              No projects found matching filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 font-mono text-[11px]">
                    <th className="py-3 px-4 font-medium w-16">Order</th>
                    <th className="py-3 px-4 font-medium w-24">Preview</th>
                    <th className="py-3 px-4 font-medium">Title & Subtitle</th>
                    <th className="py-3 px-4 font-medium">Category</th>
                    <th className="py-3 px-4 font-medium">Badge</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProjects.map((proj, index) => {
                    const isPublished = proj.published ?? true;
                    return (
                      <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-1 font-mono text-gray-400">
                            <span className="tabular-nums font-semibold text-white">
                              {proj.displayOrder ?? index + 1}
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
                                  disabled={index === filteredProjects.length - 1}
                                  className="text-gray-500 hover:text-cyan-400 disabled:opacity-20 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="w-16 aspect-video rounded-lg overflow-hidden bg-slate-900 border border-white/10">
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
                          <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                            <span>{proj.title}</span>
                            {proj.projectUrl && (
                              <a
                                href={proj.projectUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-400 hover:text-cyan-400"
                                title="External URL"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 line-clamp-1">{proj.subtitle}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-cyan-300 font-medium">
                          {proj.category}
                        </td>
                        <td className="py-3.5 px-4">
                          {proj.isConcept ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                              Concept Project
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-violet-950 text-violet-300 border border-violet-500/30">
                              Production
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(proj)}
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
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(proj, false)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
                                title="Edit Project"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {role === 'admin' && (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(proj.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                                title="Delete Project"
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
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
                  <label className="block text-gray-400 font-mono mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={editingProject.displayOrder ?? 1}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        displayOrder: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-mono mb-1">Primary Category</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) => {
                      const newCat = e.target.value as ShowcaseProject['category'];
                      setEditingProject({
                        ...editingProject,
                        category: newCat,
                        allCategories: Array.from(new Set([...editingProject.allCategories, newCat])),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#070A18] border border-white/10 text-white font-mono"
                  >
                    <option value="AI">AI</option>
                    <option value="Web">Web</option>
                    <option value="Automation">Automation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-mono mb-1">External Project URL (Optional)</label>
                  <input
                    type="url"
                    value={editingProject.projectUrl || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, projectUrl: e.target.value })
                    }
                    placeholder="https://example.com/demo"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-[11px]"
                  />
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

              {/* Status Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Concept Project</div>
                    <div className="text-[10px] text-gray-400">Label as concept in public showcase</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingProject.isConcept ?? true}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, isConcept: e.target.checked })
                    }
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Published on Website</div>
                    <div className="text-[10px] text-gray-400">Display in public portfolio gallery</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingProject.published ?? true}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, published: e.target.checked })
                    }
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>
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
