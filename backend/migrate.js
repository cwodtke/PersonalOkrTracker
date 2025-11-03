import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JSON_BACKUP = path.join(__dirname, 'data.json.backup');

console.log('Starting migration from JSON to SQLite...');

// Read the JSON backup
const jsonData = JSON.parse(fs.readFileSync(JSON_BACKUP, 'utf8'));

// Migrate users
console.log(`Migrating ${jsonData.users.length} users...`);
jsonData.users.forEach(user => {
  try {
    db.query.createUser(user.id, user.email);
    if (user.timezone || user.email_time || user.email_enabled !== undefined) {
      db.query.updateUser(user.id, {
        timezone: user.timezone,
        email_time: user.email_time,
        email_enabled: user.email_enabled
      });
    }
  } catch (error) {
    console.error(`Error migrating user ${user.email}:`, error.message);
  }
});

// Migrate objectives
console.log(`Migrating ${jsonData.objectives.length} objectives...`);
jsonData.objectives.forEach(obj => {
  try {
    db.query.createObjective(obj);
  } catch (error) {
    console.error(`Error migrating objective ${obj.title}:`, error.message);
  }
});

// Migrate key results
console.log(`Migrating ${jsonData.key_results.length} key results...`);
jsonData.key_results.forEach(kr => {
  try {
    db.query.createKeyResult(kr);
  } catch (error) {
    console.error(`Error migrating key result ${kr.description}:`, error.message);
  }
});

// Migrate health metrics
console.log(`Migrating ${jsonData.health_metrics.length} health metrics...`);
jsonData.health_metrics.forEach(metric => {
  try {
    db.query.createHealthMetric(metric);
  } catch (error) {
    console.error(`Error migrating health metric ${metric.name}:`, error.message);
  }
});

// Migrate tasks (parent tasks first, then subtasks)
const parentTasks = jsonData.tasks.filter(t => !t.parent_task_id);
const subtasks = jsonData.tasks.filter(t => t.parent_task_id);

console.log(`Migrating ${parentTasks.length} parent tasks...`);
parentTasks.forEach(task => {
  try {
    db.query.createTask(task);
    // Update if completed
    if (task.completed_at) {
      db.query.updateTask(task.id, { completed_at: task.completed_at });
    }
  } catch (error) {
    console.error(`Error migrating task ${task.title}:`, error.message);
  }
});

console.log(`Migrating ${subtasks.length} subtasks...`);
subtasks.forEach(task => {
  try {
    db.query.createTask(task);
    if (task.completed_at) {
      db.query.updateTask(task.id, { completed_at: task.completed_at });
    }
  } catch (error) {
    console.error(`Error migrating subtask ${task.title}:`, error.message);
  }
});

// Migrate magic links
console.log(`Migrating ${jsonData.magic_links.length} magic links...`);
jsonData.magic_links.forEach(link => {
  try {
    db.query.createMagicLink(link);
    if (link.used_at) {
      db.query.useMagicLink(link.token);
    }
  } catch (error) {
    console.error(`Error migrating magic link:`, error.message);
  }
});

console.log('\n✅ Migration complete!');
console.log('Summary:');
console.log(`  - Users: ${jsonData.users.length}`);
console.log(`  - Objectives: ${jsonData.objectives.length}`);
console.log(`  - Key Results: ${jsonData.key_results.length}`);
console.log(`  - Health Metrics: ${jsonData.health_metrics.length}`);
console.log(`  - Tasks: ${jsonData.tasks.length}`);
console.log(`  - Magic Links: ${jsonData.magic_links.length}`);
