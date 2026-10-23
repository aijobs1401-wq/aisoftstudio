import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Layers,
  Settings,
  ShieldAlert,
  Bell,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, AdminNotification, markNotificationAsRead } from '../../lib/dbService';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  title?: string;
}

export default function AdminLayout({ children, activePath, title = 'Admin Console' }: AdminLayoutProps) {
  const { user, profile, role, logout, isConfigured, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isConfigured && !isLoading && !user) {
      setLocation('/admin/login');
    }
  }, [isConfigured, isLoading, user, setLocation]);

  useEffect(() => {
    getNotifications().then(setNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const currentPath = activePath || location;

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Leads', href: '/admin/leads', icon: Users },
    { name: 'Services', href: '/admin/services', icon: Briefcase },
    { name: 'Projects', href: '/admin/projects', icon: Layers },
    { name: 'Users & Roles', href: '/admin/users', icon: ShieldAlert },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell, badge: unreadCount },
    { name: 'Website Settings', href: '/admin/settings', icon: Settings },
    { name: 'Security & Audit', href: '/admin/audit-logs', icon: ShieldAlert },
  ];

  const handleLogout = async () => {
    await logout();
    setLocation('/admin/login');
  };

  const handleNotificationClick = async (notif: AdminNotification) => {
    await markNotificationAsRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setShowNotifDropdown(false);
    if (notif.link) {
      setLocation(notif.link);
    }
  };

  const roleBadgeColor = {
    admin: 'bg-violet-950 text-violet-300 border-violet-500/30',
    editor: 'bg-cyan-950 text-cyan-300 border-cyan-500/30',
    viewer: 'bg-slate-900 text-gray-300 border-white/10',
  }[role || 'viewer'];

  return (
    <div className="min-h-screen bg-[#050711] text-[#F8FAFC] flex flex-col antialiased">
      {/* Top Banner if Supabase is unconfigured */}
      {!isConfigured && (
        <div className="bg-gradient-to-r from-violet-950/80 via-blue-950/80 to-cyan-950/80 border-b border-cyan-500/30 px-4 py-2.5 text-xs text-gray-300 flex flex-wrap items-center justify-between gap-2 z-50">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong className="text-white">Database Setup Mode:</strong> Supabase environment keys
              are not yet configured. The dashboard is operating in local demonstration mode.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowSetupModal(true)}
            className="px-3 py-1 rounded-md bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/40 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            View Setup Guide & SQL
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#070A18] border-r border-white/10 shrink-0">
          {/* Brand Emblem */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] p-[1.5px]">
                <div className="w-full h-full bg-[#050711] rounded-[6px] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-white tracking-tight">AI SOFT STUDIO</div>
                <div className="text-[10px] text-cyan-400 font-mono">Control Center</div>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? currentPath === '/admin'
                  : currentPath.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/20 text-white border border-cyan-400/30 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500 text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* User profile & Logout */}
          <div className="p-4 border-t border-white/5 bg-white/[0.01]">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] p-0.5 shrink-0">
                  <div className="w-full h-full bg-[#050711] rounded-full flex items-center justify-center text-xs font-bold text-white uppercase font-mono">
                    {profile?.full_name ? profile.full_name[0] : user?.email ? user.email[0] : 'A'}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {profile?.full_name || 'Admin User'}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {user?.email || 'admin@aisoftstudio.io'}
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border shrink-0 ${roleBadgeColor}`}
              >
                {role || 'Admin'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 border border-rose-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar Header */}
          <header className="h-16 bg-[#070A18]/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-30">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                aria-label="Open mobile menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {title}
              </h1>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3">
              {/* Link to public website */}
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                target="_blank"
              >
                <span>Live Website</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 relative cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#090D1C] border border-violet-500/30 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                      <div className="text-xs font-bold text-white">Notifications</div>
                      <Link
                        href="/admin/notifications"
                        onClick={() => setShowNotifDropdown(false)}
                        className="text-[11px] text-cyan-400 hover:underline"
                      >
                        View all
                      </Link>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 4).map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                              notif.read
                                ? 'bg-white/[0.01] border-white/5 text-gray-400'
                                : 'bg-violet-950/30 border-cyan-400/30 text-white'
                            }`}
                          >
                            <div className="text-xs font-semibold mb-1 flex items-center justify-between">
                              <span>{notif.title}</span>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 line-clamp-2">
                              {notif.message}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Body View */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-72 bg-[#070A18] h-full flex flex-col border-r border-white/10 shadow-2xl p-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-r from-violet-500 to-cyan-400" />
                <span className="text-sm font-bold text-white">AI SOFT STUDIO</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/admin'
                    ? currentPath === '/admin'
                    : currentPath.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                      isActive
                        ? 'bg-violet-600/30 text-white border border-cyan-400/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500 text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-white/10 mt-4">
              <button
                type="button"
                onClick={() => {
                  setMobileSidebarOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-rose-400 border border-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Setup Modal */}
      {showSetupModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#090D1C] border border-cyan-500/30 p-6 sm:p-8 text-left shadow-2xl">
            <button
              type="button"
              onClick={() => setShowSetupModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white bg-white/5"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Supabase Connection Guide</h3>
                <p className="text-xs text-gray-400">
                  Connect your live PostgreSQL database and admin authentication in 3 steps
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-mono">
                    1
                  </span>
                  <span>Set Environment Variables</span>
                </div>
                <p className="text-gray-400">
                  Add the following to your project environment variables (or Vercel Project Settings):
                </p>
                <pre className="p-3 rounded-lg bg-black/50 border border-white/5 font-mono text-[11px] text-cyan-300 overflow-x-auto">
{`VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"`}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-mono">
                    2
                  </span>
                  <span>Execute SQL Migration Schema</span>
                </div>
                <p className="text-gray-400">
                  Open your Supabase SQL Editor and execute the schema located at{' '}
                  <code className="text-violet-300">/supabase/schema.sql</code>. It creates all 6 tables,
                  indexes, and strict Row Level Security (RLS) policies.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-mono">
                    3
                  </span>
                  <span>Create the First Administrator</span>
                </div>
                <p className="text-gray-400">
                  Sign up your user via Supabase Auth, then run this SQL statement to grant administrator
                  privileges:
                </p>
                <pre className="p-3 rounded-lg bg-black/50 border border-white/5 font-mono text-[11px] text-violet-300 overflow-x-auto">
{`UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin@domain.com';`}
                </pre>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
