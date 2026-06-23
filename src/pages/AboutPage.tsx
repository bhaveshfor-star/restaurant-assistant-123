import { Bot, Target, Lightbulb, Code2, BookOpen, Rocket, CheckCircle2 } from 'lucide-react';

const objectives = [
  'AI-powered troubleshooting support for restaurant POS systems',
  'NLP-based query understanding with semantic similarity',
  'Real-time guidance and step-by-step issue resolution',
  'Knowledge-base driven support with dynamic content management',
  'POS issue diagnosis and intelligent escalation',
  'Future API integration with live POS systems',
];

const methodology = [
  { step: '01', title: 'Requirement Analysis', desc: 'Identified key pain points in restaurant POS operations through research and stakeholder interviews.' },
  { step: '02', title: 'POS Issue Dataset Collection', desc: 'Compiled comprehensive dataset of common POS issues, symptoms, and proven solutions.' },
  { step: '03', title: 'Knowledge Base Creation', desc: 'Structured the knowledge base with categories, tags, and semantic keywords for accurate retrieval.' },
  { step: '04', title: 'NLP Chatbot Integration', desc: 'Implemented semantic search with intent classification and RAG pipeline for intelligent responses.' },
  { step: '05', title: 'Backend & Database', desc: 'Built scalable Supabase backend with PostgreSQL, Edge Functions, and Row Level Security.' },
  { step: '06', title: 'Testing & Optimization', desc: 'Comprehensive testing across query variations, edge cases, and performance benchmarking.' },
];

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20 px-4 relative overflow-hidden">
      <div className="fixed inset-0 bg-grid-pattern -z-10 opacity-30" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-300 text-sm font-medium mb-6">
            <Bot size={14} />
            About the Project
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-5">
            AI-Powered <span className="text-gradient">Restaurant Support</span>
          </h1>
        </div>

        {/* Abstract */}
        <div className="glass-card p-10 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BookOpen size={20} />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Abstract</h2>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed mb-5">
            The system addresses operational inefficiencies in restaurant POS systems using AI-powered NLP support. It provides real-time troubleshooting, automates support workflows, and resolves common issues like KOT failures, missed online orders, and software glitches through an intelligent chatbot integrated with a structured knowledge base.
          </p>
          <p className="text-gray-400 leading-relaxed">
            By leveraging semantic search, intent recognition, and a Retrieval-Augmented Generation (RAG) pipeline, the system delivers context-aware responses to restaurant staff — eliminating the need for external technical support for most common issues. The admin panel allows knowledge base updates without any coding, ensuring the system stays current with evolving POS environments.
          </p>
        </div>

        {/* Problem Statement */}
        <div className="glass-card p-10 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Target size={20} />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Problem Statement</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-6">
            Restaurant POS systems are critical infrastructure for food service operations. When they fail, restaurants lose revenue, customer satisfaction drops, and staff are left without guidance. Current support models rely on phone calls, long wait times, and manual troubleshooting — unacceptable in a fast-paced restaurant environment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Software Glitches', desc: 'Unexpected crashes, freezes, and errors during peak service hours' },
              { label: 'KOT Failures', desc: 'Kitchen Order Tickets not printing, causing order delays and mistakes' },
              { label: 'Missed Online Orders', desc: 'Integration failures with food delivery platforms like Swiggy and Zomato' },
              { label: 'Delayed Support', desc: 'Hours of wait time for technical support during critical service periods' },
            ].map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0" />
                <div>
                  <p className="font-semibold text-white text-sm mb-1">{p.label}</p>
                  <p className="text-gray-400 text-sm">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Objectives */}
        <div className="glass-card p-10 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lightbulb size={20} />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Project Objectives</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-white mb-3">
              Development <span className="text-gradient">Methodology</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {methodology.map((m, i) => (
              <div key={i} className="glass-card p-6">
                <div className="text-5xl font-display font-black text-white/5 mb-3">{m.step}</div>
                <h4 className="font-display font-semibold text-white mb-2">{m.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technologies */}
        <div className="glass-card p-10 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Code2 size={20} />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Technologies Used</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { category: 'Frontend', items: ['React.js', 'TypeScript', 'Tailwind CSS', 'Lucide React'] },
              { category: 'Backend', items: ['Supabase', 'Edge Functions', 'REST APIs', 'WebSocket'] },
              { category: 'AI / NLP', items: ['Semantic Search', 'RAG Pipeline', 'Intent Classification', 'NLP Engine'] },
              { category: 'Database', items: ['PostgreSQL', 'Row Level Security', 'Real-time Subscriptions', 'JWT Auth'] },
            ].map((g, i) => (
              <div key={i}>
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{g.category}</h5>
                <ul className="space-y-2">
                  {g.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Deployment */}
        <div className="glass-card p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Rocket size={20} />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Deployment & Architecture</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: 'Frontend', details: ['Vite + React build', 'Deployable on Vercel/Netlify', 'Environment variables via .env', 'CDN asset delivery'] },
              { title: 'Backend', details: ['Supabase Edge Functions', 'Auto-scaled serverless', 'Global CDN distribution', 'Zero cold-start latency'] },
              { title: 'Database', details: ['PostgreSQL on Supabase', 'Row Level Security', 'Real-time subscriptions', 'Automatic backups'] },
            ].map((d, i) => (
              <div key={i} className="p-5 rounded-xl bg-white/3 border border-white/10">
                <h4 className="font-semibold text-white mb-3">{d.title}</h4>
                <ul className="space-y-1.5">
                  {d.details.map((detail, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle2 size={12} className="text-cyan-400 shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
