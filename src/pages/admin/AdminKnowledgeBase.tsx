import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle2, AlertTriangle, RefreshCw, X, Search } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

interface KnowledgeItem {
  id: string;
  category: 'faq' | 'product' | 'policy' | 'general';
  question: string;
  answer: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminKnowledgeBase() {
  const { user } = useAuth();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState<'faq' | 'product' | 'policy' | 'general'>('faq');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchKnowledgeBase = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sb-access-token') || '';
      const res = await fetch('/api/knowledge-base', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('sb-access-token') || '';
      const res = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category: newCategory,
          question: newQuestion,
          answer: newAnswer,
          is_active: true
        })
      });
      if (!res.ok) throw new Error('Failed to create knowledge base item');
      setNewQuestion('');
      setNewAnswer('');
      setShowAddModal(false);
      fetchKnowledgeBase();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge base entry?')) return;
    try {
      const token = localStorage.getItem('sb-access-token') || '';
      const res = await fetch(`/api/knowledge-base/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete item');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredItems = items.filter(
    (i) =>
      i.question.toLowerCase().includes(search.toLowerCase()) ||
      i.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Knowledge Base">
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>AI Knowledge Base & FAQs</span>
            </h2>
            <p className="text-xs text-gray-400">
              Add FAQs, product details, and policies that your AI chatbot will use to answer customer enquiries.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Knowledge Item</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search knowledge base..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070A18] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 font-mono">Loading knowledge base...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#070A18] border border-white/10 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-gray-600 mx-auto" />
            <div className="text-sm font-medium text-white">No knowledge items found</div>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Add your first FAQ or product detail so the AI chatbot can answer customer questions accurately.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-[#070A18] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-semibold bg-violet-950 text-violet-300 border border-violet-500/35">
                    {item.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-white">{item.question}</h4>
                <p className="text-xs text-gray-300 leading-relaxed bg-[#050711] p-3 rounded-xl border border-white/5">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-[#070A18] border border-white/15 p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-sm font-bold text-white">Add Knowledge Base Entry</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050711] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="faq">FAQ</option>
                    <option value="product">Product / Service</option>
                    <option value="policy">Policy / Terms</option>
                    <option value="general">General Info</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Question / Topic Keyword</label>
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="e.g. What are your pricing plans?"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050711] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Answer / Accurate Details</label>
                  <textarea
                    rows={4}
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Provide precise details the AI should reply with..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050711] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'Adding...' : 'Add Entry'}
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
