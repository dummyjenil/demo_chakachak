import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { Wallet, TrendingUp, PartyPopper, Badge, ReceiptText, ShoppingCart, CreditCard, Users, Calendar, Plus, ArrowRight } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const { stats, fetchStats } = useAppStore();

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!stats) return <div className="p-10 text-slate-400">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
      <header className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
            Chakachak<br />
            <span className="text-primary">Decoration</span>
          </h1>
          <div className="flex items-center gap-4 pt-4">
            <div className="h-[1px] w-12 bg-white/20" />
            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Internal OS • v2.0</p>
          </div>
        </motion.div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-[2rem] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={80} />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Pending Dues</p>
          <h3 className="text-4xl font-black text-white">{formatCurrency(stats.totalPending)}</h3>
          <div className="mt-6 flex items-center gap-2 text-emerald-500 text-xs font-bold">
            <TrendingUp size={14} />
            <span>+12% from last month</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-[2rem] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <PartyPopper size={80} />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Live Events</p>
          <h3 className="text-4xl font-black text-white">{stats.activeEvents}</h3>
          <div className="mt-6 flex items-center gap-2 text-primary text-xs font-bold">
            <Calendar size={14} />
            <span>4 starting this week</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-8 rounded-[2rem] relative overflow-hidden group bg-primary/5 border-primary/20"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={80} />
          </div>
          <p className="text-primary/60 text-xs font-bold uppercase tracking-widest mb-2">Staff Online</p>
          <h3 className="text-4xl font-black text-white">12</h3>
          <div className="mt-6 flex items-center gap-2 text-emerald-500 text-xs font-bold">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All systems active</span>
          </div>
        </motion.div>
      </section>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tight">Recent Activity</h2>
            <button className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">View Archive</button>
          </div>
          <div className="space-y-4">
            {(stats.recentActivity || []).map((activity: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="glass glass-hover p-6 rounded-2xl flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110",
                    activity.type === 'event' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  )}>
                    {activity.type === 'event' ? <PartyPopper size={24} /> : <CreditCard size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white">{activity.title}</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{new Date(activity.date).toLocaleDateString()} • {activity.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-white">{formatCurrency(activity.amount)}</p>
                  <span className={cn(
                    "text-[10px] uppercase tracking-widest font-black",
                    activity.type === 'event' ? "text-slate-500" : "text-emerald-500"
                  )}>
                    {activity.type === 'event' ? 'Budget' : 'Received'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="glass glass-hover p-6 rounded-2xl flex flex-col items-center gap-3 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                  <Calendar size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">New Event</span>
              </button>
              <button className="glass glass-hover p-6 rounded-2xl flex flex-col items-center gap-3 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <CreditCard size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Payment</span>
              </button>
            </div>
          </div>

          <div className="glass p-8 rounded-[2rem] border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <h4 className="text-lg font-black uppercase tracking-tight mb-2">System Status</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">All systems operational. Cloud sync active.</p>
            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
