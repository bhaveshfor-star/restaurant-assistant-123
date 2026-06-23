import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle, X, Save } from 'lucide-react';
import { supabase, RestaurantIssue } from '../../lib/supabase';

const CATEGORIES = ['printer', 'payment', 'integration', 'software', 'inventory', 'authentication', 'network', 'menu', 'reporting', 'hardware'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

const severityColors: Record<string, string> = {
  low: 'badge-green',
  medium: 'badge-yellow',
  high: 'badge-red',
  critical: 'bg-red-900/50 text-red-200 border border-red-500/50 badge',
};

export default function IssuesManager() {
  const [items, setItems] = useState<RestaurantIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RestaurantIssue | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', category: 'printer', severity: 'medium',
    symptoms: '', solutions: '', is_active: true,
  });

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    const { data } = await supabase.from('restaurant_issues').select('*').order('created_at', { ascending: false });
    setItems((data as RestaurantIssue[]) || []);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm({ title: '', description: '', category: 'printer', severity: 'medium', symptoms: '', solutions: '', is_active: true });
    setShowForm(true);
  }

  function openEdit(item: RestaurantIssue) {
    setEditing(item);
    setForm({
      title: item.title, description: item.description, category: item.category,
      severity: item.severity, symptoms: item.symptoms.join('\n'), solutions: item.solutions.join('\n'),
      is_active: item.is_active,
    });
    setShowForm(true);
  }

  async function saveItem() {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(), description: form.description.trim(),
      category: form.category, severity: form.severity,
      symptoms: form.symptoms.split('\n').map(s => s.trim()).filter(Boolean),
      solutions: form.solutions.split('\n').map(s => s.trim()).filter(Boolean),
      is_active: form.is_active, updated_at: new Date().toISOString(),
    };
    if (editing) {
      await supabase.from('restaurant_issues').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('restaurant_issues').insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    loadItems();
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this issue entry?')) return;
    await supabase.from('restaurant_issues').delete().eq('id', id);
    loadItems();
  }

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.severity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">POS Issues Database</h1>
          <p className="text-gray-400 text-sm">{items.length} issue guides · Chatbot troubleshooting source</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Issue
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search issues..." className="input-field pl-10" />
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 glass-card animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <AlertTriangle size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No issues found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className={`glass-card p-5 hover:border-white/20 transition-all ${!item.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <span className="badge-blue">{item.category}</span>
                    <span className={severityColors[item.severity]}>{item.severity}</span>
                    {!item.is_active && <span className="badge-gray">Inactive</span>}
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {item.symptoms.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Symptoms ({item.symptoms.length})</p>
                        <p className="text-xs text-gray-400 line-clamp-2">{item.symptoms.slice(0, 2).join(' · ')}</p>
                      </div>
                    )}
                    {item.solutions.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Solutions ({item.solutions.length})</p>
                        <p className="text-xs text-gray-400 line-clamp-2">{item.solutions.slice(0, 2).join(' · ')}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-blue-400 transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => deleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
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
              <h2 className="font-display font-semibold text-white">{editing ? 'Edit POS Issue' : 'Add POS Issue'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Issue Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="e.g. KOT Printer Not Working" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
                  <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="input-field">
                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field min-h-[80px] resize-y" placeholder="Brief description of the issue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Symptoms (one per line)</label>
                <textarea value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} className="input-field min-h-[100px] resize-y font-mono text-sm" placeholder="Printer shows offline&#10;No output when printing&#10;Paper jam error" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Solutions (one per line)</label>
                <textarea value={form.solutions} onChange={e => setForm(f => ({ ...f, solutions: e.target.value }))} className="input-field min-h-[120px] resize-y font-mono text-sm" placeholder="Check printer power cable&#10;Verify USB connection&#10;Restart print spooler service" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-white/10">
              <button onClick={() => setShowForm(false)} className="btn-secondary py-2 px-5">Cancel</button>
              <button onClick={saveItem} disabled={saving || !form.title || !form.description} className="btn-primary flex items-center gap-2 py-2 px-5 disabled:opacity-50">
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
