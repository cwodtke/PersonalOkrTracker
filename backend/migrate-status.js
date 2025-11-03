import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.sqlite');

console.log('Starting task status migration...');

const db = new Database(DB_FILE);

try {
  // Update all 'todo' tasks to 'not_started'
  const updateTodo = db.prepare("UPDATE tasks SET status = 'not_started' WHERE status = 'todo'");
  const todoResult = updateTodo.run();
  console.log(`Updated ${todoResult.changes} tasks from 'todo' to 'not_started'`);

  // Update all 'cancelled' tasks to 'done' (since we're removing cancelled status)
  const updateCancelled = db.prepare("UPDATE tasks SET status = 'done' WHERE status = 'cancelled'");
  const cancelledResult = updateCancelled.run();
  console.log(`Updated ${cancelledResult.changes} tasks from 'cancelled' to 'done'`);

  // Show current status counts
  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM tasks
    GROUP BY status
  `).all();

  console.log('\nCurrent task status counts:');
  statusCounts.forEach(({ status, count }) => {
    console.log(`  ${status}: ${count}`);
  });

  console.log('\nMigration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}

db.close();
