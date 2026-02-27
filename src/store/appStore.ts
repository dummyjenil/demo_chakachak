import { create } from 'zustand';
import { api } from '../services/api';

export interface Client {
  id: number;
  name: string;
  mobile_num: string;
  notes: string;
}

export interface Event {
  id: number;
  client: number;
  name: string;
  payment_date: string;
  total_budget: number;
  advance_payment_amt: number;
  received_amount?: number;
  description: string;
  notes: string;
  client_name?: string;
  client_phone?: string;
  client_id?: number;
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
  working_date: string;
  description: string;
  notes: string;
  worker_notes?: string;
  budget?: number;
  status?: string;
}

export interface Staff {
  id: number;
  name: string;
  mobile_num: string;
  document_links: string[];
  rate: number;
  notes: string;
  status: 'ACTIVE' | 'INACTIVE';
  activation_date: string;
  deposit_amount: number;
}

export interface AccountBook {
  id: number;
  date: string;
  description: string;
  ammount: number;
  category_id: number;
  category_name?: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
}

export interface LogActivity {
  id: number;
  created_at: string;
  log_data: string;
  category: string;
  ref_id: number;
}

interface AppState {
  clients: Client[];
  events: Event[];
  staff: Staff[];
  expenses: AccountBook[];
  expenseCategories: ExpenseCategory[];
  logs: LogActivity[];
  stats: any;
  activeModal: 'event' | 'expense' | 'payment' | 'staff' | 'edit_event' | 'edit_sub_event' | 'edit_staff' | 'edit_client' | null;
  selectedEvent: any | null;
  selectedSubEvent: any | null;
  selectedStaff: any | null;
  selectedClient: any | null;
  fetchClients: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchStaff: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  fetchExpenseCategories: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchStats: () => Promise<void>;
  setActiveModal: (modal: 'event' | 'expense' | 'payment' | 'staff' | 'edit_event' | 'edit_sub_event' | 'edit_staff' | 'edit_client' | null, data?: any) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  clients: [],
  events: [],
  staff: [],
  expenses: [],
  expenseCategories: [],
  logs: [],
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
  fetchExpenses: async () => {
    const data = await api.fetchExpenses();
    set({ expenses: data });
  },
  fetchExpenseCategories: async () => {
    const data = await api.fetchExpenseCategories();
    set({ expenseCategories: data });
  },
  fetchLogs: async () => {
    const data = await api.fetchLogs();
    set({ logs: data });
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
