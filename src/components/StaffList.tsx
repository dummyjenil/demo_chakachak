import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { User, Phone, Wallet, Calendar, Plus, CheckCircle, XCircle, PartyPopper, RefreshCw, Power, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { AddBonusModal } from './Modals';
import { api } from '../services/api';

export const StaffList: React.FC = () => {
  const { staff, fetchStaff, setActiveModal } = useAppStore();
  const [selectedStaffId, setSelectedStaffId] = React.useState<number | null>(null);
  const [isBonusModalOpen, setIsBonusModalOpen] = React.useState(false);

  React.useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await api.updateStaffStatus(id, newStatus);
    fetchStaff();
  };

  const handleReset = async (id: number, currentBalance: number) => {
    if (window.confirm(`Are you sure you want to reset this staff profile? This will log a salary payment of ${formatCurrency(currentBalance)}.`)) {
      await api.resetStaff(id, currentBalance);
      fetchStaff();
    }
  };

  const handleDeleteStaff = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      await api.deleteStaff(id);
      fetchStaff();
    }
  };

  const handleAddAttendance = async (id: number, rate: number) => {
    await api.addStaffBalance(id, rate, 'attendance', 'Daily Attendance');
    fetchStaff();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tight uppercase">Staff Directory</h1>
        <p className="text-slate-500 mt-2">Manage payroll, attendance, and performance</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(staff || []).map((member, i) => {
          const pending = member.deposit_amount || 0;

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-8 rounded-[2rem] relative overflow-hidden group"
            >
              <div className="absolute top-6 right-6 flex gap-2">
                <button 
                  onClick={() => handleToggleStatus(member.id, member.status)}
                  className={cn(
                    "p-2 rounded-xl border transition-all",
                    member.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                  )}
                >
                  <Power size={16} />
                </button>
                <button 
                  onClick={() => setActiveModal('edit_staff', member)}
                  className="p-2 rounded-xl glass text-primary hover:text-white transition-all"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleReset(member.id, pending)}
                  className="p-2 rounded-xl glass text-slate-400 hover:text-white transition-all"
                >
                  <RefreshCw size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteStaff(member.id, member.name)}
                  className="p-2 rounded-xl glass text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden group-hover:scale-105 transition-transform">
                    {member.document_links && member.document_links.length > 0 ? (
                      <img src={member.document_links[0]} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-primary" size={40} />
                    )}
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-surface",
                    member.status === 'ACTIVE' ? "bg-emerald-500" : "bg-red-500"
                  )} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white leading-tight">{member.name}</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                    <Phone size={12} /> {member.mobile_num || 'No phone'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="glass p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Daily Rate</p>
                  <p className="text-xl font-black text-white">{formatCurrency(member.rate)}</p>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-[1.5rem] border border-primary/20">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-primary uppercase font-black tracking-widest mb-1">Pending Settlement</p>
                    <p className="text-3xl font-black text-white">{formatCurrency(pending)}</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleAddAttendance(member.id, member.rate)}
                      className="w-12 h-12 glass flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all rounded-xl"
                      title="Mark Attendance"
                    >
                      <CheckCircle size={24} />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedStaffId(member.id);
                        setIsBonusModalOpen(true);
                      }}
                      className="w-12 h-12 glass flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all rounded-xl"
                      title="Add Bonus/Advance"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AddBonusModal 
        isOpen={isBonusModalOpen} 
        onClose={() => setIsBonusModalOpen(false)} 
        staffId={selectedStaffId || 0} 
        onAdded={fetchStaff} 
      />
    </div>
  );
};
