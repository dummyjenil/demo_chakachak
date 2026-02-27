import { Client, Event, Staff, SubEvent } from '../store/appStore';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Network response was not ok');
  }
  return response.json();
};

export const api = {
  // Clients
  fetchClients: (): Promise<Client[]> => 
    fetch('/api/clients').then(handleResponse),

  fetchClientDetails: (id: string | number): Promise<Client & { events: Event[] }> => 
    fetch(`/api/clients/${id}`).then(handleResponse),

  updateClient: (id: string | number, data: Partial<Client>) => 
    fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Events
  fetchEvents: (): Promise<Event[]> => 
    fetch('/api/events').then(handleResponse),
  
  fetchEventDetails: (id: string | number): Promise<Event> => 
    fetch(`/api/events/${id}`).then(handleResponse),
  
  updateEvent: (id: string | number, data: Partial<Event>) => 
    fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  
  createEvent: (data: { client_name: string; client_phone: string; event_name: string }) => 
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Sub-events (Phases)
  updateSubEvent: (id: string | number, data: Partial<SubEvent>) => 
    fetch(`/api/sub-events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  createSubEvent: (data: Partial<SubEvent> & { event_id: number }) => 
    fetch('/api/sub-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Payments
  createPayment: (data: { event_id: string | number; amount: string | number; type?: string; date?: string }) => 
    fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Expenses
  fetchExpenses: (): Promise<any[]> => 
    fetch('/api/expenses').then(handleResponse),
  
  createExpense: (data: { event_id?: string | number; title: string; amount: string | number; category: string; date?: string }) => 
    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Staff
  fetchStaff: (): Promise<Staff[]> => 
    fetch('/api/staff').then(handleResponse),
  
  updateStaff: (id: string | number, data: Partial<Staff>) => 
    fetch(`/api/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  
  createStaff: (data: { name: string; phone: string; per_day_rate: string | number; old_balance?: string | number }) => 
    fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  
  fetchStaffLogs: (id: string | number): Promise<any[]> => 
    fetch(`/api/staff/${id}/logs`).then(handleResponse),
  
  createStaffLog: (data: { staff_id: number; type: string; amount: number; description: string; date?: string }) => 
    fetch('/api/staff/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  
  updateStaffStatus: (id: number, status: string) => 
    fetch(`/api/staff/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(handleResponse),
  
  resetStaff: (id: number) => 
    fetch(`/api/staff/${id}/reset`, { method: 'POST' }).then(handleResponse),

  // Stats
  fetchStats: (): Promise<any> => 
    fetch('/api/stats').then(handleResponse),

  // PDF
  getEventPdfUrl: (id: string | number) => `/api/events/${id}/pdf`,
};
