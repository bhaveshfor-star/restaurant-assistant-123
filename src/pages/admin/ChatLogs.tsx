import { useState, useEffect } from 'react';
import { MessageSquare, Search, ChevronDown, ChevronUp, Bot, User } from 'lucide-react';
import { supabase, ChatSession } from '../../lib/supabase';

interface SessionWithMessages extends ChatSession {
  messages?: Array<{ id: string; role: string; content: string; created_at: string }>;
  expanded?: boolean;
}

export default function ChatLogs() {
  const [sessions, setSessions] = useState<SessionWithMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadSessions(); }, []);

  async function loadSessions() {
    setLoading(true);
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50);
    setSessions((data as SessionWithMessages[]) || []);
    setLoading(false);
  }

  async function toggleSession(session: SessionWithMessages) {
    const updated = sessions.map(s => {
      if (s.id !== session.id) return s;
      return { ...s, expanded: !s.expanded };
    });
    setSessions(updated);

    if (!session.messages && !session.expanded) {
      const { data } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });
      setSessions(prev => prev.map(s => s.id === session.id ? { ...s, messages: data || [] } : s));
    }
  }

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Chat Logs</h1>
        <p className="text-gray-400 text-sm">{sessions.length} conversations recorded</p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." className="input-field pl-10" />
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 glass-card animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No chat sessions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(session => (
            <div key={session.id} className="glass-card overflow-hidden">
              <button
                onClick={() => toggleSession(session)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare size={16} className="text-blue-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">{session.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(session.updated_at).toLocaleString()} · ID: {session.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                {session.expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              {session.expanded && (
                <div className="border-t border-white/10 p-5 space-y-3 bg-black/20 max-h-96 overflow-y-auto scrollbar-thin">
                  {!session.messages ? (
                    <div className="text-center py-4 text-gray-500 text-sm">Loading messages...</div>
                  ) : session.messages.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">No messages in this session</div>
                  ) : (
                    session.messages.map(msg => (
                      <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-white/10 border border-white/20'}`}>
                          {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-blue-400" />}
                        </div>
                        <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-blue-600/30 text-white' : 'bg-white/5 text-gray-300'}`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-gray-600 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
