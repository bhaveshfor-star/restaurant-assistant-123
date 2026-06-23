import { useState } from 'react';
import { Plus, DollarSign, ShoppingBag, TrendingUp, Calendar, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddReportModal({ isOpen, onClose, onSuccess }: AddReportModalProps) {
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

  const totalSales = parseFloat(form.total_sales) || 0;
  const costOfGoods = parseFloat(form.cost_of_goods) || 0;
  const operatingExpenses = parseFloat(form.operating_expenses) || 0;
  const grossProfit = totalSales - costOfGoods;
  const netProfit = grossProfit - operatingExpenses;

  async function saveReport() {
    setSaving(true);
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
    const { error } = await supabase.from('profit_reports').insert(reportData);
    if (!error) {
      setForm({
        report_date: new Date().toISOString().split('T')[0],
        total_sales: '', total_orders: '', avg_order_value: '',
        cost_of_goods: '', operating_expenses: '',
        online_orders: '', dine_in_orders: '', takeaway_orders: '',
      });
      onSuccess();
      onClose();
    }
    setSaving(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-gray-900 border border-white/20 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div>
            <h2 className="font-display font-semibold text-white text-lg">Add Daily Report</h2>
            <p className="text-xs text-gray-500 mt-1">Enter your restaurant's daily revenue and order data</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
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
          <button onClick={onClose} className="btn-secondary py-2.5 px-5">Cancel</button>
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
  );
}
