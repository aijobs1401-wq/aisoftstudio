import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Bell, CheckCircle2, ShieldAlert, Users, Info, CheckCheck } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  AdminNotification,
} from '../../lib/dbService';

export default function AdminNotifications() {
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifs = async () => {
    setLoading(true);
    const data = await getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: string, link?: string | null) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (link) {
      setLocation(link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getNotifIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'lead':
        return <Users className="w-4 h-4 text-cyan-400" />;
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'status':
        return <CheckCircle2 className="w-4 h-4 text-violet-400" />;
      case 'system':
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <AdminLayout title="Notification Center">
      <div className="space-y-6 max-w-4xl">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filter === 'all'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filter === 'unread'
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              Unread Only ({notifications.filter((n) => !n.read).length})
            </button>
          </div>

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={notifications.every((n) => n.read)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-40 cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-cyan-400" />
            <span>Mark All as Read</span>
          </button>
        </div>

        {/* Notifications Stream */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-16 text-xs text-gray-400">Loading notifications...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-[#070A18]/60 border border-white/5 text-xs text-gray-500">
              No notifications matching current filter.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkRead(item.id, item.link)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                  item.read
                    ? 'bg-[#070A18]/60 border-white/5 opacity-80'
                    : 'bg-[#090E24] border-violet-500/40 shadow-sm'
                }`}
              >
                <div className="p-2 rounded-lg bg-white/5 shrink-0 mt-0.5">
                  {getNotifIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{item.title}</span>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block shadow-[0_0_6px_#22D3EE]" />
                      )}
                    </h4>
                    <span className="text-[10px] font-mono text-gray-500">
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{item.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
