import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import db from './database.js';
import { sendDailyEmail, testEmail } from './email.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Middleware to get user from session/token
const getCurrentUser = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  req.userId = userId;
  next();
};

// ============= AUTH ENDPOINTS =============

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;

  try {
    let user = db.query.getUserByEmail(email);

    if (!user) {
      const userId = uuidv4();
      db.query.createUser(userId, email);
      user = { id: userId, email, timezone: 'America/Los_Angeles', email_time: '09:00' };
    }

    // Create magic link
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    db.query.createMagicLink({
      id: uuidv4(),
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString()
    });

    res.json({ user, magicLink: `/auth/verify/${token}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/verify/:token', (req, res) => {
  const { token } = req.params;

  try {
    const link = db.query.getMagicLink(token);

    if (!link) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = db.query.getUserById(link.user_id);
    db.query.useMagicLink(token);

    res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= USER ENDPOINTS =============

app.get('/api/user', getCurrentUser, (req, res) => {
  try {
    const user = db.query.getUserById(req.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/settings', getCurrentUser, (req, res) => {
  const { timezone, email_time, email_enabled } = req.body;

  try {
    db.query.updateUser(req.userId, { timezone, email_time, email_enabled });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= OBJECTIVE ENDPOINTS =============

app.get('/api/objectives', getCurrentUser, (req, res) => {
  try {
    const objectives = db.query.getObjectives(req.userId);

    objectives.forEach(obj => {
      obj.keyResults = db.query.getKeyResultsByObjective(obj.id);
    });

    res.json(objectives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/objectives/current', getCurrentUser, (req, res) => {
  try {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const currentYear = now.getFullYear();

    const objectives = db.query.getCurrentObjectives(req.userId, currentQuarter, currentYear);

    objectives.forEach(obj => {
      obj.keyResults = db.query.getKeyResultsByObjective(obj.id);
    });

    res.json(objectives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/objectives/past', getCurrentUser, (req, res) => {
  try {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const currentYear = now.getFullYear();

    const objectives = db.query.getPastObjectives(req.userId, currentQuarter, currentYear);

    objectives.forEach(obj => {
      obj.keyResults = db.query.getKeyResultsByObjective(obj.id);
    });

    res.json(objectives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/objectives', getCurrentUser, (req, res) => {
  const { title, description, quarter, year, keyResults } = req.body;

  try {
    const objectiveId = uuidv4();

    db.query.createObjective({
      id: objectiveId,
      user_id: req.userId,
      title,
      description: description || null,
      quarter,
      year,
      status: 'active'
    });

    if (keyResults && keyResults.length > 0) {
      keyResults.forEach(kr => {
        db.query.createKeyResult({
          id: uuidv4(),
          objective_id: objectiveId,
          description: kr.description,
          type: kr.type || 'numeric',
          start_value: kr.start_value || 0,
          current_value: kr.start_value || 0,
          target_value: kr.target_value || 100,
          confidence_level: 5, // Default confidence: 5/10
          status: 'active'
        });
      });
    }

    const objective = db.query.getObjectiveById(objectiveId);
    objective.keyResults = db.query.getKeyResultsByObjective(objectiveId);

    res.json(objective);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/objectives/:id', getCurrentUser, (req, res) => {
  const { id } = req.params;
  const { title, description, status, quarter, year, keyResults } = req.body;

  try {
    // Update objective basic fields
    db.query.updateObjective(id, { title, description, status, quarter, year });

    // Update or create key results if provided
    if (keyResults && Array.isArray(keyResults)) {
      const existingKRs = db.query.getKeyResultsByObjective(id);
      const existingKRIds = existingKRs.map(kr => kr.id);
      const updatedKRIds = [];

      keyResults.forEach(kr => {
        if (kr.id && existingKRIds.includes(kr.id)) {
          // Update existing key result
          db.query.updateKeyResult(kr.id, {
            description: kr.description,
            type: kr.type,
            start_value: kr.start_value,
            target_value: kr.target_value,
            current_value: kr.current_value || kr.start_value || 0,
            confidence_level: kr.confidence_level !== undefined ? kr.confidence_level : 5
          });
          updatedKRIds.push(kr.id);
        } else if (!kr.id) {
          // Create new key result
          const newKR = db.query.createKeyResult({
            id: uuidv4(),
            objective_id: id,
            description: kr.description,
            type: kr.type,
            start_value: kr.start_value || 0,
            target_value: kr.target_value || 100,
            current_value: kr.current_value || kr.start_value || 0,
            confidence_level: 5,
            status: 'active'
          });
          updatedKRIds.push(newKR.id);
        }
      });

      // Delete key results that were removed
      existingKRIds.forEach(krId => {
        if (!updatedKRIds.includes(krId)) {
          db.query.deleteKeyResult(krId);
        }
      });
    }

    const objective = db.query.getObjectiveById(id);
    objective.keyResults = db.query.getKeyResultsByObjective(id);

    res.json(objective);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/objectives/:id', getCurrentUser, (req, res) => {
  const { id } = req.params;

  try {
    db.query.deleteObjective(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/key-results/:id', getCurrentUser, (req, res) => {
  const { id } = req.params;
  const { current_value, status, confidence_level } = req.body;

  try {
    const updates = {};
    if (current_value !== undefined) updates.current_value = current_value;
    if (status !== undefined) updates.status = status;
    if (confidence_level !== undefined) updates.confidence_level = confidence_level;

    db.query.updateKeyResult(id, updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= HEALTH METRICS ENDPOINTS =============

app.get('/api/health-metrics', getCurrentUser, (req, res) => {
  try {
    const metrics = db.query.getHealthMetrics(req.userId);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/health-metrics', getCurrentUser, (req, res) => {
  const { name, description, type, target } = req.body;

  try {
    const id = uuidv4();

    db.query.createHealthMetric({
      id,
      user_id: req.userId,
      name,
      description: description || null,
      type: type || 'counter',
      target: target || null,
      active: true
    });

    const metric = db.query.getHealthMetrics(req.userId).find(m => m.id === id);
    res.json(metric);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= TASK ENDPOINTS =============

app.get('/api/tasks', getCurrentUser, (req, res) => {
  const { view } = req.query;

  try {
    const tasks = db.query.getTasks(req.userId, view);

    tasks.forEach(task => {
      task.subtasks = db.query.getSubtasks(task.id);

      if (task.assignment_type === 'objective') {
        task.assignmentDetails = db.query.getObjectiveById(task.assignment_id);
        if (task.assignmentDetails) {
          task.assignmentDetails = { id: task.assignmentDetails.id, title: task.assignmentDetails.title };
        }
      } else if (task.assignment_type === 'health_metric') {
        const metric = db.query.getHealthMetrics(req.userId).find(m => m.id === task.assignment_id);
        if (metric) {
          task.assignmentDetails = { id: metric.id, title: metric.name };
        }
      }
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', getCurrentUser, (req, res) => {
  const { title, description, deadline, assignment_type, assignment_id, parent_task_id } = req.body;

  try {
    const id = uuidv4();

    db.query.createTask({
      id,
      user_id: req.userId,
      title,
      description: description || null,
      deadline: deadline || null,
      assignment_type: assignment_type || null,
      assignment_id: assignment_id || null,
      parent_task_id: parent_task_id || null,
      status: 'todo'
    });

    const task = db.query.getTaskById(id);
    task.subtasks = [];

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', getCurrentUser, (req, res) => {
  const { id } = req.params;
  const { title, description, deadline, status, assignment_type, assignment_id } = req.body;

  try {
    const completed_at = status === 'done' ? new Date().toISOString() : null;

    db.query.updateTask(id, {
      title,
      description,
      deadline,
      status,
      assignment_type,
      assignment_id,
      completed_at
    });

    const task = db.query.getTaskById(id);
    task.subtasks = db.query.getSubtasks(id);

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', getCurrentUser, (req, res) => {
  const { id } = req.params;

  try {
    db.query.deleteTask(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= EMAIL ENDPOINTS =============

app.post('/api/email/test', getCurrentUser, (req, res) => {
  try {
    testEmail(req.userId);
    res.json({ success: true, message: 'Test email queued (check console)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= SCHEDULING =============

cron.schedule('* * * * *', () => {
  // Get all users with email enabled
  // Note: In real implementation, you'd get users from the database
  // For this prototype, we'll skip the actual scheduling
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Daily email cron job scheduled');
});
