import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.sqlite');

// Initialize SQLite database
const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL'); // Better performance for concurrent access

// Create tables
const initSchema = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      timezone TEXT DEFAULT 'America/Los_Angeles',
      email_time TEXT DEFAULT '09:00',
      email_enabled INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS objectives (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      quarter INTEGER NOT NULL,
      year INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS key_results (
      id TEXT PRIMARY KEY,
      objective_id TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT DEFAULT 'numeric',
      start_value REAL DEFAULT 0,
      current_value REAL DEFAULT 0,
      target_value REAL DEFAULT 100,
      confidence_level INTEGER DEFAULT 5,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      FOREIGN KEY (objective_id) REFERENCES objectives(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS health_metrics (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'green',
      notes TEXT,
      active INTEGER DEFAULT 1,
      last_updated TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS heartbeat_work (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'not_started',
      assignment_type TEXT,
      assignment_id TEXT,
      parent_task_id TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS magic_links (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      used_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_objectives_user ON objectives(user_id);
    CREATE INDEX IF NOT EXISTS idx_key_results_objective ON key_results(objective_id);
    CREATE INDEX IF NOT EXISTS idx_health_metrics_user ON health_metrics(user_id);
    CREATE INDEX IF NOT EXISTS idx_heartbeat_work_user ON heartbeat_work(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id);
    CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
  `);
};

initSchema();

// Query functions
const query = {
  // Users
  createUser: (id, email) => {
    const stmt = db.prepare(`
      INSERT INTO users (id, email, timezone, email_time, email_enabled, created_at)
      VALUES (?, ?, 'America/Los_Angeles', '09:00', 1, ?)
    `);
    stmt.run(id, email, new Date().toISOString());
  },

  getUserByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  getUserById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  updateUser: (id, updates) => {
    const fields = [];
    const values = [];

    if (updates.timezone !== undefined) {
      fields.push('timezone = ?');
      values.push(updates.timezone);
    }
    if (updates.email_time !== undefined) {
      fields.push('email_time = ?');
      values.push(updates.email_time);
    }
    if (updates.email_enabled !== undefined) {
      fields.push('email_enabled = ?');
      values.push(updates.email_enabled ? 1 : 0);
    }

    if (fields.length > 0) {
      values.push(id);
      const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
  },

  // Objectives
  createObjective: (obj) => {
    const stmt = db.prepare(`
      INSERT INTO objectives (id, user_id, title, description, quarter, year, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      obj.id,
      obj.user_id,
      obj.title,
      obj.description || null,
      obj.quarter,
      obj.year,
      obj.status || 'active',
      obj.created_at || new Date().toISOString()
    );
  },

  getObjectives: (userId) => {
    const stmt = db.prepare('SELECT * FROM objectives WHERE user_id = ? ORDER BY year DESC, quarter DESC');
    return stmt.all(userId);
  },

  getCurrentObjectives: (userId, quarter, year) => {
    const stmt = db.prepare(`
      SELECT * FROM objectives
      WHERE user_id = ? AND quarter = ? AND year = ? AND (status = 'active' OR status IS NULL)
    `);
    return stmt.all(userId, quarter, year);
  },

  getPastObjectives: (userId, quarter, year) => {
    const stmt = db.prepare(`
      SELECT * FROM objectives
      WHERE user_id = ? AND (year < ? OR (year = ? AND quarter < ?))
      ORDER BY year DESC, quarter DESC
    `);
    return stmt.all(userId, year, year, quarter);
  },

  getObjectiveById: (id) => {
    const stmt = db.prepare('SELECT * FROM objectives WHERE id = ?');
    return stmt.get(id);
  },

  updateObjective: (id, updates) => {
    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.quarter !== undefined) {
      fields.push('quarter = ?');
      values.push(updates.quarter);
    }
    if (updates.year !== undefined) {
      fields.push('year = ?');
      values.push(updates.year);
    }

    if (fields.length > 0) {
      values.push(id);
      const stmt = db.prepare(`UPDATE objectives SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
  },

  deleteObjective: (id) => {
    // Foreign keys will cascade delete key_results
    const stmt = db.prepare('DELETE FROM objectives WHERE id = ?');
    stmt.run(id);
  },

  // Key Results
  createKeyResult: (kr) => {
    const stmt = db.prepare(`
      INSERT INTO key_results (id, objective_id, description, type, start_value, current_value, target_value, confidence_level, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      kr.id,
      kr.objective_id,
      kr.description,
      kr.type || 'numeric',
      kr.start_value || 0,
      kr.current_value !== undefined ? kr.current_value : (kr.start_value || 0),
      kr.target_value || 100,
      kr.confidence_level !== undefined ? kr.confidence_level : 5,
      kr.status || 'active',
      kr.created_at || new Date().toISOString()
    );
    return query.getKeyResultById(kr.id);
  },

  getKeyResultById: (id) => {
    const stmt = db.prepare('SELECT * FROM key_results WHERE id = ?');
    return stmt.get(id);
  },

  getKeyResultsByObjective: (objectiveId) => {
    const stmt = db.prepare('SELECT * FROM key_results WHERE objective_id = ?');
    return stmt.all(objectiveId);
  },

  updateKeyResult: (id, updates) => {
    const fields = [];
    const values = [];

    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.type !== undefined) {
      fields.push('type = ?');
      values.push(updates.type);
    }
    if (updates.start_value !== undefined) {
      fields.push('start_value = ?');
      values.push(updates.start_value);
    }
    if (updates.current_value !== undefined) {
      fields.push('current_value = ?');
      values.push(updates.current_value);
    }
    if (updates.target_value !== undefined) {
      fields.push('target_value = ?');
      values.push(updates.target_value);
    }
    if (updates.confidence_level !== undefined) {
      fields.push('confidence_level = ?');
      values.push(updates.confidence_level);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }

    if (fields.length > 0) {
      values.push(id);
      const stmt = db.prepare(`UPDATE key_results SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
  },

  deleteKeyResult: (id) => {
    const stmt = db.prepare('DELETE FROM key_results WHERE id = ?');
    stmt.run(id);
  },

  // Health Metrics
  createHealthMetric: (metric) => {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO health_metrics (id, user_id, name, description, status, notes, active, last_updated, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      metric.id,
      metric.user_id,
      metric.name,
      metric.description || null,
      metric.status || 'green',
      metric.notes || null,
      metric.active !== undefined ? (metric.active ? 1 : 0) : 1,
      now,
      now
    );
    return query.getHealthMetricById(metric.id);
  },

  getHealthMetricById: (id) => {
    const stmt = db.prepare('SELECT * FROM health_metrics WHERE id = ?');
    const metric = stmt.get(id);
    if (metric) {
      metric.active = Boolean(metric.active);
    }
    return metric;
  },

  getHealthMetrics: (userId) => {
    const stmt = db.prepare('SELECT * FROM health_metrics WHERE user_id = ? AND active = 1');
    const metrics = stmt.all(userId);
    return metrics.map(m => ({ ...m, active: Boolean(m.active) }));
  },

  updateHealthMetric: (id, updates) => {
    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }

    fields.push('last_updated = ?');
    values.push(new Date().toISOString());

    values.push(id);
    const stmt = db.prepare(`UPDATE health_metrics SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return query.getHealthMetricById(id);
  },

  deleteHealthMetric: (id) => {
    const stmt = db.prepare('UPDATE health_metrics SET active = 0 WHERE id = ?');
    stmt.run(id);
  },

  // Heartbeat Work
  createHeartbeatWork: (work) => {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO heartbeat_work (id, user_id, name, description, category, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      work.id,
      work.user_id,
      work.name,
      work.description || null,
      work.category || null,
      work.active !== undefined ? (work.active ? 1 : 0) : 1,
      now
    );
    return query.getHeartbeatWorkById(work.id);
  },

  getHeartbeatWorkById: (id) => {
    const stmt = db.prepare('SELECT * FROM heartbeat_work WHERE id = ?');
    const work = stmt.get(id);
    if (work) {
      work.active = Boolean(work.active);
    }
    return work;
  },

  getHeartbeatWork: (userId) => {
    const stmt = db.prepare('SELECT * FROM heartbeat_work WHERE user_id = ? AND active = 1');
    const work = stmt.all(userId);
    return work.map(w => ({ ...w, active: Boolean(w.active) }));
  },

  updateHeartbeatWork: (id, updates) => {
    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }

    if (fields.length > 0) {
      values.push(id);
      const stmt = db.prepare(`UPDATE heartbeat_work SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }

    return query.getHeartbeatWorkById(id);
  },

  deleteHeartbeatWork: (id) => {
    const stmt = db.prepare('UPDATE heartbeat_work SET active = 0 WHERE id = ?');
    stmt.run(id);
  },

  // Tasks
  createTask: (task) => {
    const stmt = db.prepare(`
      INSERT INTO tasks (id, user_id, title, description, deadline, status, assignment_type, assignment_id, parent_task_id, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      task.id,
      task.user_id,
      task.title,
      task.description || null,
      task.deadline || null,
      task.status || 'not_started',
      task.assignment_type || null,
      task.assignment_id || null,
      task.parent_task_id || null,
      task.created_at || new Date().toISOString(),
      null
    );
  },

  getTasks: (userId, view) => {
    let sql = 'SELECT * FROM tasks WHERE user_id = ? AND parent_task_id IS NULL';
    const params = [userId];

    if (view === 'today') {
      const today = new Date().toISOString().split('T')[0];
      sql += ` AND (deadline IS NULL OR deadline LIKE '${today}%') AND status != 'done'`;
    } else if (view === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      sql += ` AND deadline > '${today}' AND status != 'done'`;
    } else if (view === 'completed') {
      sql += ` AND status = 'done' ORDER BY completed_at DESC`;
    } else if (view === 'all') {
      sql += ` AND status != 'done'`;
    }

    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },

  getTaskById: (id) => {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id);
  },

  getSubtasks: (parentId) => {
    const stmt = db.prepare('SELECT * FROM tasks WHERE parent_task_id = ?');
    return stmt.all(parentId);
  },

  updateTask: (id, updates) => {
    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.deadline !== undefined) {
      fields.push('deadline = ?');
      values.push(updates.deadline);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.assignment_type !== undefined) {
      fields.push('assignment_type = ?');
      values.push(updates.assignment_type);
    }
    if (updates.assignment_id !== undefined) {
      fields.push('assignment_id = ?');
      values.push(updates.assignment_id);
    }
    if (updates.completed_at !== undefined) {
      fields.push('completed_at = ?');
      values.push(updates.completed_at);
    }

    if (fields.length > 0) {
      values.push(id);
      const stmt = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
  },

  deleteTask: (id) => {
    // Delete task and all its subtasks (cascade handled by foreign key)
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ? OR parent_task_id = ?');
    stmt.run(id, id);
  },

  // Magic Links
  createMagicLink: (link) => {
    const stmt = db.prepare(`
      INSERT INTO magic_links (id, user_id, token, expires_at, created_at, used_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      link.id,
      link.user_id,
      link.token,
      link.expires_at,
      link.created_at || new Date().toISOString(),
      null
    );
  },

  getMagicLink: (token) => {
    const stmt = db.prepare(`
      SELECT * FROM magic_links
      WHERE token = ? AND used_at IS NULL AND expires_at > ?
    `);
    return stmt.get(token, new Date().toISOString());
  },

  useMagicLink: (token) => {
    const stmt = db.prepare('UPDATE magic_links SET used_at = ? WHERE token = ?');
    stmt.run(new Date().toISOString(), token);
  }
};

console.log('SQLite database initialized');

export default { prepare: () => ({}), query, exec: () => {}, db };
