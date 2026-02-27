import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Share2, Edit, Plus, Calendar, MapPin, FileText, ChevronDown, ChevronUp, PartyPopper, User, Phone, CreditCard, Trash2 } from 'lucide-react';
import { useAppStore, SubEvent } from '../store/appStore';
import { formatCurrency, cn, formatDate } from '../lib/utils';
import { AddSubEventModal } from './Modals';
import { api } from '../services/api';

export const EventDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setActiveModal } = useAppStore();
  const [event, setEvent] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [expandedSubEvent, setExpandedSubEvent] = React.useState<number | null>(null);
  const [isAddPhaseOpen, setIsAddPhaseOpen] = React.useState(false);

  const fetchEventDetails = React.useCallback(async () => {
    try {
      const data = await api.fetchEventDetails(id!);
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleDeleteEvent = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      await api.deleteEvent(Number(id));
      navigate('/events');
    }
  };

  const handleDeletePhase = async (phaseId: number) => {
    if (window.confirm('Are you sure you want to delete this phase?')) {
      await api.deleteSubEvent(phaseId);
      fetchEventDetails();
    }
  };

  React.useEffect(() => {
    fetchEventDetails();
    window.addEventListener('event-updated', fetchEventDetails);
    return () => window.removeEventListener('event-updated', fetchEventDetails);
  }, [fetchEventDetails]);

  if (loading) return <div className="p-10 text-slate-400">Loading Event Details...</div>;
  if (!event) return <div className="p-10 text-slate-400">Event not found.</div>;

  const pending = event.total_budget - (event.received_amount || 0);

  const handleDownloadPDF = () => {
    window.open(api.getEventPdfUrl(id!), '_blank');
  };

  const handleShareWhatsApp = (sub: SubEvent) => {
    const text = `*Worker Notes for ${sub.name}*\n\n*Venue:* ${sub.address}\n*Date:* ${formatDate(sub.start_date)}\n\n*Instructions:*\n${sub.worker_notes || 'No specific instructions.'}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

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
          <span className="text-xs font-black uppercase tracking-widest">Back to Registry</span>
        </button>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleDownloadPDF}
            className="w-12 h-12 glass flex items-center justify-center rounded-xl text-slate-400 hover:text-white transition-all"
          >
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => setActiveModal('edit_event', event)}
            className="w-12 h-12 glass flex items-center justify-center rounded-xl text-primary hover:bg-primary hover:text-white transition-all"
          >
            <Edit size={20} />
          </button>
          <button 
            onClick={handleDeleteEvent}
            className="w-12 h-12 glass flex items-center justify-center rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <section className="px-6 lg:px-10 mb-16">
        <div className="relative w-full h-[400px] rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-emerald-500 opacity-80" />
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/wedding/1920/1080')] bg-cover bg-center mix-blend-overlay opacity-40" />
          <div className="relative h-full flex flex-col justify-end p-12 lg:p-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            <div className="flex items-center gap-4 mb-4">
              <span className="glass px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white/80 flex items-center gap-2">
                <Calendar size={12} />
                {formatDate(event.created_at)}
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Active
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-none">{event.name}</h1>
            <div className="flex items-center gap-8 mt-8">
              <Link to={`/clients/${event.client_id}`} className="group/client">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1 group-hover/client:text-primary transition-colors">Client</p>
                <p className="text-xl font-black text-white group-hover/client:text-primary transition-colors">{event.client_name}</p>
              </Link>
              <div className="w-[1px] h-10 bg-white/20" />
              <div>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Phone</p>
                <p className="text-xl font-black text-white">{event.client_phone}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-6 lg:px-10 grid grid-cols-12 gap-12">
        <section className="col-span-12 lg:col-span-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-8 rounded-[2rem] border-primary/20">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Budget</p>
              <h3 className="text-4xl font-black text-white">{formatCurrency(event.total_budget)}</h3>
            </div>
            <div className="glass p-8 rounded-[2rem] border-emerald-500/20">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Settled Amount</p>
              <h3 className="text-4xl font-black text-emerald-400">{formatCurrency(event.received_amount || 0)}</h3>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <FileText size={20} />
                </div>
                Phase Breakdown
              </h2>
              <button 
                onClick={() => setIsAddPhaseOpen(true)}
                className="glass glass-hover px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2"
              >
                <Plus size={16} /> Add Phase
              </button>
            </div>

            <div className="space-y-4">
              {(event.subEvents || []).map((sub: SubEvent) => (
                <motion.div
                  key={sub.id}
                  layout
                  className="glass rounded-[2rem] overflow-hidden group"
                >
                  <div 
                    onClick={() => setExpandedSubEvent(expandedSubEvent === sub.id ? null : sub.id)}
                    className="p-8 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                        <PartyPopper size={32} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-white">{sub.name}</h4>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{formatDate(sub.start_date)} • {sub.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Budget</p>
                        <p className="text-lg font-black text-white">{formatCurrency(sub.budget)}</p>
                      </div>
                      <div className="w-10 h-10 glass flex items-center justify-center rounded-xl">
                        {expandedSubEvent === sub.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModal('edit_sub_event', sub);
                        }}
                        className="w-10 h-10 glass flex items-center justify-center rounded-xl text-primary hover:bg-primary hover:text-white transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhase(sub.id);
                        }}
                        className="w-10 h-10 glass flex items-center justify-center rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedSubEvent === sub.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5"
                      >
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-8">
                            <div>
                              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MapPin size={14} /> Venue Details
                              </h5>
                              <div className="glass p-6 rounded-2xl">
                                <p className="text-sm font-medium leading-relaxed text-slate-300">{sub.address}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Timeline</h5>
                                <div className="glass p-4 rounded-2xl">
                                  <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Start</p>
                                  <p className="text-sm font-black text-white">{formatDate(sub.start_date)}</p>
                                </div>
                              </div>
                              <div>
                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 opacity-0">.</h5>
                                <div className="glass p-4 rounded-2xl">
                                  <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Wind-up</p>
                                  <p className="text-sm font-black text-white">{formatDate(sub.windup_date)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <FileText size={14} /> Worker Instructions
                            </h5>
                            <div className="glass p-8 rounded-2xl min-h-[200px] flex flex-col">
                              <p className="text-sm text-slate-300 leading-relaxed flex-1 whitespace-pre-wrap">{sub.worker_notes || 'No specific instructions for workers.'}</p>
                              <button 
                                onClick={() => handleShareWhatsApp(sub)}
                                className="mt-8 w-full py-4 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                              >
                                Share via WhatsApp
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-4 space-y-8">
          <div className="glass p-8 rounded-[2rem] border-primary/20 sticky top-8">
            <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
              <User className="text-primary" size={24} />
              Client Profile
            </h3>
            <div className="flex items-center gap-6 mb-8">
              <Link to={`/clients/${event.client_id}`} className="w-20 h-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-3xl font-black border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all">
                {event.client_name.charAt(0)}
              </Link>
              <Link to={`/clients/${event.client_id}`}>
                <p className="text-2xl font-black text-white hover:text-primary transition-colors">{event.client_name}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{event.client_phone}</p>
              </Link>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => window.location.href = `tel:${event.client_phone}`}
                className="w-full py-5 glass glass-hover text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
              >
                <Phone size={18} /> Call Client
              </button>
              <button 
                onClick={() => setActiveModal('payment', Number(id))}
                className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
              >
                <CreditCard size={18} /> Add Payment
              </button>
            </div>
          </div>
        </aside>
      </div>

      <AddSubEventModal 
        isOpen={isAddPhaseOpen} 
        onClose={() => setIsAddPhaseOpen(false)} 
        eventId={Number(id)} 
        onAdded={fetchEventDetails} 
      />
    </main>
  );
};

// End of file

