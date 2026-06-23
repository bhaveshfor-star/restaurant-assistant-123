import { Link } from 'react-router-dom';
import { Bot, Zap, BarChart2, Shield, ChevronRight, Star, CheckCircle2, ArrowRight, Cpu, Database, MessageSquare, TrendingUp, Clock, Users } from 'lucide-react';

const features = [
  { icon: <Bot size={24} />, title: 'AI-Powered Chatbot', desc: 'Semantic NLP engine understands natural language queries and provides contextual troubleshooting.' },
  { icon: <Zap size={24} />, title: 'Real-Time Support', desc: 'Instant responses to POS issues — KOT failures, payment errors, and software glitches.' },
  { icon: <BarChart2 size={24} />, title: 'Profit Analytics', desc: 'Daily, weekly, and monthly revenue dashboards with AI-generated business insights.' },
  { icon: <Database size={24} />, title: 'Knowledge Base', desc: 'Dynamic knowledge management — admins can add, edit, and update troubleshooting content without coding.' },
  { icon: <Shield size={24} />, title: 'Secure Admin Panel', desc: 'JWT-authenticated admin dashboard with role-based access control and full CRUD operations.' },
  { icon: <Cpu size={24} />, title: 'RAG Pipeline', desc: 'Retrieval-Augmented Generation searches the knowledge base for accurate, context-aware responses.' },
];

const stats = [
  { value: '10,000+', label: 'Restaurants Supported', icon: <Users size={20} /> },
  { value: '< 1s', label: 'Response Time', icon: <Clock size={20} /> },
  { value: '98.5%', label: 'Issue Resolution Rate', icon: <CheckCircle2 size={20} /> },
  { value: '24/7', label: 'Always Available', icon: <Zap size={20} /> },
];

const issues = [
  'Why is KOT not printing?',
  'Payment gateway failed',
  'Orders not syncing with Swiggy',
  'POS app crashing repeatedly',
  'How to reconnect printer?',
  'Inventory not updating',
  'Cashier login issue',
  'How to improve restaurant profit?',
];

const testimonials = [
  { name: 'Rahul Sharma', role: 'Restaurant Manager, Mumbai', rating: 5, text: 'RestaurantAI resolved our KOT issue in under a minute. Saved us during peak dinner service!' },
  { name: 'Priya Mehta', role: 'F&B Director, Bangalore', rating: 5, text: 'The profit analytics module gave us insights we never had before. Revenue up 18% in one quarter.' },
  { name: 'Arun Kumar', role: 'POS Admin, Delhi', rating: 5, text: 'Managing the knowledge base is so easy. Our support team now resolves issues without calling tech support.' },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gray-950 -z-10" />
      <div className="fixed inset-0 bg-grid-pattern -z-10 opacity-40" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-3xl -z-10" />

      {/* Hero */}
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-300 text-sm font-medium mb-8 animate-fade-in">
            <Zap size={14} />
            AI-Powered Restaurant POS Support System
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6 animate-slide-up">
            Intelligent Support for
            <br />
            <span className="text-gradient">Restaurant POS</span>
            <br />
            Systems
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            AI-powered troubleshooting, real-time chatbot support, and profit analytics — all in one platform. Eliminate downtime and maximize restaurant revenue.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link to="/chatbot" className="btn-primary flex items-center gap-2 text-base">
              <Bot size={18} />
              Try AI Chatbot
              <ArrowRight size={16} />
            </Link>
            <Link to="/features" className="btn-secondary flex items-center gap-2 text-base">
              Explore Features
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Scrolling issue tags */}
          <div className="mt-14 overflow-hidden">
            <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider font-medium">Ask me anything like...</p>
            <div className="flex gap-3 flex-wrap justify-center max-w-4xl mx-auto">
              {issues.map((issue, i) => (
                <Link
                  key={i}
                  to="/chatbot"
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-blue-600/20 hover:border-blue-500/40 hover:text-white transition-all duration-200"
                >
                  "{issue}"
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-white/10 bg-white/2">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-3 text-blue-400">{s.icon}</div>
                <div className="font-display text-3xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-sm text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Everything Your Restaurant <span className="text-gradient">Needs</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              A complete AI platform for POS troubleshooting, analytics, and operational efficiency.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-6 group hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5 group-hover:bg-blue-600/30 transition-all">
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-white/2 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">How It <span className="text-gradient">Works</span></h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">From query to resolution in seconds.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: <MessageSquare size={28} />, title: 'Describe Your Issue', desc: 'Type your restaurant POS problem in natural language — just like texting a support agent.' },
              { step: '02', icon: <Cpu size={28} />, title: 'AI Analyzes & Searches', desc: 'Our NLP engine uses semantic search to find the most relevant solutions from the knowledge base.' },
              { step: '03', icon: <TrendingUp size={28} />, title: 'Get Instant Solution', desc: 'Receive step-by-step troubleshooting guides with severity ratings and escalation options.' },
            ].map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="text-6xl font-display font-black text-white/5 mb-4">{s.step}</div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-blue-600/30">
                  {s.icon}
                </div>
                <h3 className="font-display font-semibold text-xl text-white mb-3">{s.title}</h3>
                <p className="text-gray-400 leading-relaxed">{s.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-20 right-0 translate-x-1/2 text-white/20">
                    <ArrowRight size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">Trusted by <span className="text-gradient">Restaurant Owners</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10" />
            <div className="relative">
              <h2 className="font-display text-4xl font-bold text-white mb-4">
                Ready to Transform Your Restaurant Support?
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Join thousands of restaurant operators using AI to resolve POS issues instantly.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register" className="btn-primary flex items-center justify-center gap-2">
                  Start Free Trial
                  <ArrowRight size={16} />
                </Link>
                <Link to="/chatbot" className="btn-secondary flex items-center justify-center gap-2">
                  <Bot size={16} />
                  Try Chatbot Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
