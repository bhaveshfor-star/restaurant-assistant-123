import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, BookOpen, X, Save, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase, KnowledgeBase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = ['general', 'printer', 'payment', 'integration', 'inventory', 'authentication', 'network', 'menu', 'analytics', 'maintenance', 'hr', 'reporting'];

export default function KnowledgeManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<KnowledgeBase | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '', content: '', category: 'general',
    tags: '', keywords: '', is_active: true,
  });

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    const { data } = await supabase.from('knowledge_base').select('*').order('created_at', { ascending: false });
    setItems((data as KnowledgeBase[]) || []);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm({ title: '', content: '', category: 'general', tags: '', keywords: '', is_active: true });
    setShowForm(true);
  }

  function openEdit(item: KnowledgeBase) {
    setEditing(item);
    setForm({
      title: item.title, content: item.content, category: item.category,
      tags: item.tags.join(', '), keywords: item.keywords.join(', '), is_active: item.is_active,
    });
    setShowForm(true);
  }

  async function saveItem() {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };
    if (editing) {
      await supabase.from('knowledge_base').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('knowledge_base').insert({ ...payload, created_by: user?.id });
    }
    setSaving(false);
    setShowForm(false);
    loadItems();
  }

  async function toggleActive(item: KnowledgeBase) {
    await supabase.from('knowledge_base').update({ is_active: !item.is_active }).eq('id', item.id);
    loadItems();
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this knowledge article?')) return;
    await supabase.from('knowledge_base').delete().eq('id', id);
    loadItems();
  }

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Knowledge Base</h1>
          <p className="text-gray-400 text-sm">{items.length} articles · AI uses this to answer questions</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Article
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search knowledge base..."
          className="input-field pl-10"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 glass-card animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No articles found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className={`glass-card p-5 transition-all ${!item.is_active ? 'opacity-50' : 'hover:border-white/20'}`}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <span className="badge-blue">{item.category}</span>
                    {!item.is_active && <span className="badge-gray">Inactive</span>}
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{item.content}</p>
                  {item.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <Tag size={12} className="text-gray-600" />
                      {item.tags.slice(0, 4).map(t => (
                        <span key={t} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(item)} className="p-2 text-gray-400 hover:text-white transition-colors" title={item.is_active ? 'Deactivate' : 'Activate'}>
                    {item.is_active ? <ToggleRight size={18} className="text-emerald-400" /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl bg-gray-900 border border-white/20 rounded-2xl shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-display font-semibold text-white">{editing ? 'Edit Article' : 'Add Knowledge Article'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Article title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="input-field min-h-[140px] resize-y" placeholder="Detailed article content..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                  <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="input-field" placeholder="tag1, tag2, tag3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Keywords (comma-separated)</label>
                  <input type="text" value={form.keywords} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))} className="input-field" placeholder="keyword1, keyword2" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}>
                  {form.is_active ? <ToggleRight size={24} className="text-emerald-400" /> : <ToggleLeft size={24} className="text-gray-500" />}
                </button>
                <span className="text-sm text-gray-300">{form.is_active ? 'Active — AI will use this article' : 'Inactive — AI will skip this article'}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-white/10">
              <button onClick={() => setShowForm(false)} className="btn-secondary py-2 px-5">Cancel</button>
              <button onClick={saveItem} disabled={saving || !form.title || !form.content} className="btn-primary flex items-center gap-2 py-2 px-5 disabled:opacity-50">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                {editing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
