import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Send, Plus, MessageSquare, Trash2, Clock, Zap, LogIn } from 'lucide-react';
import { supabase, ChatSession, ChatMessage } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED = [
  'Why is KOT not printing?',
  'Payment gateway failed',
  'Orders not syncing with Swiggy',
  'POS app crashing repeatedly',
  'How to reconnect printer?',
  'Inventory not updating',
  'How to improve restaurant profit?',
  'Cashier login issue',
];

function formatMessage(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-bold text-white my-1">{line.slice(2, -2)}</p>;
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const formatted = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      return <div key={i} className="flex gap-2 my-0.5"><span className="text-blue-400 shrink-0 font-medium">{numberedMatch[1]}.</span><span className="text-gray-300">{numberedMatch[2]}</span></div>;
    }

    const bulletMatch = line.match(/^[•*]\s+(.*)/);
    if (bulletMatch) {
      return <div key={i} className="flex gap-2 my-0.5"><span className="text-blue-400 shrink-0">•</span><span className="text-gray-300">{bulletMatch[1]}</span></div>;
    }

    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <p key={i} className="my-0.5 text-gray-300">{formatted}</p>;
  });
}

export default function ChatbotPage() {
  const { user, session } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (user) loadSessions();
    else {
      // Guest welcome message
      setMessages([{
        id: '0',
        role: 'assistant',
        content: "Hello! I'm your Restaurant AI Assistant. I can help troubleshoot POS issues, answer questions about online orders, payment problems, inventory, and more.\n\nSign in to save your chat history, or continue as a guest below.",
        timestamp: new Date(),
      }]);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadSessions() {
    if (!user) return;
    setLoadingSessions(true);
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20);
    setSessions((data as ChatSession[]) || []);
    setLoadingSessions(false);
  }

  async function createSession() {
    if (!user) return null;
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: 'New Conversation' })
      .select()
      .maybeSingle();
    if (!error && data) {
      const s = data as ChatSession;
      setSessions(prev => [s, ...prev]);
      return s.id;
    }
    return null;
  }

  async function loadSessionMessages(sessionId: string) {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages((data as ChatMessage[]).map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at),
      })));
    }
  }

  async function selectSession(sessionId: string) {
    setCurrentSession(sessionId);
    await loadSessionMessages(sessionId);
  }

  async function deleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation();
    await supabase.from('chat_sessions').delete().eq('id', sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession === sessionId) {
      setCurrentSession(null);
      setMessages([]);
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setInput('');

    let sessionId = currentSession;
    if (!sessionId && user) {
      sessionId = await createSession();
      setCurrentSession(sessionId);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Update session title from first message
    if (user && sessionId && messages.length === 0) {
      const title = text.slice(0, 50);
      await supabase.from('chat_sessions').update({ title }).eq('id', sessionId);
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title } : s));
    }

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Apikey': SUPABASE_ANON_KEY,
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, history, session_id: sessionId }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered a connection error. Please check your internet connection and try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function startNewChat() {
    setCurrentSession(null);
    setMessages([{
      id: '0',
      role: 'assistant',
      content: "Hello! I'm your Restaurant AI Assistant. How can I help you today? Ask me about POS issues, printer problems, payment failures, or anything related to your restaurant system.",
      timestamp: new Date(),
    }]);
  }

  return (
    <div className="pt-16 h-screen flex flex-col bg-gray-950">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-gray-900/80 border-r border-white/10 p-4 gap-3">
          <button onClick={startNewChat} className="btn-primary flex items-center justify-center gap-2 py-2.5 text-sm">
            <Plus size={16} /> New Chat
          </button>

          {!user && (
            <Link to="/login" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-300 text-sm hover:bg-blue-600/20 transition-all">
              <LogIn size={14} /> Sign in to save chats
            </Link>
          )}

          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1">
            {loadingSessions ? (
              <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>
            ) : sessions.length === 0 && user ? (
              <div className="text-center py-8 text-gray-500 text-sm">No conversations yet</div>
            ) : (
              sessions.map(s => (
                <div
                  key={s.id}
                  onClick={() => selectSession(s.id)}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                    currentSession === s.id ? 'bg-blue-600/20 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <MessageSquare size={14} className="shrink-0" />
                  <span className="text-sm truncate flex-1">{s.title}</span>
                  <button
                    onClick={(e) => deleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Zap size={12} className="text-emerald-400" />
              AI-powered support
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-gray-900/50">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-white text-sm">Restaurant AI Assistant</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">Online · Powered by NLP + RAG</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto chat-scroll p-6 space-y-5">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mb-5">
                  <Bot size={36} className="text-blue-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Restaurant AI Assistant</h3>
                <p className="text-gray-400 text-sm max-w-sm mb-8">Ask me anything about your restaurant POS system — I'll provide instant AI-powered solutions.</p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                  {SUGGESTED.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className="text-left px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs hover:bg-blue-600/20 hover:border-blue-500/30 hover:text-white transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400'
                }`}>
                  {msg.role === 'user' ? 'U' : <Bot size={16} />}
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600 px-1">
                    <Clock size={10} />
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-blue-400" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                  <span className="text-gray-500 text-xs">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-white/10 bg-gray-900/50">
            {messages.length > 0 && !loading && (
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED.slice(0, 4).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs hover:bg-blue-600/20 hover:text-white hover:border-blue-500/30 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about KOT issues, payment failures, online orders..."
                  rows={1}
                  className="input-field resize-none pr-12 min-h-[48px] max-h-32 py-3 leading-relaxed"
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                  }}
                />
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg shadow-blue-600/30 shrink-0"
              >
                <Send size={18} className="text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  );
}
