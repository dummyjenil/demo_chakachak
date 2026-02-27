import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Calendar, User, Phone, FileText, PartyPopper, Plus, Trash2 } from 'lucide-react';
import Select from 'react-select';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';
import { cn } from '../lib/utils';

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

const selectStyles = {
  control: (base: any) => ({
    ...base,
    background: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    minHeight: '4rem',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'rgba(255, 255, 255, 0.2)'
    }
  }),
  menu: (base: any) => ({
    ...base,
    background: '#1a1a1a',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    zIndex: 100
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    color: '#fff',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)'
    }
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#fff',
    fontWeight: 'bold'
  }),
  input: (base: any) => ({
    ...base,
    color: '#fff'
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#475569'
  })
};

export const AddEventModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = React.useState({ client_id: '', client_name: '', client_phone: '', event_name: '', total_budget: '', advance_payment_amt: '', payment_date: '' });
  const { clients, fetchClients, fetchEvents } = useAppStore();

  React.useEffect(() => {
    if (isOpen) fetchClients();
  }, [isOpen, fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createEvent({
      ...formData,
      total_budget: Number(formData.total_budget),
      advance_payment_amt: Number(formData.advance_payment_amt)
    });
    fetchEvents();
    onClose();
  };

  const clientOptions = (clients || []).map(c => ({ value: c.id.toString(), label: `${c.name} (${c.mobile_num})`, client: c }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Event">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select or Create Client</label>
          <Select
            options={clientOptions}
            styles={selectStyles}
            placeholder="Search clients..."
            isClearable
            onChange={(option: any) => {
              if (option) {
                setFormData({ ...formData, client_id: option.value, client_name: option.client.name, client_phone: option.client.mobile_num });
              } else {
                setFormData({ ...formData, client_id: '', client_name: '', client_phone: '' });
              }
            }}
          />
        </div>

        {!formData.client_id && (
          <>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Client Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full h-16 glass rounded-2xl pl-12 pr-4 text-white focus:border-primary transition-all placeholder:text-slate-700 font-bold"
                  placeholder="Full Name"
                  required={!formData.client_id}
                />
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
                  required={!formData.client_id}
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Event Name</label>
          <div className="relative">
            <PartyPopper className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
            <input
              type="text"
              value={formData.event_name}
              onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
              className="w-full h-16 glass rounded-2xl pl-12 pr-4 text-white focus:border-primary transition-all placeholder:text-slate-700 font-bold"
              placeholder="e.g. Rahul & Priya Wedding"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Budget</label>
            <input
              type="number"
              value={formData.total_budget}
              onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
              className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all placeholder:text-slate-700 font-bold"
              placeholder="0"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Advance Received</label>
            <input
              type="number"
              value={formData.advance_payment_amt}
              onChange={(e) => setFormData({ ...formData, advance_payment_amt: e.target.value })}
              className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all placeholder:text-slate-700 font-bold"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Due Date</label>
          <input
            type="date"
            value={formData.payment_date}
            onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
            required
          />
        </div>

        <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]">
          Create Event
        </button>
      </form>
    </Modal>
  );
};

export const AddPaymentModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { events, fetchEvents, fetchStats, selectedEvent } = useAppStore();
  const [formData, setFormData] = React.useState({ event_id: '', amount: '', type: 'partial', date: '' });

  React.useEffect(() => {
    if (isOpen && selectedEvent?.id) {
      setFormData(prev => ({ ...prev, event_id: selectedEvent.id.toString() }));
    } else if (isOpen) {
      setFormData({ event_id: '', amount: '', type: 'partial', date: new Date().toISOString().split('T')[0] });
    }
  }, [isOpen, selectedEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createPayment({
      ...formData,
      event_id: Number(formData.event_id),
      amount: Number(formData.amount)
    });
    fetchEvents();
    fetchStats();
    onClose();
  };

  const eventOptions = (events || []).map(e => ({ value: e.id.toString(), label: `${e.name} (${e.client_name})` }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Payment">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Event</label>
          <Select
            options={eventOptions}
            styles={selectStyles}
            placeholder="Search events..."
            value={eventOptions.find(o => o.value === formData.event_id)}
            onChange={(option: any) => setFormData({ ...formData, event_id: option ? option.value : '' })}
          />
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
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'partial' })}
              className={cn(
                "h-14 rounded-2xl font-bold transition-all",
                formData.type === 'partial' ? "bg-primary text-white" : "glass text-slate-400"
              )}
            >
              Advance
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'full' })}
              className={cn(
                "h-14 rounded-2xl font-bold transition-all",
                formData.type === 'full' ? "bg-emerald-500 text-white" : "glass text-slate-400"
              )}
            >
              Full Payment
            </button>
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
  const { events, fetchStats, fetchExpenses, expenseCategories, fetchExpenseCategories } = useAppStore();
  const [formData, setFormData] = React.useState({ event_id: '', title: '', amount: '', category_id: '', date: new Date().toISOString().split('T')[0] });

  React.useEffect(() => {
    if (isOpen) fetchExpenseCategories();
  }, [isOpen, fetchExpenseCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createExpense({
      ...formData,
      amount: Number(formData.amount),
      category_id: formData.category_id ? Number(formData.category_id) : undefined
    });
    fetchExpenses();
    fetchStats();
    onClose();
  };

  const categoryOptions = (expenseCategories || []).map(c => ({ value: c.id.toString(), label: c.name }));
  const eventOptions = (events || []).map(e => ({ value: e.id.toString(), label: e.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expense Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700"
            placeholder="e.g. Petrol, Food, Flowers"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
          <Select
            options={categoryOptions}
            styles={selectStyles}
            placeholder="Select category..."
            isClearable
            onChange={(option: any) => setFormData({ ...formData, category_id: option ? option.value : '' })}
          />
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
          <Select
            options={eventOptions}
            styles={selectStyles}
            placeholder="General Expense"
            isClearable
            onChange={(option: any) => setFormData({ ...formData, event_id: option ? option.value : '' })}
          />
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
    await api.addStaffBalance(
      staffId,
      Number(formData.amount),
      formData.type,
      formData.description
    );
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
  const [formData, setFormData] = React.useState({ name: '', mobile_num: '', rate: '', deposit_amount: '', notes: '', document_links: [] as string[] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createStaff({
      ...formData,
      rate: Number(formData.rate),
      deposit_amount: Number(formData.deposit_amount)
    });
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
              value={formData.mobile_num}
              onChange={(e) => setFormData({ ...formData, mobile_num: e.target.value })}
              className="w-full h-16 glass rounded-2xl pl-12 pr-4 text-white focus:border-primary transition-all placeholder:text-slate-700 font-bold"
              placeholder="+91 00000 00000"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Daily Rate</label>
            <input
              type="number"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700"
              placeholder="₹"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Opening Balance</label>
            <input
              type="number"
              value={formData.deposit_amount}
              onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
              className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700"
              placeholder="₹"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full glass rounded-2xl p-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700 min-h-[100px]"
            placeholder="Additional details..."
          />
        </div>

        <div className="pt-8 border-t border-white/5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Documents (Links)</label>
          <div className="mt-4 space-y-4">
            {formData.document_links.map((link, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={link}
                  readOnly
                  className="flex-1 h-12 glass rounded-xl px-4 text-white text-sm"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, document_links: formData.document_links.filter((_, i) => i !== idx) })}
                  className="w-12 h-12 glass flex items-center justify-center text-red-500 rounded-xl"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                id="new-doc-link"
                placeholder="Paste document URL..."
                className="flex-1 h-12 glass rounded-xl px-4 text-white text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value;
                    if (val) {
                      setFormData({ ...formData, document_links: [...formData.document_links, val] });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('new-doc-link') as HTMLInputElement;
                  if (input.value) {
                    setFormData({ ...formData, document_links: [...formData.document_links, input.value] });
                    input.value = '';
                  }
                }}
                className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-xl"
              >
                <Plus size={16} />
              </button>
            </div>
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

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Worker Instructions</label>
          <textarea
            value={formData.worker_notes}
            onChange={(e) => setFormData({ ...formData, worker_notes: e.target.value })}
            className="w-full glass rounded-2xl p-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700 min-h-[120px]"
            placeholder="Detailed instructions for the team..."
          />
        </div>

        <button type="submit" className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]">
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
    await api.updateEvent(event.id, {
      ...formData,
      total_budget: Number(formData.total_budget)
    });
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
  const [formData, setFormData] = React.useState({ name: '', mobile_num: '', rate: '', deposit_amount: '', notes: '', document_links: [] as string[] });

  React.useEffect(() => {
    if (isOpen && staff) {
      setFormData({
        name: staff.name,
        mobile_num: staff.mobile_num || '',
        rate: staff.rate.toString(),
        deposit_amount: (staff.deposit_amount || 0).toString(),
        notes: staff.notes || '',
        document_links: staff.document_links || []
      });
    }
  }, [isOpen, staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateStaff(staff.id, {
      ...formData,
      rate: Number(formData.rate),
      deposit_amount: Number(formData.deposit_amount)
    });
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
            value={formData.mobile_num}
            onChange={(e) => setFormData({ ...formData, mobile_num: e.target.value })}
            className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Daily Rate</label>
            <input
              type="number"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Balance</label>
            <input
              type="number"
              value={formData.deposit_amount}
              onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
              className="w-full h-16 glass rounded-2xl px-6 text-white focus:border-primary transition-all font-bold"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full glass rounded-2xl p-6 text-white focus:border-primary transition-all font-bold placeholder:text-slate-700 min-h-[100px]"
            placeholder="Additional details..."
          />
        </div>

        <div className="pt-8 border-t border-white/5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Documents (Links)</label>
          <div className="mt-4 space-y-4">
            {formData.document_links.map((link, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={link}
                  readOnly
                  className="flex-1 h-12 glass rounded-xl px-4 text-white text-sm"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, document_links: formData.document_links.filter((_, i) => i !== idx) })}
                  className="w-12 h-12 glass flex items-center justify-center text-red-500 rounded-xl"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                id="edit-doc-link"
                placeholder="Paste document URL..."
                className="flex-1 h-12 glass rounded-xl px-4 text-white text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value;
                    if (val) {
                      setFormData({ ...formData, document_links: [...formData.document_links, val] });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('edit-doc-link') as HTMLInputElement;
                  if (input.value) {
                    setFormData({ ...formData, document_links: [...formData.document_links, input.value] });
                    input.value = '';
                  }
                }}
                className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-xl"
              >
                <Plus size={16} />
              </button>
            </div>
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
  const [formData, setFormData] = React.useState({ name: '', mobile_num: '', notes: '' });

  React.useEffect(() => {
    if (isOpen && client) {
      setFormData({
        name: client.name,
        mobile_num: client.mobile_num || '',
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
            value={formData.mobile_num}
            onChange={(e) => setFormData({ ...formData, mobile_num: e.target.value })}
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
