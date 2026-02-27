import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Calendar, FileText, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { useAppStore } from '../store/appStore';

export const ClientDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setActiveModal } = useAppStore();
  const [client, setClient] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchClientDetails = React.useCallback(async () => {
    try {
      const data = await api.fetchClientDetails(id!);
      setClient(data);
    } catch (error) {
      console.error('Error fetching client details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this client? All associated events will also be affected.')) {
      await api.deleteClient(Number(id));
      navigate('/events');
    }
  };

  React.useEffect(() => {
    fetchClientDetails();
    window.addEventListener('client-updated', fetchClientDetails);
    return () => window.removeEventListener('client-updated', fetchClientDetails);
  }, [fetchClientDetails]);

  if (loading) return <div className="p-10 text-slate-400">Loading Client Details...</div>;
  if (!client) return <div className="p-10 text-slate-400">Client not found.</div>;

  return (
    <main className="min-h-screen pb-32">
      <header className="flex items-center justify-between px-6 lg:px-10 py-8">
        <button 
          onClick={() => navigate('/events')}
          className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 glass flex items-center justify-center rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Back</span>
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveModal('edit_client', client)}
            className="w-12 h-12 glass flex items-center justify-center rounded-xl text-primary hover:bg-primary hover:text-white transition-all"
          >
            <Edit size={20} />
          </button>
          <button 
            onClick={handleDelete}
            className="w-12 h-12 glass flex items-center justify-center rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <section className="px-6 lg:px-10 mb-16">
        <div className="glass p-12 rounded-[3rem] border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative flex flex-col md:flex-row gap-12 items-start md:items-center">
            <div className="w-32 h-32 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-5xl font-black border border-primary/20 text-primary">
              {client.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="glass px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white/80 flex items-center gap-2">
                  <User size={12} />
                  Client Profile
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-none mb-6">{client.name}</h1>
              <div className="flex flex-wrap items-center gap-12">
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Phone size={12} /> Mobile
                  </p>
                  <p className="text-2xl font-black text-white">{client.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Calendar size={12} /> Total Events
                  </p>
                  <p className="text-2xl font-black text-white">{client.events.length}</p>
                </div>
              </div>
            </div>
          </div>
          {client.notes && (
            <div className="mt-12 pt-12 border-t border-white/5">
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4">Client Notes</p>
              <p className="text-slate-300 leading-relaxed max-w-3xl">{client.notes}</p>
            </div>
          )}
        </div>
      </section>

      <section className="px-6 lg:px-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <FileText size={20} />
            </div>
            Event History
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(client.events || []).map((event: any, i: number) => {
            const pending = event.total_budget - (event.received_amount || 0);
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/events/${event.id}`)}
                className="glass glass-hover p-8 rounded-[2rem] cursor-pointer group"
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
                <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors leading-tight mb-4">{event.name}</h3>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Budget</p>
                    <p className="text-lg font-black text-white">{formatCurrency(event.total_budget)}</p>
                  </div>
                  <div className="w-10 h-10 glass flex items-center justify-center rounded-xl text-slate-500 group-hover:text-primary transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
