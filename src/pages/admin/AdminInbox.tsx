import React, { useState, useEffect } from 'react';
import { MessageSquare, UserCheck, Shield, Search, RefreshCw, CheckCircle2, AlertTriangle, Send, FileText, Lock } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

interface Conversation {
  id: string;
  sender: string;
  status: 'unread' | 'active' | 'resolved' | 'escalated';
  assigned_to?: string;
  takeover_mode: boolean;
  internal_notes?: string;
  updated_at: string;
}

export default function AdminInbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [search, setSearch] = useState('');

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sb-access-token') || '';
      const res = await fetch('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data || []);
        if (data && data.length > 0 && !selectedConvo) {
          setSelectedConvo(data[0]);
          setNotesDraft(data[0].internal_notes || '');
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleUpdateConvo = async (updates: Partial<Conversation>) => {
    if (!selectedConvo) return;
    try {
      const token = localStorage.getItem('sb-access-token') || '';
      const res = await fetch(`/api/conversations/${selectedConvo.sender}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update conversation');
      const updated = await res.json();
      setSelectedConvo(updated);
      setConversations((prev) =>
        prev.map((c) => (c.sender === updated.sender ? updated : c))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedConvo) return;
    setSavingNotes(true);
    await handleUpdateConvo({ internal_notes: notesDraft });
    setSavingNotes(false);
  };

  const filteredConvos = conversations.filter((c) =>
    c.sender.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Conversation Inbox">
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span>WhatsApp Conversation Inbox</span>
            </h2>
            <p className="text-xs text-gray-400">
              Manage incoming WhatsApp chats, take over conversations from AI, add internal notes, and resolve tickets.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchConversations}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400 font-mono">Loading inbox...</div>
        ) : conversations.length === 0 ? (
          <div className="p-16 rounded-2xl bg-[#070A18] border border-white/10 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-gray-600 mx-auto" />
            <div className="text-sm font-medium text-white">No active conversations</div>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              When customers message your connected WhatsApp numbers, their chat threads will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation List */}
            <div className="p-4 rounded-2xl bg-[#070A18] border border-white/10 space-y-3 lg:col-span-1 max-h-[600px] overflow-y-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by phone number..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#050711] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-2 pt-2">
                {filteredConvos.map((c) => {
                  const isSelected = selectedConvo?.sender === c.sender;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedConvo(c);
                        setNotesDraft(c.internal_notes || '');
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/20 border-cyan-400/40 text-white'
                          : 'bg-[#050711] border-white/5 text-gray-300 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-semibold text-white">+{c.sender}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                            c.status === 'unread'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                              : c.status === 'resolved'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>{c.takeover_mode ? '👤 Human Takeover' : '🤖 AI Active'}</span>
                        <span>{new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conversation Details & Takeover Controls */}
            {selectedConvo ? (
              <div className="p-6 rounded-2xl bg-[#070A18] border border-white/10 space-y-6 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <div className="text-xs font-mono text-cyan-400 mb-1">Customer Phone</div>
                    <h3 className="text-base font-bold text-white">+{selectedConvo.sender}</h3>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateConvo({ takeover_mode: !selectedConvo.takeover_mode })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedConvo.takeover_mode
                          ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {selectedConvo.takeover_mode ? '👤 Human Takeover Active (Click to Return to AI)' : '🤖 Enable Human Takeover'}
                    </button>

                    <select
                      value={selectedConvo.status}
                      onChange={(e: any) => handleUpdateConvo({ status: e.target.value })}
                      className="px-3 py-1.5 rounded-xl bg-[#050711] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="unread">Unread</option>
                      <option value="active">Active</option>
                      <option value="resolved">Resolved</option>
                      <option value="escalated">Escalated</option>
                    </select>
                  </div>
                </div>

                {/* Internal Notes Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Internal Staff Notes (Never sent to customer)</span>
                  </div>
                  <textarea
                    rows={4}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="Add private notes regarding this customer enquiry..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050711] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] cursor-pointer disabled:opacity-50"
                    >
                      {savingNotes ? 'Saving...' : 'Save Internal Notes'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-[#070A18] border border-white/10 text-center text-xs text-gray-400 lg:col-span-2 flex items-center justify-center">
                Select a conversation to inspect details
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
