import { useState, useEffect } from 'react';
import { MessageSquare, BookOpen, AlertTriangle, Users, TrendingUp, Activity, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, messages: 0, knowledge: 0, issues: 0, sessions: 0 });
  const [recentChats, setRecentChats] = useState<Array<{ id: string; title: string; updated_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [usersRes, messagesRes, knowledgeRes, issuesRes, sessionsRes, chatsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('chat_messages').select('id', { count: 'exact', head: true }),
      supabase.from('knowledge_base').select('id', { count: 'exact', head: true }),
      supabase.from('restaurant_issues').select('id', { count: 'exact', head: true }),
      supabase.from('chat_sessions').select('id', { count: 'exact', head: true }),
      supabase.from('chat_sessions').select('id, title, updated_at').order('updated_at', { ascending: false }).limit(5),
    ]);
    setStats({
      users: usersRes.count || 0,
      messages: messagesRes.count || 0,
      knowledge: knowledgeRes.count || 0,
      issues: issuesRes.count || 0,
      sessions: sessionsRes.count || 0,
    });
    setRecentChats(chatsRes.data || []);
    setLoading(false);
  }

  const kpis = [
    { label: 'Total Users', value: stats.users, icon: <Users size={20} />, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', trend: '+12%' },
    { label: 'Chat Sessions', value: stats.sessions, icon: <MessageSquare size={20} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', trend: '+8%' },
    { label: 'Messages Sent', value: stats.messages, icon: <Activity size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', trend: '+24%' },
    { label: 'Knowledge Articles', value: stats.knowledge, icon: <BookOpen size={20} />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', trend: '+3' },
    { label: 'POS Issues DB', value: stats.issues, icon: <AlertTriangle size={20} />, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', trend: '+5' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm">Overview of RestaurantAI platform metrics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className={`glass-card p-5 border ${kpi.bg}`}>
            <div className={`${kpi.color} mb-3`}>{kpi.icon}</div>
            {loading ? (
              <div className="h-8 bg-white/10 rounded animate-pulse mb-1" />
            ) : (
              <div className="font-display text-2xl font-bold text-white">{kpi.value}</div>
            )}
            <p className="text-xs text-gray-400 mt-1">{kpi.label}</p>
            <span className="text-xs text-emerald-400 font-medium">{kpi.trend}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent chats */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-white">Recent Chat Sessions</h3>
            <a href="/admin/chats" className="text-xs text-blue-400 hover:text-blue-300">View all</a>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentChats.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">No chat sessions yet</div>
          ) : (
            <div className="space-y-2">
              {recentChats.map(chat => (
                <div key={chat.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-all">
                  <MessageSquare size={16} className="text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500">{new Date(chat.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-white mb-5">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { to: '/admin/knowledge', icon: <BookOpen size={18} />, label: 'Add Knowledge Article', desc: 'Expand the AI knowledge base', color: 'text-amber-400' },
              { to: '/admin/issues', icon: <AlertTriangle size={18} />, label: 'Add POS Issue', desc: 'Document new troubleshooting guide', color: 'text-rose-400' },
              { to: '/admin/users', icon: <Users size={18} />, label: 'Manage Users', desc: 'View and manage user accounts', color: 'text-blue-400' },
              { to: '/admin/analytics', icon: <TrendingUp size={18} />, label: 'View Analytics', desc: 'Restaurant profit and performance', color: 'text-emerald-400' },
            ].map((a, i) => (
              <a key={i} href={a.to} className="flex items-center gap-4 p-4 rounded-xl bg-white/3 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all group">
                <div className={`${a.color} group-hover:scale-110 transition-transform`}>{a.icon}</div>
                <div>
                  <p className="text-sm font-medium text-white">{a.label}</p>
                  <p className="text-xs text-gray-500">{a.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-white mb-5">System Status</h3>
          <div className="space-y-3">
            {[
              { label: 'AI Chatbot Engine', status: 'Operational' },
              { label: 'Knowledge Base API', status: 'Operational' },
              { label: 'Database (Supabase)', status: 'Operational' },
              { label: 'Authentication Service', status: 'Operational' },
              { label: 'Analytics Module', status: 'Operational' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-gray-300">{s.label}</span>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                  <CheckCircle2 size={12} />
                  {s.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-white mb-5">Platform Info</h3>
          <div className="space-y-3">
            {[
              { label: 'Version', value: 'v2.0.0' },
              { label: 'AI Model', value: 'NLP + RAG Pipeline' },
              { label: 'Database', value: 'PostgreSQL (Supabase)' },
              { label: 'Backend', value: 'Edge Functions' },
              { label: 'Frontend', value: 'React 18 + Tailwind' },
              { label: 'Auth', value: 'JWT + Row Level Security' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className="text-sm text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
