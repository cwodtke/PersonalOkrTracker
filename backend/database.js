import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data.json');

// Initialize database
let db = {
  users: [],
  objectives: [],
  key_results: [],
  health_metrics: [],
  tasks: [],
  magic_links: []
};

// Load existing data if file exists
if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading database:', error);
  }
}

// Save database to file
function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Helper functions to mimic SQL interface
const prepare = (table) => ({
  run: (...values) => {
    // This is a simplified version - not a full SQL parser
    // Used for INSERT/UPDATE/DELETE operations
    return { changes: 1 };
  },
  get: (filter) => {
    // Get single record
    if (typeof filter === 'function') {
      return db[table].find(filter);
    }
    return db[table][0];
  },
  all: (filter) => {
    // Get all records
    if (typeof filter === 'function') {
      return db[table].filter(filter);
    }
    return db[table];
  }
});

// Custom query functions
const query = {
  // Users
  createUser: (id, email) => {
    db.users.push({ id, email, timezone: 'America/Los_Angeles', email_time: '09:00', email_enabled: true, created_at: new Date().toISOString() });
    save();
  },
  getUserByEmail: (email) => db.users.find(u => u.email === email),
  getUserById: (id) => db.users.find(u => u.id === id),
  updateUser: (id, updates) => {
    const index = db.users.findIndex(u => u.id === id);
    if (index >= 0) {
      db.users[index] = { ...db.users[index], ...updates };
      save();
    }
  },

  // Objectives
  createObjective: (obj) => {
    db.objectives.push({ ...obj, created_at: new Date().toISOString() });
    save();
  },
  getObjectives: (userId) => db.objectives.filter(o => o.user_id === userId),
  getCurrentObjectives: (userId, quarter, year) =>
    db.objectives.filter(o => o.user_id === userId && o.quarter === quarter && o.year === year && (o.status === 'active' || !o.status)),
  getPastObjectives: (userId, quarter, year) => {
    // Get objectives from quarters before the current quarter
    return db.objectives.filter(o => {
      if (o.user_id !== userId) return false;
      // Include if year is less, or same year but earlier quarter
      return o.year < year || (o.year === year && o.quarter < quarter);
    }).sort((a, b) => {
      // Sort by year desc, then quarter desc (most recent first)
      if (b.year !== a.year) return b.year - a.year;
      return b.quarter - a.quarter;
    });
  },
  getObjectiveById: (id) => db.objectives.find(o => o.id === id),
  updateObjective: (id, updates) => {
    const index = db.objectives.findIndex(o => o.id === id);
    if (index >= 0) {
      db.objectives[index] = { ...db.objectives[index], ...updates };
      save();
    }
  },
  deleteObjective: (id) => {
    db.objectives = db.objectives.filter(o => o.id !== id);
    db.key_results = db.key_results.filter(kr => kr.objective_id !== id);
    save();
  },

  // Key Results
  createKeyResult: (kr) => {
    const newKR = { ...kr, created_at: new Date().toISOString() };
    db.key_results.push(newKR);
    save();
    return newKR;
  },
  getKeyResultsByObjective: (objectiveId) => db.key_results.filter(kr => kr.objective_id === objectiveId),
  updateKeyResult: (id, updates) => {
    const index = db.key_results.findIndex(kr => kr.id === id);
    if (index >= 0) {
      db.key_results[index] = { ...db.key_results[index], ...updates };
      save();
    }
  },
  deleteKeyResult: (id) => {
    db.key_results = db.key_results.filter(kr => kr.id !== id);
    save();
  },

  // Health Metrics
  createHealthMetric: (metric) => {
    db.health_metrics.push({ ...metric, created_at: new Date().toISOString() });
    save();
  },
  getHealthMetrics: (userId) => db.health_metrics.filter(m => m.user_id === userId && m.active),

  // Tasks
  createTask: (task) => {
    db.tasks.push({ ...task, created_at: new Date().toISOString(), completed_at: null });
    save();
  },
  getTasks: (userId, view) => {
    let tasks = db.tasks.filter(t => t.user_id === userId && !t.parent_task_id);

    if (view === 'today') {
      const today = new Date().toISOString().split('T')[0];
      tasks = tasks.filter(t => {
        if (!t.deadline) return true;
        return t.deadline.startsWith(today);
      }).filter(t => t.status !== 'done' && t.status !== 'cancelled');
    } else if (view === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      tasks = tasks.filter(t => {
        if (!t.deadline) return false;
        return t.deadline > today;
      }).filter(t => t.status !== 'done' && t.status !== 'cancelled');
    } else if (view === 'completed') {
      // Show only completed or cancelled tasks, sorted by completion date (newest first)
      tasks = tasks.filter(t => t.status === 'done' || t.status === 'cancelled');
      tasks.sort((a, b) => {
        const dateA = new Date(a.completed_at || a.created_at);
        const dateB = new Date(b.completed_at || b.created_at);
        return dateB - dateA; // Newest first
      });
    } else if (view === 'all') {
      // Exclude completed tasks from "all" view to maintain focus
      tasks = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled');
    }

    return tasks;
  },
  getTaskById: (id) => db.tasks.find(t => t.id === id),
  getSubtasks: (parentId) => db.tasks.filter(t => t.parent_task_id === parentId),
  updateTask: (id, updates) => {
    const index = db.tasks.findIndex(t => t.id === id);
    if (index >= 0) {
      db.tasks[index] = { ...db.tasks[index], ...updates };
      save();
    }
  },
  deleteTask: (id) => {
    db.tasks = db.tasks.filter(t => t.id !== id && t.parent_task_id !== id);
    save();
  },

  // Magic Links
  createMagicLink: (link) => {
    db.magic_links.push({ ...link, created_at: new Date().toISOString(), used_at: null });
    save();
  },
  getMagicLink: (token) => db.magic_links.find(ml => ml.token === token && !ml.used_at && new Date(ml.expires_at) > new Date()),
  useMagicLink: (token) => {
    const index = db.magic_links.findIndex(ml => ml.token === token);
    if (index >= 0) {
      db.magic_links[index].used_at = new Date().toISOString();
      save();
    }
  }
};

console.log('JSON database initialized');

export default { prepare, query, exec: () => {} };
