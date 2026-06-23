import { useState, useEffect } from 'react';
import { Users, Search, Shield, User, Clock } from 'lucide-react';
import { supabase, Profile } from '../../lib/supabase';

export default function UsersManager() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data as Profile[]) || []);
    setLoading(false);
  }

  async function toggleRole(user: Profile) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${user.email} to ${newRole}?`)) return;
    await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
    loadUsers();
  }

  const filtered = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white mb-1">User Management</h1>
        <p className="text-gray-400 text-sm">{users.length} registered users</p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-10" />
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="table-header text-left">User</th>
              <th className="table-header text-left hidden md:table-cell">Email</th>
              <th className="table-header text-left hidden lg:table-cell">Joined</th>
              <th className="table-header text-left">Role</th>
              <th className="table-header text-left hidden md:table-cell">Last Seen</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="table-cell"><div className="h-8 bg-white/10 rounded animate-pulse w-32" /></td>
                  <td className="table-cell hidden md:table-cell"><div className="h-4 bg-white/5 rounded animate-pulse w-40" /></td>
                  <td className="table-cell hidden lg:table-cell"><div className="h-4 bg-white/5 rounded animate-pulse w-20" /></td>
                  <td className="table-cell"><div className="h-6 bg-white/5 rounded animate-pulse w-16" /></td>
                  <td className="table-cell hidden md:table-cell"><div className="h-4 bg-white/5 rounded animate-pulse w-20" /></td>
                  <td className="table-cell"><div className="h-8 bg-white/5 rounded animate-pulse w-20 ml-auto" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-500">
                  <Users size={32} className="mx-auto mb-2" />
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-all">
                  <td className="table-cell">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(u.full_name || u.email || 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-white font-medium text-sm">{u.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="table-cell hidden md:table-cell text-gray-400">{u.email}</td>
                  <td className="table-cell hidden lg:table-cell text-gray-500 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="table-cell">
                    {u.role === 'admin' ? (
                      <span className="badge-blue flex items-center gap-1 w-fit">
                        <Shield size={10} /> Admin
                      </span>
                    ) : (
                      <span className="badge-gray flex items-center gap-1 w-fit">
                        <User size={10} /> User
                      </span>
                    )}
                  </td>
                  <td className="table-cell hidden md:table-cell text-gray-500 text-xs">
                    {u.last_seen ? new Date(u.last_seen).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="table-cell text-right">
                    <button
                      onClick={() => toggleRole(u)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all"
                    >
                      {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
