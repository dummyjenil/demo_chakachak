import { create } from 'zustand';
import { api } from '../services/api';

export interface Client {
  id: number;
  name: string;
  phone: string;
}

export interface Event {
  id: number;
  client_id: number;
  name: string;
  total_budget: number;
  created_at: string;
  client_name: string;
  client_phone: string;
  received_amount: number;
  subEvents?: SubEvent[];
  payments?: any[];
}

export interface SubEvent {
  id: number;
  event_id: number;
  name: string;
  address: string;
  start_date: string;
  windup_date: string;
  payment_date: string;
  budget: number;
  description: string;
  worker_notes: string;
  status: string;
}

export interface Staff {
  id: number;
  name: string;
  phone: string;
  per_day_rate: number;
  old_balance: number;
  status: string;
  photo_url: string;
  active_days: number;
  total_advance: number;
  total_bonus: number;
}

interface AppState {
  clients: Client[];
  events: Event[];
  staff: Staff[];
  stats: any;
  activeModal: 'event' | 'expense' | 'payment' | 'staff' | 'edit_event' | 'edit_sub_event' | 'edit_staff' | 'edit_client' | null;
  selectedEvent: any | null;
  selectedSubEvent: any | null;
  selectedStaff: any | null;
  selectedClient: any | null;
  fetchClients: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchStaff: () => Promise<void>;
  fetchStats: () => Promise<void>;
  setActiveModal: (modal: 'event' | 'expense' | 'payment' | 'staff' | 'edit_event' | 'edit_sub_event' | 'edit_staff' | 'edit_client' | null, data?: any) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  clients: [],
  events: [],
  staff: [],
  stats: null,
  activeModal: null,
  selectedEvent: null,
  selectedSubEvent: null,
  selectedStaff: null,
  selectedClient: null,
  fetchClients: async () => {
    const data = await api.fetchClients();
    set({ clients: data });
  },
  fetchEvents: async () => {
    const data = await api.fetchEvents();
    set({ events: data });
  },
  fetchStaff: async () => {
    const data = await api.fetchStaff();
    set({ staff: data });
  },
  fetchStats: async () => {
    const data = await api.fetchStats();
    set({ stats: data });
  },
  setActiveModal: (modal, data) => {
    set({ 
      activeModal: modal, 
      selectedEvent: modal === 'payment' || modal === 'edit_event' ? (typeof data === 'number' ? { id: data } : data) || null : get().selectedEvent,
      selectedSubEvent: modal === 'edit_sub_event' ? data || null : null,
      selectedStaff: modal === 'edit_staff' ? data || null : null,
      selectedClient: modal === 'edit_client' ? data || null : null
    });
  },
}));
