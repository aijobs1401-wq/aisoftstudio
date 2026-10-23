import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, UserCheck, KeyRound, AlertTriangle, X, CheckCircle2, Info } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getUsers, updateUserRole, UserItem } from '../../lib/dbService';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user, role } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchUserList = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  const handleOpenRoleModal = (u: UserItem) => {
    setEditingUser(u);
    setSelectedRole(u.role);
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;
    if (role !== 'admin') {
      alert('Only administrators have permissions to modify user roles.');
      return;
    }

    await updateUserRole(editingUser.id, selectedRole, user?.email || undefined);
    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? { ...u, role: selectedRole } : u))
    );
    setShowRoleModal(false);
    setToastMessage(`Updated role for ${editingUser.email} to ${selectedRole.toUpperCase()}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const roleBadges = {
    admin: 'bg-violet-950 text-violet-300 border-violet-500/40',
    editor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
    viewer: 'bg-slate-900 text-gray-400 border-white/10',
  };

  return (
    <AdminLayout title="Users & Role-Based Access Control">
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-xs text-cyan-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Roles Policy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#070A18]/90 border border-violet-500/30">
            <div className="flex items-center gap-2 text-violet-300 font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Administrator</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Full privileges: manages leads, services, projects, settings, audit trails, and role assignments.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#070A18]/90 border border-cyan-500/30">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1">
              <UserCheck className="w-4 h-4" />
              <span>Editor</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Content manager: publishes and updates services and showcase items. Can view and update lead statuses.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#070A18]/90 border border-white/10">
            <div className="flex items-center gap-2 text-gray-300 font-bold text-xs mb-1">
              <KeyRound className="w-4 h-4" />
              <span>Viewer</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Read-only auditor: can review public-facing dashboards without mutation rights.
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl bg-[#070A18]/90 border border-white/10 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Authorized System Profiles
            </h3>
            <span className="text-xs text-gray-400 font-mono">{users.length} registered profiles</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-gray-400">Loading user profiles...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 font-mono text-[11px]">
                    <th className="py-3 px-4 font-medium">Identity</th>
                    <th className="py-3 px-4 font-medium">Assigned Role</th>
                    <th className="py-3 px-4 font-medium">Created Timestamp</th>
                    <th className="py-3 px-4 font-medium text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{u.full_name || 'Staff User'}</div>
                        <div className="text-gray-400 text-[11px] font-mono">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${
                            roleBadges[u.role]
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-400 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {role === 'admin' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenRoleModal(u)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold text-violet-300 hover:text-white bg-violet-950/40 hover:bg-violet-900/50 border border-violet-500/30 transition-colors cursor-pointer"
                          >
                            Change Role
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-600 font-mono">Restricted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Security Invitation Note */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white">Security Hardening Notice:</strong> Self-registration is strictly
            disabled for administrators to prevent unauthorized access. New staff profiles are created via
            Supabase Auth Dashboard and elevated using database triggers or trusted SQL migrations.
          </div>
        </div>
      </div>

      {/* Role Editor Modal */}
      {showRoleModal && editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#090D1C] border border-cyan-500/30 p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h4 className="text-sm font-bold text-white">Modify User Privilege</h4>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300 mb-4">
              Assign permission scope for <strong className="text-white">{editingUser.email}</strong>:
            </p>

            <div className="space-y-2 mb-6">
              {(['admin', 'editor', 'viewer'] as const).map((r) => (
                <label
                  key={r}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedRole === r
                      ? 'bg-violet-950/40 border-cyan-400 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={selectedRole === r}
                      onChange={() => setSelectedRole(r)}
                      className="accent-cyan-400"
                    />
                    <span className="text-xs font-semibold uppercase font-mono">{r}</span>
                  </div>
                  <span className="text-[10px] text-gray-500">
                    {r === 'admin'
                      ? 'Full Governance'
                      : r === 'editor'
                      ? 'Content Mutator'
                      : 'Audit Viewer'}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="px-3.5 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 cursor-pointer"
              >
                Apply Role Change
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
