import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Receipt, CreditCard, Calendar, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface RadialMenuProps {
  onAction: (type: 'event' | 'expense' | 'payment' | 'staff') => void;
}

export const RadialMenu: React.FC<RadialMenuProps> = ({ onAction }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const actions = [
    { id: 'staff', icon: Users, label: 'Add Staff', color: 'bg-emerald-500', pos: { x: -120, y: -20 } },
    { id: 'payment', icon: CreditCard, label: 'Add Payment', color: 'bg-blue-500', pos: { x: -70, y: -110 } },
    { id: 'expense', icon: Receipt, label: 'Add Expense', color: 'bg-orange-500', pos: { x: 70, y: -110 } },
    { id: 'event', icon: Calendar, label: 'Add Event', color: 'bg-purple-500', pos: { x: 120, y: -20 } },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[-1]"
            />
            {actions.map((action) => (
              <motion.div
                key={action.id}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ scale: 1, x: action.pos.x, y: action.pos.y }}
                exit={{ scale: 0, x: 0, y: 0 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
              >
                <button
                  onClick={() => {
                    onAction(action.id as any);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95",
                    action.color
                  )}
                >
                  <action.icon size={24} />
                </button>
                <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-black/40 px-2 py-1 rounded-full whitespace-nowrap">
                  {action.label}
                </span>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300",
          isOpen ? "bg-red-500 rotate-45" : "bg-primary hover:scale-110 active:scale-95"
        )}
      >
        <Plus size={32} />
        {!isOpen && (
          <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
        )}
      </button>
    </div>
  );
};
