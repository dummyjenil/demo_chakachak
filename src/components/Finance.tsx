import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { ArrowUpCircle, ArrowDownCircle, Search, Filter, Calendar } from 'lucide-react';
import { formatCurrency, cn, formatDate } from '../lib/utils';
import { api } from '../services/api';

export const Finance: React.FC = () => {
  const { stats, fetchStats, fetchLogs, logs } = useAppStore();
  const [search, setSearch] = React.useState('');
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
  const [filterCategory, setFilterCategory] = React.useState('ALL');

  React.useEffect(() => {
    fetchStats();
    fetchLogs();
  }, [fetchStats, fetchLogs]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.log_data || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || log.category === filterCategory;
    const logDate = new Date(log.created_at).getTime();
    const start = dateRange.start ? new Date(dateRange.start).getTime() : 0;
    const end = dateRange.end ? new Date(dateRange.end).getTime() : Infinity;
    return matchesSearch && matchesCategory && logDate >= start && logDate <= end;
  });

  const categories = ['ALL', ...new Set((logs || []).map(l => l.category))];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tight uppercase">Business Activity Log</h1>
        <p className="text-slate-500 mt-2">Comprehensive audit trail of all financial and operational events</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="glass p-8 rounded-[2rem] border-emerald-500/20">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Revenue</p>
          <h3 className="text-4xl font-black text-emerald-400">{formatCurrency(stats?.total_revenue || 0)}</h3>
        </div>
        <div className="glass p-8 rounded-[2rem] border-red-500/20">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Expenses</p>
          <h3 className="text-4xl font-black text-red-400">{formatCurrency(stats?.total_expenses || 0)}</h3>
        </div>
        <div className="glass p-8 rounded-[2rem] border-primary/20 bg-primary/5">
          <p className="text-primary/60 text-[10px] font-black uppercase tracking-widest mb-2">Net Profit</p>
          <h3 className="text-4xl font-black text-white">{formatCurrency((stats?.total_revenue || 0) - (stats?.total_expenses || 0))}</h3>
        </div>
      </section>

      <main className="space-y-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">Activity Feed</h2>
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-12 glass rounded-2xl pl-12 pr-4 text-sm text-white focus:border-primary transition-all placeholder:text-slate-600"
                />
              </div>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="h-12 glass rounded-2xl px-4 text-xs font-bold uppercase tracking-widest text-white focus:border-primary transition-all"
                />
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="h-12 glass rounded-2xl px-4 text-xs font-bold uppercase tracking-widest text-white focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {(categories || []).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  filterCategory === cat ? "bg-primary text-white" : "glass text-slate-500 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {(filteredLogs || []).map((log, i) => (
            <motion.div 
              key={log.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="glass p-6 rounded-2xl flex items-center justify-between group"
            >
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110",
                  log.category.includes('PAYMENT') || log.category.includes('INCOME') ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : 
                  log.category.includes('EXPENSE') || log.category.includes('SALARY') ? "bg-red-500/10 border-red-500/20 text-red-400" :
                  "bg-primary/10 border-primary/20 text-primary"
                )}>
                  {log.category.includes('PAYMENT') || log.category.includes('INCOME') ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-white">{log.log_data}</h4>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    {formatDate(log.created_at)} • <span className="text-primary">{log.category}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="py-20 text-center glass rounded-[2rem]">
              <p className="text-slate-500 font-bold uppercase tracking-widest">No activities found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
