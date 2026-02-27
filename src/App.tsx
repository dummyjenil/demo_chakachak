import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, CreditCard, Users, MoreHorizontal } from 'lucide-react';
import { useAppStore } from './store/appStore';
import { useAuthStore } from './store/authStore';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { EventList } from './components/EventList';
import { EventDetails } from './components/EventDetails';
import { ClientDetails } from './components/ClientDetails';
import { StaffList } from './components/StaffList';
import { Finance } from './components/Finance';
import { RadialMenu } from './components/RadialMenu';
import { AddEventModal, AddExpenseModal, AddPaymentModal, AddStaffModal, EditEventModal, EditSubEventModal, EditStaffModal, EditClientModal } from './components/Modals';
import { cn } from './lib/utils';

const Navigation = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/finance', icon: CreditCard, label: 'Finance' },
    { path: '/staff', icon: Users, label: 'Staff' },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
      <div className="glass px-6 py-4 rounded-full flex items-center gap-8 shadow-2xl">
        {navItems.slice(0, 2).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-all group relative",
              location.pathname === item.path || (item.path === '/events' && location.pathname.startsWith('/events/')) ? "text-primary" : "text-slate-500 hover:text-white"
            )}
          >
            <item.icon size={22} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
            <span className={cn(
              "text-[10px] font-bold tracking-tight uppercase transition-all",
              location.pathname === item.path || (item.path === '/events' && location.pathname.startsWith('/events/')) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              {item.label}
            </span>
            {(location.pathname === item.path || (item.path === '/events' && location.pathname.startsWith('/events/'))) && (
              <motion.div layoutId="nav-indicator" className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
            )}
          </Link>
        ))}
        
        <div className="w-16" /> {/* Spacer for FAB */}

        {navItems.slice(2).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-all group relative",
              location.pathname === item.path ? "text-primary" : "text-slate-500 hover:text-white"
            )}
          >
            <item.icon size={22} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
            <span className={cn(
              "text-[10px] font-bold tracking-tight uppercase transition-all",
              location.pathname === item.path ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              {item.label}
            </span>
            {location.pathname === item.path && (
              <motion.div layoutId="nav-indicator" className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { activeModal, setActiveModal } = useAppStore();

  if (!isAuthenticated) return <Login />;

  return (
    <Router>
      <div className="min-h-screen bg-[#0F1115] text-slate-100 font-display selection:bg-primary/30">
        {/* Background Decoration */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        </div>

        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/staff" element={<StaffList />} />
          </Routes>
        </AnimatePresence>

        <Navigation />
        <RadialMenu onAction={(type) => setActiveModal(type)} />

        <AddEventModal isOpen={activeModal === 'event'} onClose={() => setActiveModal(null)} />
        <AddExpenseModal isOpen={activeModal === 'expense'} onClose={() => setActiveModal(null)} />
        <AddPaymentModal isOpen={activeModal === 'payment'} onClose={() => setActiveModal(null)} />
        <AddStaffModal isOpen={activeModal === 'staff'} onClose={() => setActiveModal(null)} />

        <EditEventModal 
          isOpen={activeModal === 'edit_event'} 
          onClose={() => setActiveModal(null)} 
          event={useAppStore.getState().selectedEvent}
          onUpdated={() => {
            useAppStore.getState().fetchEvents();
            window.dispatchEvent(new CustomEvent('event-updated'));
          }}
        />
        <EditSubEventModal 
          isOpen={activeModal === 'edit_sub_event'} 
          onClose={() => setActiveModal(null)} 
          subEvent={useAppStore.getState().selectedSubEvent}
          onUpdated={() => window.dispatchEvent(new CustomEvent('event-updated'))}
        />
        <EditStaffModal 
          isOpen={activeModal === 'edit_staff'} 
          onClose={() => setActiveModal(null)} 
          staff={useAppStore.getState().selectedStaff}
          onUpdated={() => useAppStore.getState().fetchStaff()}
        />
        <EditClientModal 
          isOpen={activeModal === 'edit_client'} 
          onClose={() => setActiveModal(null)} 
          client={useAppStore.getState().selectedClient}
          onUpdated={() => {
            useAppStore.getState().fetchClients();
            window.dispatchEvent(new CustomEvent('client-updated'));
          }}
        />
      </div>
    </Router>
  );
}
