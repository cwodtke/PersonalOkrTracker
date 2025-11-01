import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getCurrentObjectives,
  getHealthMetrics,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  sendTestEmail,
  updateKeyResult
} from '../api';
import TaskItem from '../components/TaskItem';
import TaskForm from '../components/TaskForm';
import './Dashboard.css';

export default function Dashboard({ onLogout }) {
  const [objectives, setObjectives] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('today');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingKR, setEditingKR] = useState(null);

  const loadData = async () => {
    try {
      const [objData, metricsData, tasksData] = await Promise.all([
        getCurrentObjectives(),
        getHealthMetrics(),
        getTasks(view)
      ]);

      setObjectives(objData);
      setHealthMetrics(metricsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [view]);

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await createTask(taskData);
      setTasks([...tasks, newTask]);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (id, updates) => {
    try {
      const updatedTask = await updateTask(id, updates);
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTestEmail = async () => {
    try {
      await sendTestEmail();
      alert('Test email sent! Check the backend console to see the email content.');
    } catch (error) {
      console.error('Error sending test email:', error);
    }
  };

  const handleUpdateKeyResult = async (krId, field, newValue) => {
    try {
      const updates = {};
      if (field === 'confidence') {
        const confidence = parseInt(newValue);
        if (confidence < 0 || confidence > 10) return;
        updates.confidence_level = confidence;
      } else if (field === 'current_value') {
        updates.current_value = parseFloat(newValue);
      }

      await updateKeyResult(krId, updates);
      // Reload objectives to get updated data
      const objData = await getCurrentObjectives();
      setObjectives(objData);
      setEditingKR(null);
    } catch (error) {
      console.error('Error updating key result:', error);
    }
  };

  const getConfidenceColor = (level) => {
    const confidence = level || 5;
    if (confidence >= 7) return '#27ae60'; // Green
    if (confidence >= 4) return '#f39c12'; // Yellow/Orange
    return '#e74c3c'; // Red
  };

  const getConfidenceLabel = (level) => {
    const confidence = level || 5;
    if (confidence >= 8) return 'High';
    if (confidence >= 5) return 'Medium';
    return 'Low';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCurrentQuarter = () => {
    const month = new Date().getMonth();
    const quarter = Math.floor(month / 3) + 1;
    const year = new Date().getFullYear();
    return `Q${quarter} ${year}`;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Daily Task Planner</h1>
            <p className="date">{getCurrentDate()}</p>
          </div>
          <div className="header-actions">
            <Link to="/history" className="btn-link">History</Link>
            <button onClick={handleTestEmail} className="btn-secondary">
              Test Email
            </button>
            <button onClick={onLogout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="okr-section">
          <div className="section-header">
            <h2>Your OKRs for {getCurrentQuarter()}</h2>
            <Link to="/okrs" className="btn-link">Manage OKRs</Link>
          </div>

          {objectives.length === 0 ? (
            <div className="empty-state">
              <p>No OKRs set for this quarter.</p>
              <Link to="/okrs" className="btn-primary">Create Your First OKR</Link>
            </div>
          ) : (
            <div className="objectives-list">
              {objectives.map(obj => (
                <div key={obj.id} className="objective-card">
                  <h3>{obj.title}</h3>
                  {obj.keyResults && obj.keyResults.length > 0 && (
                    <div className="key-results-list">
                      {obj.keyResults.map(kr => (
                        <div key={kr.id} className="key-result-item">
                          <div className="kr-description">{kr.description}</div>
                          <div className="kr-confidence">
                            <span className="confidence-label">Confidence:</span>
                            {editingKR === kr.id ? (
                              <input
                                type="number"
                                min="0"
                                max="10"
                                defaultValue={kr.confidence_level || 5}
                                onBlur={(e) => handleUpdateKeyResult(kr.id, 'confidence', e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateKeyResult(kr.id, 'confidence', e.target.value);
                                  } else if (e.key === 'Escape') {
                                    setEditingKR(null);
                                  }
                                }}
                                autoFocus
                                className="confidence-input"
                              />
                            ) : (
                              <span
                                onClick={() => setEditingKR(kr.id)}
                                className="confidence-value"
                                style={{
                                  backgroundColor: getConfidenceColor(kr.confidence_level),
                                  color: 'white'
                                }}
                                title="Click to edit confidence (0-10)"
                              >
                                {kr.confidence_level !== undefined ? kr.confidence_level : 5}/10
                              </span>
                            )}
                            <span
                              className="confidence-status"
                              style={{ color: getConfidenceColor(kr.confidence_level) }}
                            >
                              {getConfidenceLabel(kr.confidence_level)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="tasks-section">
          <div className="section-header">
            <h2>What are you working on today?</h2>
          </div>

          <div className="task-input-container">
            {!showTaskForm ? (
              <button
                onClick={() => setShowTaskForm(true)}
                className="add-task-btn"
              >
                + Add a task...
              </button>
            ) : (
              <TaskForm
                objectives={objectives}
                healthMetrics={healthMetrics}
                onSubmit={handleCreateTask}
                onCancel={() => setShowTaskForm(false)}
              />
            )}
          </div>

          <div className="view-tabs">
            <button
              className={view === 'today' ? 'active' : ''}
              onClick={() => setView('today')}
            >
              Today
            </button>
            <button
              className={view === 'upcoming' ? 'active' : ''}
              onClick={() => setView('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={view === 'all' ? 'active' : ''}
              onClick={() => setView('all')}
            >
              All Tasks
            </button>
          </div>

          <div className="tasks-list">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <p>No tasks yet. Add one to get started!</p>
              </div>
            ) : (
              tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  objectives={objectives}
                  healthMetrics={healthMetrics}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  onCreateSubtask={handleCreateTask}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
