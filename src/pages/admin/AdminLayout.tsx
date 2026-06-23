import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bot, LayoutDashboard, BookOpen, AlertTriangle, MessageSquare, Users, BarChart2, LogOut, Menu, X, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, exact: true },
  { to: '/admin/knowledge', label: 'Knowledge Base', icon: <BookOpen size={18} /> },
  { to: '/admin/issues', label: 'POS Issues', icon: <AlertTriangle size={18} /> },
  { to: '/admin/chats', label: 'Chat Logs', icon: <MessageSquare size={18} /> },
  { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
  { to: '/admin/analytics', label: 'Analytics', icon: <BarChart2 size={18} /> },
];

export default function AdminLayout() {
  const { profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">You need admin privileges to access this area.</p>
          <Link to="/" className="btn-primary inline-flex">Go Home</Link>
        </div>
      </div>
    );
  }

  function isActive(to: string, exact = false) {
    return exact ? location.pathname === to : location.pathname.startsWith(to);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  function handleGoBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-sm">RestaurantAI</span>
            <div className="flex items-center gap-1">
              <Shield size={10} className="text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">Admin Panel</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={isActive(item.to, item.exact) ? 'sidebar-item-active' : 'sidebar-item'}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {profile?.full_name?.[0] || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-gray-900/80 border-r border-white/10 fixed inset-y-0 left-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-gray-900 border-r border-white/10 z-10">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:ml-60 flex-1 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gray-900/80">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-400 hover:text-white">
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-white text-sm">Admin Panel</span>
          <div className="w-8" />
        </div>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
