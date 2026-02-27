import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import cors from "cors";
import multer from "multer";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("chakachak.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    name TEXT NOT NULL,
    total_budget REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS sub_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    name TEXT NOT NULL,
    address TEXT,
    start_date TEXT,
    windup_date TEXT,
    payment_date TEXT,
    budget REAL DEFAULT 0,
    description TEXT,
    worker_notes TEXT,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (event_id) REFERENCES events(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    amount REAL NOT NULL,
    type TEXT DEFAULT 'advance', -- 'advance', 'partial', 'full'
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER, -- Optional, can be null for general expenses
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT, -- 'petrol', 'food', 'damage', 'other'
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    per_day_rate REAL DEFAULT 0,
    old_balance REAL DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'inactive'
    photo_url TEXT,
    documents_url TEXT
  );

  CREATE TABLE IF NOT EXISTS staff_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER,
    type TEXT, -- 'attendance', 'advance', 'bonus'
    amount REAL DEFAULT 0,
    description TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id)
  );
`);

// Migration: Add notes column to clients if it doesn't exist
try {
  db.prepare("ALTER TABLE clients ADD COLUMN notes TEXT").run();
} catch (e) {
  // Column already exists or other error
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  // Auth
  app.post("/api/auth", (req, res) => {
    const { password } = req.body;
    if (password === (process.env.ADMIN_PASSWORD || "admin")) {
      res.json({ success: true, token: "mock-token" });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  });

  // Clients
  app.get("/api/clients", (req, res) => {
    const clients = db.prepare("SELECT * FROM clients").all();
    res.json(clients);
  });

  app.get("/api/clients/:id", (req, res) => {
    const client = db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id);
    if (!client) return res.status(404).json({ error: "Client not found" });
    
    const events = db.prepare(`
      SELECT e.*,
      (SELECT SUM(amount) FROM payments WHERE event_id = e.id) as received_amount
      FROM events e
      WHERE e.client_id = ?
      ORDER BY e.created_at DESC
    `).all(req.params.id);
    
    res.json({ ...client, events });
  });

  app.put("/api/clients/:id", (req, res) => {
    const { name, phone, notes } = req.body;
    db.prepare("UPDATE clients SET name = ?, phone = ?, notes = ? WHERE id = ?")
      .run(name, phone, notes || '', req.params.id);
    res.json({ success: true });
  });

  // Events
  app.get("/api/events", (req, res) => {
    const events = db.prepare(`
      SELECT e.*, c.name as client_name, c.phone as client_phone,
      (SELECT SUM(amount) FROM payments WHERE event_id = e.id) as received_amount
      FROM events e
      JOIN clients c ON e.client_id = c.id
      ORDER BY e.created_at DESC
    `).all();
    res.json(events);
  });

  app.put("/api/events/:id", (req, res) => {
    const { name, total_budget } = req.body;
    db.prepare("UPDATE events SET name = ?, total_budget = ? WHERE id = ?")
      .run(name, total_budget, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/events", (req, res) => {
    const { client_name, client_phone, event_name } = req.body;
    
    let client = db.prepare("SELECT * FROM clients WHERE phone = ?").get(client_phone);
    if (!client) {
      const result = db.prepare("INSERT INTO clients (name, phone) VALUES (?, ?)").run(client_name, client_phone);
      client = { id: result.lastInsertRowid };
    }

    const result = db.prepare("INSERT INTO events (client_id, name) VALUES (?, ?)").run(client.id, event_name);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/events/:id", (req, res) => {
    const event = db.prepare(`
      SELECT e.*, c.name as client_name, c.phone as client_phone
      FROM events e
      JOIN clients c ON e.client_id = c.id
      WHERE e.id = ?
    `).get(req.params.id);
    
    const subEvents = db.prepare("SELECT * FROM sub_events WHERE event_id = ?").all(req.params.id);
    const payments = db.prepare("SELECT * FROM payments WHERE event_id = ?").all(req.params.id);
    
    res.json({ ...event, subEvents, payments });
  });

  // Sub-events
  app.put("/api/sub-events/:id", (req, res) => {
    const { name, address, start_date, windup_date, payment_date, budget, description, worker_notes, status } = req.body;
    const subEvent = db.prepare("SELECT event_id FROM sub_events WHERE id = ?").get(req.params.id);
    
    db.prepare(`
      UPDATE sub_events 
      SET name = ?, address = ?, start_date = ?, windup_date = ?, payment_date = ?, budget = ?, description = ?, worker_notes = ?, status = ?
      WHERE id = ?
    `).run(name, address, start_date, windup_date, payment_date, budget, description, worker_notes, status, req.params.id);
    
    if (subEvent) {
      db.prepare("UPDATE events SET total_budget = (SELECT SUM(budget) FROM sub_events WHERE event_id = ?) WHERE id = ?")
        .run(subEvent.event_id, subEvent.event_id);
    }
    
    res.json({ success: true });
  });

  app.post("/api/sub-events", (req, res) => {
    const { event_id, name, address, start_date, windup_date, payment_date, budget, description, worker_notes } = req.body;
    const result = db.prepare(`
      INSERT INTO sub_events (event_id, name, address, start_date, windup_date, payment_date, budget, description, worker_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(event_id, name, address, start_date, windup_date, payment_date, budget, description, worker_notes);
    
    // Update total budget of main event
    db.prepare("UPDATE events SET total_budget = (SELECT SUM(budget) FROM sub_events WHERE event_id = ?) WHERE id = ?")
      .run(event_id, event_id);
      
    res.json({ id: result.lastInsertRowid });
  });

  // Payments
  app.post("/api/payments", (req, res) => {
    const { event_id, amount, type, date } = req.body;
    const result = db.prepare("INSERT INTO payments (event_id, amount, type, date) VALUES (?, ?, ?, ?)")
      .run(event_id, amount, type || 'partial', date || new Date().toISOString());
    res.json({ id: result.lastInsertRowid });
  });

  // Expenses
  app.get("/api/expenses", (req, res) => {
    const expenses = db.prepare("SELECT * FROM expenses ORDER BY date DESC").all();
    res.json(expenses);
  });

  app.post("/api/expenses", (req, res) => {
    const { event_id, title, amount, category, date } = req.body;
    const result = db.prepare("INSERT INTO expenses (event_id, title, amount, category, date) VALUES (?, ?, ?, ?, ?)")
      .run(event_id || null, title, amount, category, date || new Date().toISOString());
    res.json({ id: result.lastInsertRowid });
  });

  // Staff
  app.get("/api/staff", (req, res) => {
    const staff = db.prepare(`
      SELECT s.*,
      (SELECT COUNT(*) FROM staff_logs WHERE staff_id = s.id AND type = 'attendance') as active_days,
      (SELECT SUM(amount) FROM staff_logs WHERE staff_id = s.id AND type = 'advance') as total_advance,
      (SELECT SUM(amount) FROM staff_logs WHERE staff_id = s.id AND type = 'bonus') as total_bonus
      FROM staff s
    `).all();
    res.json(staff);
  });

  app.put("/api/staff/:id", (req, res) => {
    const { name, phone, per_day_rate, old_balance } = req.body;
    db.prepare("UPDATE staff SET name = ?, phone = ?, per_day_rate = ?, old_balance = ? WHERE id = ?")
      .run(name, phone, per_day_rate, old_balance, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/staff", (req, res) => {
    const { name, phone, per_day_rate, old_balance } = req.body;
    const result = db.prepare("INSERT INTO staff (name, phone, per_day_rate, old_balance) VALUES (?, ?, ?, ?)")
      .run(name, phone, per_day_rate, old_balance || 0);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/staff/:id/logs", (req, res) => {
    const logs = db.prepare("SELECT * FROM staff_logs WHERE staff_id = ? ORDER BY date DESC").all(req.params.id);
    res.json(logs);
  });

  app.post("/api/staff/logs", (req, res) => {
    const { staff_id, type, amount, description, date } = req.body;
    const result = db.prepare("INSERT INTO staff_logs (staff_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?)")
      .run(staff_id, type, amount || 0, description, date || new Date().toISOString());
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/staff/:id/status", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE staff SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/staff/:id/reset", (req, res) => {
    db.prepare("DELETE FROM staff_logs WHERE staff_id = ?").run(req.params.id);
    db.prepare("UPDATE staff SET old_balance = 0 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/events/:id/pdf", (req, res) => {
    const event = db.prepare(`
      SELECT e.*, c.name as client_name, c.phone as client_phone
      FROM events e
      JOIN clients c ON e.client_id = c.id
      WHERE e.id = ?
    `).get(req.params.id);
    
    if (!event) return res.status(404).send("Event not found");

    const subEvents = db.prepare("SELECT * FROM sub_events WHERE event_id = ?").all(req.params.id);
    const payments = db.prepare("SELECT * FROM payments WHERE event_id = ?").all(req.params.id);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=event_${event.id}.pdf`);
    doc.pipe(res);

    doc.fontSize(25).text('Chakachak Decoration - Event Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`Event: ${event.name}`);
    doc.fontSize(14).text(`Client: ${event.client_name} (${event.client_phone})`);
    doc.text(`Total Budget: Rs. ${event.total_budget}`);
    doc.moveDown();

    doc.fontSize(16).text('Sub-Events (Phases)');
    subEvents.forEach((sub: any) => {
      doc.fontSize(12).text(`- ${sub.name}: Rs. ${sub.budget}`);
      doc.fontSize(10).text(`  Venue: ${sub.address}`);
      doc.text(`  Dates: ${sub.start_date} to ${sub.windup_date}`);
      doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.fontSize(16).text('Payment History');
    payments.forEach((p: any) => {
      doc.fontSize(12).text(`- Rs. ${p.amount} (${p.type}) on ${new Date(p.date).toLocaleDateString()}`);
    });

    doc.end();
  });

  // Dashboard Stats
  app.get("/api/stats", (req, res) => {
    const totalPending = db.prepare(`
      SELECT (SUM(total_budget) - IFNULL((SELECT SUM(amount) FROM payments), 0)) as pending
      FROM events
    `).get();
    
    const activeEvents = db.prepare("SELECT COUNT(*) as count FROM events").get();
    
    const recentActivity = db.prepare(`
      SELECT 'event' as type, name as title, created_at as date, total_budget as amount FROM events
      UNION ALL
      SELECT 'payment' as type, 'Payment Received' as title, date, amount FROM payments
      ORDER BY date DESC LIMIT 10
    `).all();

    res.json({
      totalPending: totalPending.pending || 0,
      activeEvents: activeEvents.count || 0,
      recentActivity
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
