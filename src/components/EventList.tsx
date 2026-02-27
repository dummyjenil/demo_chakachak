import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore, Event } from '../store/appStore';
import { Search, Calendar, Filter, ChevronRight, PartyPopper, Plus, User } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export const EventList: React.FC = () => {
  const { events, fetchEvents } = useAppStore();
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                         e.client_name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'pending') return matchesSearch && (e.total_budget - (e.received_amount || 0)) > 0;
    if (filter === 'paid') return matchesSearch && (e.total_budget - (e.received_amount || 0)) <= 0;
    return matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tight uppercase">Event Registry</h1>
        <p className="text-slate-500 mt-2">Manage and track all decoration projects</p>
        
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 glass rounded-2xl pl-12 pr-4 text-white focus:border-primary transition-all placeholder:text-slate-600"
              placeholder="Search events or clients..."
            />
          </div>
          <div className="flex gap-2 p-1 glass rounded-2xl">
            {['all', 'pending', 'paid'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                  filter === f ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((event, i) => {
          const pending = event.total_budget - (event.received_amount || 0);
          const progress = event.total_budget > 0 ? (event.received_amount / event.total_budget) * 100 : 0;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/events/${event.id}`)}
              className="glass glass-hover p-8 rounded-[2rem] cursor-pointer group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                  <Calendar size={24} />
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  pending <= 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                  {pending <= 0 ? 'Settled' : 'Pending'}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors leading-tight mb-2">{event.name}</h3>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/clients/${event.client_id}`);
                  }}
                  className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <User size={12} /> {event.client_name}
                </button>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Received</p>
                    <p className="text-xl font-black text-white">{formatCurrency(event.received_amount || 0)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</p>
                    <p className="text-sm font-bold text-slate-400">{formatCurrency(event.total_budget)}</p>
                  </div>
                </div>

                <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={cn("absolute inset-y-0 left-0 rounded-full", progress >= 100 ? "bg-emerald-500" : "bg-primary")}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
        {filteredEvents.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-[2rem]">
            <p className="text-slate-500 font-bold uppercase tracking-widest">No events found</p>
          </div>
        )}
      </main>
    </div>
  );
};
