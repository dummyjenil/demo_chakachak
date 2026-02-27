import { supabase } from '../lib/supabase';
import { Client, Event, Staff, SubEvent, AccountBook, LogActivity, ExpenseCategory } from '../store/appStore';

export const api = {
  // Clients
  fetchClients: async (): Promise<Client[]> => {
    const { data, error } = await supabase.from('clients').select('*').order('name');
    if (error) throw error;
    return data;
  },

  fetchClientDetails: async (id: string | number): Promise<Client & { events: Event[] }> => {
    const { data: client, error: clientError } = await supabase.from('clients').select('*').eq('id', id).single();
    if (clientError) throw clientError;

    const { data: events, error: eventsError } = await supabase.from('events').select('*').eq('client', id).order('id', { ascending: false });
    if (eventsError) throw eventsError;

    return { ...client, events };
  },

  updateClient: async (id: string | number, data: Partial<Client>) => {
    const { error } = await supabase.from('clients').update(data).eq('id', id);
    if (error) throw error;
  },

  deleteClient: async (id: number) => {
    const { data: client } = await supabase.from('clients').select('name').eq('id', id).single();
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;

    if (client) {
      await api.createLog({
        log_data: `Deleted client: ${client.name}`,
        category: 'CLIENT DELETE',
        ref_id: id
      });
    }
  },

  createClient: async (data: Partial<Client>) => {
    const { data: newClient, error } = await supabase.from('clients').insert(data).select().single();
    if (error) throw error;
    return newClient;
  },

  // Events
  fetchEvents: async (): Promise<Event[]> => {
    const { data, error } = await supabase.from('events').select(`
      *,
      clients (name, mobile_num)
    `).order('id', { ascending: false });
    if (error) throw error;
    return data.map((e: any) => ({
      ...e,
      client_name: e.clients?.name,
      client_phone: e.clients?.mobile_num
    }));
  },

  fetchEventDetails: async (id: string | number): Promise<Event> => {
    const { data: event, error: eventError } = await supabase.from('events').select(`
      *,
      clients (name, mobile_num)
    `).eq('id', id).single();
    if (eventError) throw eventError;

    const { data: subEvents, error: subEventsError } = await supabase.from('subevents').select('*').eq('event_id', id);
    if (subEventsError) throw subEventsError;

    return {
      ...event,
      client_name: event.clients?.name,
      client_phone: event.clients?.mobile_num,
      subEvents
    };
  },

  updateEvent: async (id: string | number, data: Partial<Event>) => {
    const { error } = await supabase.from('events').update(data).eq('id', id);
    if (error) throw error;
  },

  deleteEvent: async (id: number) => {
    const { data: event } = await supabase.from('events').select('name').eq('id', id).single();
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;

    if (event) {
      await api.createLog({
        log_data: `Deleted event: ${event.name}`,
        category: 'EVENT DELETE',
        ref_id: id
      });
    }
  },

  createEvent: async (data: any) => {
    let clientId = data.client_id;
    if (!clientId) {
      // Find or create client
      const { data: existingClient } = await supabase.from('clients').select('id').eq('mobile_num', data.client_phone).single();
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: clientError } = await supabase.from('clients').insert({
          name: data.client_name,
          mobile_num: data.client_phone
        }).select().single();
        if (clientError) throw clientError;
        clientId = newClient.id;
      }
    }

    const { data: newEvent, error } = await supabase.from('events').insert({
      name: data.event_name,
      client: clientId,
      payment_date: data.payment_date || new Date().toISOString(),
      total_budget: data.total_budget,
      advance_payment_amt: data.advance_payment_amt || 0,
      description: data.description || ''
    }).select().single();
    if (error) throw error;

    // Log activity
    await api.createLog({
      log_data: `Created event: ${data.event_name}`,
      category: 'EVENT ADD',
      ref_id: newEvent.id
    });

    return newEvent;
  },

  // Sub-events (Phases)
  updateSubEvent: async (id: string | number, data: Partial<SubEvent>) => {
    const { error } = await supabase.from('subevents').update(data).eq('id', id);
    if (error) throw error;
  },

  createSubEvent: async (data: Partial<SubEvent> & { event_id: number }) => {
    const { data: newSubEvent, error } = await supabase.from('subevents').insert(data).select().single();
    if (error) throw error;

    // Log activity
    await api.createLog({
      log_data: `Added phase: ${data.name}`,
      category: 'PHASE ADD',
      ref_id: newSubEvent.id
    });

    return newSubEvent;
  },

  deleteSubEvent: async (id: number) => {
    const { data: subEvent } = await supabase.from('subevents').select('name').eq('id', id).single();
    const { error } = await supabase.from('subevents').delete().eq('id', id);
    if (error) throw error;

    if (subEvent) {
      await api.createLog({
        log_data: `Deleted phase: ${subEvent.name}`,
        category: 'PHASE DELETE',
        ref_id: id
      });
    }
  },

  // Payments
  createPayment: async (data: { event_id: number; amount: number; type: string; date?: string }) => {
    // Fetch current event to update advance_payment_amt
    const { data: event, error: fetchError } = await supabase.from('events').select('advance_payment_amt, name').eq('id', data.event_id).single();
    if (fetchError) throw fetchError;

    const newAmt = Number(event.advance_payment_amt) + Number(data.amount);
    const { error: updateError } = await supabase.from('events').update({ advance_payment_amt: newAmt }).eq('id', data.event_id);
    if (updateError) throw updateError;

    // Log activity
    await api.createLog({
      log_data: `Payment received for ${event.name}: ₹${data.amount}`,
      category: data.type === 'full' ? 'FULL PAYMENT' : 'ADVANCE PAYMENT',
      ref_id: data.event_id
    });
  },

  // Expenses
  fetchExpenses: async (): Promise<AccountBook[]> => {
    const { data, error } = await supabase.from('account_book').select(`
      *,
      expanses_category (name)
    `).order('date', { ascending: false });
    if (error) throw error;
    return data.map((e: any) => ({
      ...e,
      category_name: e.expanses_category?.name
    }));
  },

  fetchExpenseCategories: async (): Promise<ExpenseCategory[]> => {
    const { data, error } = await supabase.from('expanses_category').select('*').order('name');
    if (error) throw error;
    return data;
  },

  createExpense: async (data: { title: string; amount: number; category_id?: number; date?: string }) => {
    const { data: newExpense, error } = await supabase.from('account_book').insert({
      description: data.title,
      ammount: data.amount,
      category_id: data.category_id || null,
      date: data.date || new Date().toISOString()
    }).select().single();
    if (error) throw error;

    await api.createLog({
      log_data: `Expense added: ${data.title} (₹${data.amount})`,
      category: 'ACCOUNT ENTRY ADD',
      ref_id: newExpense.id
    });

    return newExpense;
  },

  // Staff
  fetchStaff: async (): Promise<Staff[]> => {
    const { data, error } = await supabase.from('employee').select('*').order('name');
    if (error) throw error;
    return data;
  },

  updateStaff: async (id: string | number, data: Partial<Staff>) => {
    const { error } = await supabase.from('employee').update(data).eq('id', id);
    if (error) throw error;
  },

  deleteStaff: async (id: number) => {
    const { data: staff } = await supabase.from('employee').select('name').eq('id', id).single();
    const { error } = await supabase.from('employee').delete().eq('id', id);
    if (error) throw error;

    if (staff) {
      await api.createLog({
        log_data: `Deleted staff: ${staff.name}`,
        category: 'STAFF DELETE',
        ref_id: id
      });
    }
  },

  createStaff: async (data: Partial<Staff>) => {
    const { data: newStaff, error } = await supabase.from('employee').insert(data).select().single();
    if (error) throw error;
    return newStaff;
  },

  updateStaffStatus: async (id: number, status: string) => {
    const { error } = await supabase.from('employee').update({ status }).eq('id', id);
    if (error) throw error;
  },

  addStaffBalance: async (id: number, amount: number, type: string, description: string) => {
    const { data: staff, error: fetchError } = await supabase.from('employee').select('deposit_amount, name').eq('id', id).single();
    if (fetchError) throw fetchError;

    let newBalance = Number(staff.deposit_amount);
    if (type === 'advance') {
      newBalance -= Number(amount);
    } else {
      newBalance += Number(amount);
    }

    const { error: updateError } = await supabase.from('employee').update({ deposit_amount: newBalance }).eq('id', id);
    if (updateError) throw updateError;

    const logMsg = type === 'attendance' ? 'Attendance marked' : 
                   type === 'bonus' ? 'Bonus added' : 
                   type === 'advance' ? 'Advance given' : 
                   `${type.replace('_', ' ')} added`;

    await api.createLog({
      log_data: `${logMsg} for ${staff.name}: ₹${amount}. ${description}`,
      category: 'EMPLOYEE PAYMENT',
      ref_id: id
    });
  },

  resetStaff: async (id: number, amountPaid: number) => {
    const { data: staff, error: fetchError } = await supabase.from('employee').select('name').eq('id', id).single();
    if (fetchError) throw fetchError;

    // Reset deposit amount
    const { error: updateError } = await supabase.from('employee').update({ deposit_amount: 0 }).eq('id', id);
    if (updateError) throw updateError;

    // Log as expense
    if (amountPaid > 0) {
      // Find or create salary category
      let { data: category } = await supabase.from('expanses_category').select('id').eq('name', 'Salary').single();
      if (!category) {
        const { data: newCat } = await supabase.from('expanses_category').insert({ name: 'Salary' }).select().single();
        category = newCat;
      }
      
      const { data: newExpense, error: expenseError } = await supabase.from('account_book').insert({
        description: `Salary settlement for ${staff.name}`,
        ammount: amountPaid,
        category_id: category?.id || null,
        date: new Date().toISOString()
      }).select().single();
      
      if (!expenseError) {
        await api.createLog({
          log_data: `Salary paid to ${staff.name}: ₹${amountPaid}`,
          category: 'EMPLOYEE PAYMENT',
          ref_id: newExpense.id
        });
      }
    }
  },

  // Logs
  fetchLogs: async (): Promise<LogActivity[]> => {
    const { data, error } = await supabase.from('logs_activity').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  createLog: async (data: Partial<LogActivity>) => {
    const { error } = await supabase.from('logs_activity').insert(data);
    if (error) console.error('Error creating log:', error);
  },

  // Stats
  fetchStats: async (): Promise<any> => {
    const { data: events, error: eventsError } = await supabase.from('events').select('total_budget, advance_payment_amt');
    if (eventsError) throw eventsError;

    const { data: expenses, error: expensesError } = await supabase.from('account_book').select('ammount');
    if (expensesError) throw expensesError;

    const { data: logs, error: logsError } = await supabase.from('logs_activity').select('*').order('created_at', { ascending: false }).limit(10);
    if (logsError) throw logsError;

    const totalRevenue = events.reduce((acc, e) => acc + (Number(e.advance_payment_amt) || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.ammount) || 0), 0);
    const totalPending = events.reduce((acc, e) => acc + (Number(e.total_budget || 0) - Number(e.advance_payment_amt || 0)), 0);

    return {
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_balance: totalRevenue - totalExpenses,
      totalPending,
      activeEvents: events.length,
      recentActivity: logs.map(log => ({
        title: log.log_data,
        amount: log.category.includes('PAYMENT') ? 0 : 0, // This mapping might need adjustment
        date: log.created_at,
        type: log.category.toLowerCase().includes('event') ? 'event' : 'payment'
      }))
    };
  },

  getEventPdfUrl: (id: string | number) => {
    return `https://api.example.com/events/${id}/pdf`;
  }
};
