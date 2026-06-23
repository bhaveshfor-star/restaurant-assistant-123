import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Clock, BarChart2, PieChart, Activity, ArrowUp, ArrowDown, Plus, X, Save, Calendar } from 'lucide-react';
import { supabase, ProfitReport } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

type Period = '7d' | '30d' | 'today';

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  console.log("Analytics page rendering");
  const { user, isAdmin } = useAuth();
  const [reports, setReports] = useState<ProfitReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30d');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    report_date: new Date().toISOString().split('T')[0],
    total_sales: '',
    total_orders: '',
    avg_order_value: '',
    cost_of_goods: '',
    operating_expenses: '',
    online_orders: '',
    dine_in_orders: '',
    takeaway_orders: '',
  });

  const totalSalesValue = parseFloat(form.total_sales) || 0;
  const costOfGoods = parseFloat(form.cost_of_goods) || 0;
  const operatingExpenses = parseFloat(form.operating_expenses) || 0;
  const grossProfit = totalSalesValue - costOfGoods;
  const netProfit = grossProfit - operatingExpenses;

  useEffect(() => {
    if (user) fetchReports();
  }, [user, period]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveReport() {
    setSaving(true);
    try {
      const reportData = {
        report_date: form.report_date,
        total_sales: parseFloat(form.total_sales) || 0,
        total_orders: parseInt(form.total_orders) || 0,
        avg_order_value: parseFloat(form.avg_order_value) || 0,
        cost_of_goods: parseFloat(form.cost_of_goods) || 0,
        operating_expenses: parseFloat(form.operating_expenses) || 0,
        gross_profit: grossProfit,
        net_profit: netProfit,
        online_orders: parseInt(form.online_orders) || 0,
        dine_in_orders: parseInt(form.dine_in_orders) || 0,
        takeaway_orders: parseInt(form.takeaway_orders) || 0,
        top_items: [],
        hourly_data: [],
      };

      console.log('Saving report:', reportData);

      const { error } = await supabase.from('profit_reports').insert(reportData);

      if (error) {
        console.error('Error saving report:', error);
        alert('Failed to save report: ' + error.message);
      } else {
        console.log('Report saved successfully');
        setShowForm(false);
        setForm({
          report_date: new Date().toISOString().split('T')[0],
          total_sales: '', total_orders: '', avg_order_value: '',
          cost_of_goods: '', operating_expenses: '',
          online_orders: '', dine_in_orders: '', takeaway_orders: '',
        });
        // Fetch updated reports to refresh dashboard
        await fetchReports();
        console.log('Dashboard refreshed');
      }
    } catch (err) {
      console.error('Error saving report:', err);
      alert('Failed to save report');
    } finally {
      setSaving(false);
    }
  }

  async function fetchReports() {
    setLoading(true);
    try {
      let days = period === '7d' ? 7 : period === 'today' ? 1 : 30;
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      console.log('Fetching reports from:', fromDate.toISOString().split('T')[0], 'for period:', period);
      const { data, error } = await supabase
        .from('profit_reports')
        .select('*')
        .gte('report_date', fromDate.toISOString().split('T')[0])
        .order('report_date', { ascending: true });
      if (error) {
        console.error('Fetch error:', error);
        setReports([]);
      } else {
        console.log('Fetched reports:', data?.length, 'records');
        setReports((data as ProfitReport[]) || []);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setReports([]);
    }
    setLoading(false);
  }

  const totalSales = reports.reduce((s, r) => s + Number(r.total_sales), 0);
  const totalOrders = reports.reduce((s, r) => s + r.total_orders, 0);
  const totalProfit = reports.reduce((s, r) => s + Number(r.net_profit), 0);
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  // Aggregate top items across all reports
  const itemMap: Record<string, { qty: number; revenue: number }> = {};
  reports.forEach(r => {
    (r.top_items || []).forEach((item: { name: string; qty: number; revenue: number }) => {
      if (!itemMap[item.name]) itemMap[item.name] = { qty: 0, revenue: 0 };
      itemMap[item.name].qty += item.qty;
      itemMap[item.name].revenue += item.revenue;
    });
  });
  const topItems = Object.entries(itemMap).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);

  // Aggregate hourly data
  const hourlyMap: Record<number, number> = {};
  reports.forEach(r => {
    (r.hourly_data || []).forEach((h: { hour: number; orders: number }) => {
      hourlyMap[h.hour] = (hourlyMap[h.hour] || 0) + h.orders;
    });
  });
  const hourlyData = Object.entries(hourlyMap).sort((a, b) => Number(a[0]) - Number(b[0]));
  const maxHourlyOrders = Math.max(...hourlyData.map(([, v]) => v), 1);

  // Sales trend (last 14 entries for chart)
  const salesTrend = reports.slice(-14);
  const maxSales = Math.max(...salesTrend.map(r => Number(r.total_sales)), 1);

  if (!user) {
    return (
      <div className="pt-32 pb-20 px-4 text-center">
        <BarChart2 size={48} className="text-blue-400 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
        <p className="text-gray-400 mb-6">Sign in to view restaurant analytics and profit reports.</p>
        <Link to="/login" className="btn-primary inline-flex items-center gap-2">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 relative overflow-hidden">
      <div className="fixed inset-0 bg-grid-pattern -z-10 opacity-20" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Analytics Dashboard</h1>
            <p className="text-gray-400 text-sm">Restaurant performance metrics and profit analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
              {(['today', '7d', '30d'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  {p === 'today' ? 'Today' : p === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowForm(true)}
              style={{backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600'}}
            >
              + Add Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-3 w-20" />
                <div className="h-8 bg-white/10 rounded mb-2 w-28" />
                <div className="h-3 bg-white/5 rounded w-16" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { label: 'Total Revenue', value: `₹${(totalSales / 1000).toFixed(1)}K`, sub: `${reports.length} day${reports.length > 1 ? 's' : ''}`, icon: <DollarSign size={20} />, color: 'text-emerald-400', trend: +8.2 },
                { label: 'Total Orders', value: totalOrders.toLocaleString(), sub: `Avg ${(totalOrders / Math.max(reports.length, 1)).toFixed(0)}/day`, icon: <ShoppingBag size={20} />, color: 'text-blue-400', trend: +5.1 },
                { label: 'Net Profit', value: `₹${(totalProfit / 1000).toFixed(1)}K`, sub: `${profitMargin.toFixed(1)}% margin`, icon: <TrendingUp size={20} />, color: 'text-amber-400', trend: +12.4 },
                { label: 'Avg Order Value', value: `₹${avgOrderValue.toFixed(0)}`, sub: 'Per transaction', icon: <Activity size={20} />, color: 'text-rose-400', trend: -2.1 },
              ].map((kpi, i) => (
                <div key={i} className="kpi-card">
                  <div className={`${kpi.color}`}>{kpi.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{kpi.label}</p>
                    <p className="font-display text-2xl font-bold text-white mt-1">{kpi.value}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{kpi.sub}</p>
                      <span className={`flex items-center gap-0.5 text-xs font-medium ${kpi.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {kpi.trend > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                        {Math.abs(kpi.trend)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Sales Trend */}
              <div className="lg:col-span-2 glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-semibold text-white">Revenue Trend</h3>
                  <span className="badge-blue">₹ Daily Sales</span>
                </div>
                {salesTrend.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No data for this period</div>
                ) : (
                  <div className="relative h-48">
                    <div className="absolute inset-0 flex items-end gap-1">
                      {salesTrend.map((r, i) => {
                        const h = (Number(r.total_sales) / maxSales) * 100;
                        const date = new Date(r.report_date);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div
                              className="w-full rounded-t-sm bg-gradient-to-t from-blue-600/40 to-blue-500/80 hover:from-blue-600/60 hover:to-blue-400 transition-all cursor-pointer"
                              style={{ height: `${Math.max(h, 3)}%` }}
                            />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 border border-white/20 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10">
                              ₹{Number(r.total_sales).toLocaleString()}
                              <br />
                              <span className="text-gray-400">{date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>{salesTrend[0]?.report_date ? new Date(salesTrend[0].report_date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''}</span>
                  <span>{salesTrend[salesTrend.length - 1]?.report_date ? new Date(salesTrend[salesTrend.length - 1].report_date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''}</span>
                </div>
              </div>

              {/* Order Distribution */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold text-white mb-6">Order Distribution</h3>
                {reports.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-10">No data</div>
                ) : (() => {
                  const online = reports.reduce((s, r) => s + r.online_orders, 0);
                  const dineIn = reports.reduce((s, r) => s + r.dine_in_orders, 0);
                  const takeaway = reports.reduce((s, r) => s + r.takeaway_orders, 0);
                  const total = online + dineIn + takeaway || 1;
                  const segments = [
                    { label: 'Dine In', value: dineIn, pct: ((dineIn / total) * 100).toFixed(1), color: '#3b82f6' },
                    { label: 'Online', value: online, pct: ((online / total) * 100).toFixed(1), color: '#06b6d4' },
                    { label: 'Takeaway', value: takeaway, pct: ((takeaway / total) * 100).toFixed(1), color: '#10b981' },
                  ];
                  return (
                    <div className="space-y-4">
                      {segments.map((s, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-gray-300 flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                              {s.label}
                            </span>
                            <span className="text-white font-medium">{s.pct}%</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${s.pct}%`, backgroundColor: s.color }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{s.value.toLocaleString()} orders</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Second row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Peak Hours */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock size={18} className="text-amber-400" />
                  <h3 className="font-display font-semibold text-white">Peak Hours</h3>
                </div>
                {hourlyData.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-10">No data</div>
                ) : (
                  <div className="space-y-2">
                    {hourlyData.map(([hour, orders]) => {
                      const h = Number(hour);
                      const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
                      const pct = (orders / maxHourlyOrders) * 100;
                      const isPeak = orders >= maxHourlyOrders * 0.8;
                      return (
                        <div key={hour} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-12 shrink-0">{label}</span>
                          <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isPeak ? 'bg-amber-500' : 'bg-blue-600/60'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={`text-xs w-8 text-right ${isPeak ? 'text-amber-400 font-semibold' : 'text-gray-500'}`}>{orders}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top Items */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <PieChart size={18} className="text-emerald-400" />
                  <h3 className="font-display font-semibold text-white">Top Selling Items</h3>
                </div>
                {topItems.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-10">No data</div>
                ) : (
                  <div className="space-y-3">
                    {topItems.map(([name, data], i) => (
                      <div key={name} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: COLORS[i] + '40', border: `1px solid ${COLORS[i]}50`, color: COLORS[i] }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-white font-medium truncate">{name}</span>
                            <span className="text-xs text-gray-400 shrink-0 ml-2">₹{data.revenue.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(data.revenue / topItems[0][1].revenue) * 100}%`, backgroundColor: COLORS[i] }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">{data.qty} sold</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights */}
            <div className="mt-6 glass-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <Activity size={16} className="text-blue-400" />
                </div>
                <h3 className="font-display font-semibold text-white">AI Business Insights</h3>
                <span className="badge-blue ml-1">Powered by AI</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Revenue Opportunity', icon: <TrendingUp size={16} />, color: 'text-emerald-400', insight: `Your average order value of ₹${avgOrderValue.toFixed(0)} could be improved. Consider combo offers to push it above ₹${(avgOrderValue * 1.2).toFixed(0)}.` },
                  { title: 'Peak Hour Strategy', icon: <Clock size={16} />, color: 'text-amber-400', insight: 'Lunch (12-2 PM) and dinner (7-9 PM) are your busiest periods. Ensure full staffing and menu availability during these windows.' },
                  { title: 'Growth Potential', icon: <Users size={16} />, color: 'text-blue-400', insight: `Online orders represent growth potential. Consider promotional offers on food delivery platforms to increase the share beyond current levels.` },
                ].map((ins, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/3 border border-white/10">
                    <div className={`flex items-center gap-2 ${ins.color} mb-2`}>
                      {ins.icon}
                      <span className="text-xs font-semibold uppercase tracking-wider">{ins.title}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{ins.insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl bg-gray-900 border border-white/20 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <div>
                <h2 className="font-display font-semibold text-white text-lg">Add Daily Report</h2>
                <p className="text-xs text-gray-500 mt-1">Enter your restaurant's daily revenue and order data</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-400" />
                  Report Date
                </label>
                <input type="date" value={form.report_date} onChange={e => setForm(f => ({ ...f, report_date: e.target.value }))} className="input-field w-full" />
              </div>

              {/* Revenue */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-400" />
                  Revenue & Sales
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Total Sales (₹)</label>
                    <input type="number" value={form.total_sales} onChange={e => setForm(f => ({ ...f, total_sales: e.target.value }))} className="input-field text-sm py-2.5" placeholder="e.g. 50000" step="100" />
                    <p className="text-xs text-gray-600 mt-1">Total revenue from all orders</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Avg Order Value (₹)</label>
                    <input type="number" value={form.avg_order_value} onChange={e => setForm(f => ({ ...f, avg_order_value: e.target.value }))} className="input-field text-sm py-2.5" placeholder="e.g. 350" step="10" />
                    <p className="text-xs text-gray-600 mt-1">Average value per order</p>
                  </div>
                </div>
              </div>

              {/* Orders */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <ShoppingBag size={16} className="text-blue-400" />
                  Order Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Total Orders</label>
                    <input type="number" value={form.total_orders} onChange={e => setForm(f => ({ ...f, total_orders: e.target.value }))} className="input-field text-sm py-2.5" placeholder="e.g. 150" />
                  </div>
                  <div className="col-span-2 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Dine In</label>
                      <input type="number" value={form.dine_in_orders} onChange={e => setForm(f => ({ ...f, dine_in_orders: e.target.value }))} className="input-field text-sm py-2.5" placeholder="80" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Online</label>
                      <input type="number" value={form.online_orders} onChange={e => setForm(f => ({ ...f, online_orders: e.target.value }))} className="input-field text-sm py-2.5" placeholder="50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Takeaway</label>
                      <input type="number" value={form.takeaway_orders} onChange={e => setForm(f => ({ ...f, takeaway_orders: e.target.value }))} className="input-field text-sm py-2.5" placeholder="20" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Dine In + Online + Takeaway should equal Total Orders</p>
              </div>

              {/* Profit */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-amber-400" />
                  Profit Analysis
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Cost of Goods (₹)</label>
                    <input type="number" value={form.cost_of_goods} onChange={e => setForm(f => ({ ...f, cost_of_goods: e.target.value }))} className="input-field text-sm py-2.5" placeholder="e.g. 30000" step="100" />
                    <p className="text-xs text-gray-600 mt-1">Raw materials, ingredients cost</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Operating Expenses (₹)</label>
                    <input type="number" value={form.operating_expenses} onChange={e => setForm(f => ({ ...f, operating_expenses: e.target.value }))} className="input-field text-sm py-2.5" placeholder="e.g. 8000" step="100" />
                    <p className="text-xs text-gray-600 mt-1">Rent, salaries, utilities, etc.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Gross Profit (₹)</label>
                    <div className="input-field text-sm py-2.5 bg-gray-800/50 flex items-center text-gray-300 font-mono">
                      {grossProfit.toFixed(0)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Auto-calculated</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Net Profit (₹)</label>
                    <div className="input-field text-sm py-2.5 bg-gray-800/50 flex items-center text-gray-300 font-mono">
                      {netProfit.toFixed(0)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Auto-calculated</p>
                  </div>
                </div>
              </div>

              {/* Example */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs font-semibold text-blue-300 mb-2">Example Daily Report</p>
                <div className="text-xs text-blue-200/80 space-y-0.5 font-mono">
                  <div>Sales: ₹50,000 | Cost of Goods: ₹30,000 | Operating Expenses: ₹8,000</div>
                  <div>Gross Profit: ₹20,000 | Net Profit: ₹12,000</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-white/10 shrink-0">
              <button onClick={() => setShowForm(false)} className="btn-secondary py-2.5 px-5">Cancel</button>
              <button
                onClick={saveReport}
                disabled={saving || !form.total_sales || !form.total_orders}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                Save Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
