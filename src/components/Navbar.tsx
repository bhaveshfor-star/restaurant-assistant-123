import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bot, BarChart2, Home, Info, LogIn, LogOut, User, Menu, X, Zap, Shield, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AddReportModal from './AddReportModal';

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAddReport, setShowAddReport] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const links = [
    { to: '/', label: 'Home', icon: <Home size={15} /> },
    { to: '/features', label: 'Features', icon: <Zap size={15} /> },
    { to: '/chatbot', label: 'Chatbot', icon: <Bot size={15} /> },
    { to: '/analytics', label: 'Analytics', icon: <BarChart2 size={15} /> },
    { to: '/about', label: 'About', icon: <Info size={15} /> },
  ];

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-950/95 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/20' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
              <Bot size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">
              Restaurant<span className="text-gradient">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to) && link.to !== '/'
                    ? 'text-white bg-white/10'
                    : location.pathname === '/' && link.to === '/'
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowAddReport(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <Plus size={15} />
                  Add Report
                </button>
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/admin') ? 'text-white bg-blue-600/20 border border-blue-500/30' : 'text-blue-400 hover:text-white hover:bg-blue-600/10'
                  }`}
                >
                  <Shield size={15} />
                  Admin
                </Link>
              </>
            )}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <User size={12} className="text-white" />
                  </div>
                  <span className="text-sm text-gray-300 font-medium">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  {isAdmin && <span className="badge-blue text-xs">Admin</span>}
                </div>
                <button onClick={handleSignOut} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  <LogIn size={15} />
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-950/98 backdrop-blur-xl border-b border-white/10 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.to) ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <button
                  onClick={() => { setShowAddReport(true); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Plus size={15} /> Add Report
                </button>
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-blue-400 hover:text-white hover:bg-blue-600/10 transition-all">
                  <Shield size={15} /> Admin Panel
                </Link>
              </>
            )}
            <div className="pt-3 border-t border-white/10">
              {user ? (
                <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  <LogOut size={15} /> Sign Out
                </button>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all text-center">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium bg-blue-600 text-white text-center rounded-xl">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>

    <AddReportModal
      isOpen={showAddReport}
      onClose={() => setShowAddReport(false)}
      onSuccess={() => {
        // Refresh the analytics page if we're on it
        if (location.pathname === '/analytics') {
          window.location.reload();
        }
      }}
    />
  </>
  );
}
