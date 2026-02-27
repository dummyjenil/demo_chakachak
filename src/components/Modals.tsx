import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Calendar, User, Phone, FileText, PartyPopper, Plus } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="relative w-full max-w-lg glass rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-white/10"
        >
          <div className="flex items-center justify-between px-10 pt-10 pb-6">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">{title}</h2>
            <button onClick={onClose} className="w-10 h-10 glass flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>
          <div className="px-10 pb-10 overflow-y-auto max-h-[75vh] custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const AddEventModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = React.useState({ client_name: '', client_phone: '', event_name: '' });
  const { clients, fetchClients, fetchEvents } = useAppStore();

  React.useEffect(() => {
    if (isOpen) fetchClients();
  }, [isOpen, fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createEvent(formData);
    fetchEvents();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Event">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Client Identity</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
            <input
              type="text"
              list="clients-list"
              value={formData.client_name}
              onChange={(e) => {
                const client = clients.find(c => c.name === e.target.value);
                setFormData({ 
                  ...formData, 
                  client_name: e.target.value,
                  client_phone: client ? client.phone : formData.client_phone 
                });
              }}
              className="w-full h-16 glass rounded-2xl pl-12 pr-4 text-white focus:border-primary transition-all placeholder:text-slate-700 font-bold"
              placeholder="Full Name"
              required
            />
            <datalist id="clients-list">
              {clients.map(c => <option key={c.id} value={c.name} />)}
            </datalist>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
            <input
              type="tel"
              value={formData.client_phone}
              onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
              className="w-full h-16 glass rounded-2xl pl-12 pr-4 text-white focus:border-primary transition-all placeholder:text-slate-700 font-bold"
              placeholder="+91 00000 00000"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Name</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
            <input
              type="text"
              value={formData.event_name}
              onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
              className="w-full h-16 glass rounded-2xl pl-12 pr-4 text-white focus:border-primary transition-all placeholder:text-slate-700 font-bold"
              placeholder="e.g. Grand Wedding 2024"
              required
            />
          </div>
        </div>

        <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]">
          Initialize Project
        </button>
      </form>
    </Modal>
  );
};

export const AddPaymentModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { events, fetchEvents, fetchStats, selectedEvent } = useAppStore();
  const [formData, setFormData] = React.useState({ event_id: '', amount: '', type: 'partial' });

  React.useEffect(() => {
    if (isOpen && selectedEvent?.id) {
      setFormData(prev => ({ ...prev, event_id: selectedEvent.id.toString() }));
    } else if (isOpen) {
      setFormData({ event_id: '', amount: '', type: 'partial' });
    }
  }, [isOpen, selectedEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createPayment(formData);
    fetchEvents();
    fetchStats();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Payment">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Event</label>
          <select
            value={formData.event_id}
            onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold appearance-none"
            required
          >
            <option value="" disabled>Select an event</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.name} ({e.client_name})</option>)}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount</label>
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary text-5xl font-black">₹</span>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full h-32 glass rounded-3xl pl-16 pr-6 text-6xl font-black text-white focus:border-primary transition-all placeholder:text-slate-800"
              placeholder="0"
              required
            />
          </div>
        </div>

        <button type="submit" className="w-full h-16 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all active:scale-[0.98]">
          Confirm Payment
        </button>
      </form>
    </Modal>
  );
};

export const AddExpenseModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { events, fetchStats } = useAppStore();
  const [formData, setFormData] = React.useState({ event_id: '', title: '', amount: '', category: 'other' });

  const commonExpenses = ['Petrol', 'Food', 'Damage', 'Labour', 'Flower', 'Transport'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createExpense(formData);
    fetchStats();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expense Title</label>
          <input
            type="text"
            list="expense-suggestions"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700"
            placeholder="e.g. Petrol, Food, Flowers"
            required
          />
          <datalist id="expense-suggestions">
            {commonExpenses.map(exp => <option key={exp} value={exp} />)}
          </datalist>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount</label>
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary text-5xl font-black">₹</span>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full h-32 glass rounded-3xl pl-16 pr-6 text-6xl font-black text-white focus:border-primary transition-all placeholder:text-slate-800"
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Link to Event (Optional)</label>
          <select
            value={formData.event_id}
            onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold appearance-none"
          >
            <option value="">General Expense</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        <button type="submit" className="w-full h-16 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-[1.02] transition-all active:scale-[0.98]">
          Record Expense
        </button>
      </form>
    </Modal>
  );
};

export const AddBonusModal: React.FC<{ isOpen: boolean; onClose: () => void; staffId: number; onAdded: () => void }> = ({ isOpen, onClose, staffId, onAdded }) => {
  const [formData, setFormData] = React.useState({ type: 'bonus', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  const types = [
    { id: 'bonus', label: 'Happy Bonus' },
    { id: 'advance', label: 'Advance Payment' },
    { id: 'full_night', label: 'Full Night Allowance' },
    { id: 'half_night', label: 'Half Night Allowance' },
    { id: 'petrol', label: 'Petrol Allowance' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createStaffLog({ ...formData, staff_id: staffId });
    onAdded();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Staff Adjustment">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Adjustment Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold appearance-none"
            required
          >
            {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount</label>
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary text-5xl font-black">₹</span>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full h-32 glass rounded-3xl pl-16 pr-6 text-6xl font-black text-white focus:border-primary transition-all placeholder:text-slate-800"
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700"
            placeholder="e.g. Performance Bonus"
          />
        </div>

        <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]">
          Apply Adjustment
        </button>
      </form>
    </Modal>
  );
};

export const AddStaffModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { fetchStaff } = useAppStore();
  const [formData, setFormData] = React.useState({ name: '', phone: '', per_day_rate: '', old_balance: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createStaff(formData);
    fetchStaff();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Staff">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700"
            placeholder="e.g. Rahul Kumar"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full h-16 glass rounded-2xl pl-12 pr-4 text-white focus:border-primary transition-all placeholder:text-slate-700 font-bold"
              placeholder="+91 00000 00000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Daily Rate</label>
            <input
              type="number"
              value={formData.per_day_rate}
              onChange={(e) => setFormData({ ...formData, per_day_rate: e.target.value })}
              className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700"
              placeholder="₹"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Opening Balance</label>
            <input
              type="number"
              value={formData.old_balance}
              onChange={(e) => setFormData({ ...formData, old_balance: e.target.value })}
              className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700"
              placeholder="₹"
            />
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Profile Photo</label>
          <div className="mt-4">
            <label className="relative flex flex-col items-center justify-center w-full h-40 rounded-[2rem] glass border-dashed cursor-pointer hover:bg-white/10 transition-all group overflow-hidden">
              <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                <Plus className="mb-2" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest">Upload Image</p>
              </div>
              <input type="file" className="hidden" />
            </label>
          </div>
        </div>

        <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]">
          Register Staff Member
        </button>
      </form>
    </Modal>
  );
};

export const AddSubEventModal: React.FC<{ isOpen: boolean; onClose: () => void; eventId: number; onAdded: () => void }> = ({ isOpen, onClose, eventId, onAdded }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    address: '',
    start_date: '',
    windup_date: '',
    payment_date: '',
    budget: '',
    description: '',
    worker_notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createSubEvent({ ...formData, event_id: eventId });
    onAdded();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Phase">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phase Title</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-14 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700"
            placeholder="e.g. Haldi Ceremony"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Venue Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full h-14 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700"
            placeholder="Complete address"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Start Date</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full h-14 glass rounded-2xl px-4 text-white focus:border-primary transition-all font-bold"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">End Date</label>
            <input
              type="date"
              value={formData.windup_date}
              onChange={(e) => setFormData({ ...formData, windup_date: e.target.value })}
              className="w-full h-14 glass rounded-2xl px-4 text-white focus:border-primary transition-all font-bold"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Due</label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              className="w-full h-14 glass rounded-2xl px-4 text-white focus:border-primary transition-all font-bold"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Budget (₹)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full h-14 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700"
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Worker Instructions</label>
          <textarea
            value={formData.worker_notes}
            onChange={(e) => setFormData({ ...formData, worker_notes: e.target.value })}
            className="w-full glass rounded-2xl p-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700 min-h-[120px]"
            placeholder="Detailed instructions for the team..."
          />
        </div>

        <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]">
          Create Phase
        </button>
      </form>
    </Modal>
  );
};

export const EditEventModal: React.FC<{ isOpen: boolean; onClose: () => void; event: any; onUpdated: () => void }> = ({ isOpen, onClose, event, onUpdated }) => {
  const [formData, setFormData] = React.useState({ name: '', total_budget: '' });

  React.useEffect(() => {
    if (isOpen && event) {
      setFormData({ name: event.name, total_budget: event.total_budget.toString() });
    }
  }, [isOpen, event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateEvent(event.id, formData);
    onUpdated();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Event">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Event Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
            required
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Budget</label>
          <input
            type="number"
            value={formData.total_budget}
            onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
            required
          />
        </div>
        <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest">
          Update Event
        </button>
      </form>
    </Modal>
  );
};

export const EditSubEventModal: React.FC<{ isOpen: boolean; onClose: () => void; subEvent: any; onUpdated: () => void }> = ({ isOpen, onClose, subEvent, onUpdated }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    address: '',
    start_date: '',
    windup_date: '',
    payment_date: '',
    budget: '',
    description: '',
    worker_notes: '',
    status: ''
  });

  React.useEffect(() => {
    if (isOpen && subEvent) {
      setFormData({
        name: subEvent.name,
        address: subEvent.address || '',
        start_date: subEvent.start_date || '',
        windup_date: subEvent.windup_date || '',
        payment_date: subEvent.payment_date || '',
        budget: subEvent.budget.toString(),
        description: subEvent.description || '',
        worker_notes: subEvent.worker_notes || '',
        status: subEvent.status || 'pending'
      });
    }
  }, [isOpen, subEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateSubEvent(subEvent.id, formData);
    onUpdated();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Phase">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phase Title</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-14 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
            required
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Venue Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full h-14 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Start Date</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full h-14 glass rounded-2xl px-4 text-white focus:border-primary transition-all font-bold"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">End Date</label>
            <input
              type="date"
              value={formData.windup_date}
              onChange={(e) => setFormData({ ...formData, windup_date: e.target.value })}
              className="w-full h-14 glass rounded-2xl px-4 text-white focus:border-primary transition-all font-bold"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Budget (₹)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full h-14 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full h-14 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold appearance-none"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Worker Instructions</label>
          <textarea
            value={formData.worker_notes}
            onChange={(e) => setFormData({ ...formData, worker_notes: e.target.value })}
            className="w-full glass rounded-2xl p-6 text-white focus:border-primary transition-all font-bold min-h-[120px]"
          />
        </div>
        <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest">
          Update Phase
        </button>
      </form>
    </Modal>
  );
};

export const EditStaffModal: React.FC<{ isOpen: boolean; onClose: () => void; staff: any; onUpdated: () => void }> = ({ isOpen, onClose, staff, onUpdated }) => {
  const [formData, setFormData] = React.useState({ name: '', phone: '', per_day_rate: '', old_balance: '' });

  React.useEffect(() => {
    if (isOpen && staff) {
      setFormData({
        name: staff.name,
        phone: staff.phone || '',
        per_day_rate: staff.per_day_rate.toString(),
        old_balance: staff.old_balance.toString()
      });
    }
  }, [isOpen, staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateStaff(staff.id, formData);
    onUpdated();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Staff">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
            required
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Daily Rate</label>
            <input
              type="number"
              value={formData.per_day_rate}
              onChange={(e) => setFormData({ ...formData, per_day_rate: e.target.value })}
              className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Opening Balance</label>
            <input
              type="number"
              value={formData.old_balance}
              onChange={(e) => setFormData({ ...formData, old_balance: e.target.value })}
              className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
            />
          </div>
        </div>
        <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest">
          Update Staff
        </button>
      </form>
    </Modal>
  );
};

export const EditClientModal: React.FC<{ isOpen: boolean; onClose: () => void; client: any; onUpdated: () => void }> = ({ isOpen, onClose, client, onUpdated }) => {
  const [formData, setFormData] = React.useState({ name: '', phone: '', notes: '' });

  React.useEffect(() => {
    if (isOpen && client) {
      setFormData({
        name: client.name,
        phone: client.phone,
        notes: client.notes || ''
      });
    }
  }, [isOpen, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateClient(client.id, formData);
    onUpdated();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Client">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
            required
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
            required
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full glass rounded-2xl p-6 text-white focus:border-primary transition-all font-bold min-h-[120px]"
          />
        </div>
        <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest">
          Update Client
        </button>
      </form>
    </Modal>
  );
};
