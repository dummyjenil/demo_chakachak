import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { ArrowUpCircle, ArrowDownCircle, Search, Filter, Calendar } from 'lucide-react';
import { formatCurrency, cn, formatDate } from '../lib/utils';
import { api } from '../services/api';

export const Finance: React.FC = () => {
  const { stats, fetchStats, events, fetchEvents } = useAppStore();
  const [expenses, setExpenses] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState('');
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });

  const fetchExpenses = React.useCallback(async () => {
    const data = await api.fetchExpenses();
    setExpenses(data);
  }, []);

  React.useEffect(() => {
    fetchStats();
    fetchExpenses();
    fetchEvents();
  }, [fetchStats, fetchExpenses, fetchEvents]);

  const allTransactions = [
    ...expenses.map(e => ({ ...e, type: 'expense' })),
    ...events.flatMap(e => (e.payments || []).map((p: any) => ({ ...p, type: 'payment', event_name: e.name })))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTransactions = allTransactions.filter(t => {
    const matchesSearch = (t.title || t.event_name || '').toLowerCase().includes(search.toLowerCase());
    const tDate = new Date(t.date).getTime();
    const start = dateRange.start ? new Date(dateRange.start).getTime() : 0;
    const end = dateRange.end ? new Date(dateRange.end).getTime() : Infinity;
    return matchesSearch && tDate >= start && tDate <= end;
  });

  const totalIncome = events.reduce((acc, e) => acc + (e.received_amount || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tight uppercase">Financial Ledger</h1>
        <p className="text-slate-500 mt-2">Track income, expenses, and cash flow</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="glass p-8 rounded-[2rem] border-emerald-500/20">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Revenue</p>
          <h3 className="text-4xl font-black text-emerald-400">{formatCurrency(totalIncome)}</h3>
        </div>
        <div className="glass p-8 rounded-[2rem] border-red-500/20">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Expenses</p>
          <h3 className="text-4xl font-black text-red-400">{formatCurrency(totalExpenses)}</h3>
        </div>
        <div className="glass p-8 rounded-[2rem] border-primary/20 bg-primary/5">
          <p className="text-primary/60 text-[10px] font-black uppercase tracking-widest mb-2">Net Balance</p>
          <h3 className="text-4xl font-black text-white">{formatCurrency(totalIncome - totalExpenses)}</h3>
        </div>
      </section>

      <main className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">Transactions</h2>
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

        <div className="space-y-4">
          {filteredTransactions.map((t, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass glass-hover p-6 rounded-2xl flex items-center justify-between group"
            >
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110",
                  t.type === 'payment' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                  {t.type === 'payment' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">{t.title || t.event_name}</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{formatDate(t.date)} • {t.type === 'payment' ? 'Income' : 'Expense'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-xl font-black",
                  t.type === 'payment' ? "text-emerald-400" : "text-red-400"
                )}>
                  {t.type === 'payment' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">
                  {t.type}
                </span>
              </div>
            </motion.div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="py-20 text-center glass rounded-[2rem]">
              <p className="text-slate-500 font-bold uppercase tracking-widest">No transactions found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
