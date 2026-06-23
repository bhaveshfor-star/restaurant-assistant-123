import { Bot, Zap, BarChart2, Shield, Database, MessageSquare, TrendingUp, Clock, Users, CheckCircle2, AlertTriangle, Printer, CreditCard, Wifi, Package } from 'lucide-react';

const mainFeatures = [
  {
    icon: <Bot size={32} />,
    title: 'AI Chatbot Engine',
    subtitle: 'NLP-Powered Support',
    color: 'from-blue-500 to-cyan-500',
    desc: 'Semantic search chatbot with intent recognition, context memory, and RAG pipeline for accurate restaurant POS troubleshooting.',
    points: ['Natural language understanding', 'Semantic similarity matching', 'Context-aware responses', 'FAQ retrieval system', 'Conversation history'],
  },
  {
    icon: <BarChart2 size={32} />,
    title: 'Profit Analytics',
    subtitle: 'Business Intelligence',
    color: 'from-emerald-500 to-teal-500',
    desc: 'Comprehensive profit analysis with daily, weekly, and monthly dashboards, KPI tracking, and AI-generated business insights.',
    points: ['Revenue & profit charts', 'Peak hour analysis', 'Top-selling items', 'Order type breakdown', 'Revenue predictions'],
  },
  {
    icon: <Shield size={32} />,
    title: 'Admin Dashboard',
    subtitle: 'Secure Management',
    color: 'from-amber-500 to-orange-500',
    desc: 'JWT-authenticated admin panel with full CRUD access to knowledge base, user management, chat logs, and analytics.',
    points: ['Role-based access control', 'Knowledge base editor', 'Chat log monitoring', 'User management', 'Real-time analytics'],
  },
  {
    icon: <Database size={32} />,
    title: 'Knowledge Base',
    subtitle: 'Dynamic Content Management',
    color: 'from-rose-500 to-pink-500',
    desc: 'Admin-editable knowledge repository with categorized articles, issue guides, and troubleshooting procedures.',
    points: ['Category management', 'Tag & keyword search', 'Rich content editor', 'Active/inactive toggle', 'Instant AI sync'],
  },
];

const posIssues = [
  { icon: <Printer size={20} />, title: 'KOT/Printer Issues', items: ['Printer offline', 'Paper jam', 'Print spooler failure', 'Network disconnect'] },
  { icon: <CreditCard size={20} />, title: 'Payment Problems', items: ['Gateway timeout', 'Card terminal error', 'UPI failure', 'Transaction decline'] },
  { icon: <Wifi size={20} />, title: 'Online Orders', items: ['Swiggy sync failure', 'Zomato order delay', 'API authentication', 'Order status mismatch'] },
  { icon: <Package size={20} />, title: 'Inventory', items: ['Stock not deducting', 'Wrong item count', 'Recipe mapping error', 'Report discrepancy'] },
  { icon: <AlertTriangle size={20} />, title: 'App Crashes', items: ['POS app freeze', 'Slow performance', 'Database errors', 'Update failures'] },
  { icon: <Users size={20} />, title: 'Staff Access', items: ['Login failures', 'Password reset', 'Role permissions', 'Account lockout'] },
];

const techStack = [
  { name: 'React.js', category: 'Frontend', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { name: 'Tailwind CSS', category: 'Frontend', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { name: 'TypeScript', category: 'Frontend', color: 'bg-blue-400/20 text-blue-200 border-blue-400/30' },
  { name: 'Supabase', category: 'Backend', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { name: 'PostgreSQL', category: 'Database', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  { name: 'Edge Functions', category: 'AI/API', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { name: 'JWT Auth', category: 'Security', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { name: 'NLP/RAG', category: 'AI/NLP', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  { name: 'Row Level Security', category: 'Security', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  { name: 'Vite', category: 'Tooling', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
];

export default function FeaturesPage() {
  return (
    <div className="pt-24 pb-20 px-4 relative overflow-hidden">
      <div className="fixed inset-0 bg-grid-pattern -z-10 opacity-30" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-300 text-sm font-medium mb-6">
            <Zap size={14} />
            Complete Feature Set
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-5">
            Built for <span className="text-gradient">Modern Restaurants</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Every feature designed to solve real restaurant operational challenges — from POS downtime to profit optimization.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
          {mainFeatures.map((f, i) => (
            <div key={i} className="glass-card p-8 group hover:border-white/20 transition-all duration-300">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                {f.icon}
              </div>
              <div className="mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{f.subtitle}</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed mb-6">{f.desc}</p>
              <ul className="space-y-2">
                {f.points.map((p, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* POS Issues Covered */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white mb-3">POS Issues <span className="text-gradient">We Solve</span></h2>
            <p className="text-gray-400">Comprehensive coverage of all common restaurant POS problems.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posIssues.map((issue, i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    {issue.icon}
                  </div>
                  <h4 className="font-semibold text-white">{issue.title}</h4>
                </div>
                <ul className="space-y-1.5">
                  {issue.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white mb-3">Technology <span className="text-gradient">Stack</span></h2>
            <p className="text-gray-400">Built with production-grade technologies.</p>
          </div>
          <div className="glass-card p-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {techStack.map((t, i) => (
                <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${t.color} text-sm font-medium`}>
                  <span>{t.name}</span>
                  <span className="opacity-50">·</span>
                  <span className="text-xs opacity-70">{t.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: <Clock size={22} />, value: '< 500ms', label: 'AI Response Time' },
            { icon: <TrendingUp size={22} />, value: '98.5%', label: 'Resolution Rate' },
            { icon: <Users size={22} />, value: '10K+', label: 'Active Users' },
            { icon: <MessageSquare size={22} />, value: '1M+', label: 'Queries Handled' },
          ].map((m, i) => (
            <div key={i} className="glass-card p-6 text-center">
              <div className="flex justify-center text-blue-400 mb-3">{m.icon}</div>
              <div className="font-display text-3xl font-bold text-white mb-1">{m.value}</div>
              <div className="text-sm text-gray-400">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
