import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getCurrentObjectives,
  getHealthMetrics,
  getHeartbeatWork,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  sendTestEmail,
  updateKeyResult,
  updateHealthMetric
} from '../api';
import TaskItem from '../components/TaskItem';
import TaskForm from '../components/TaskForm';
import './Dashboard.css';

export default function Dashboard({ onLogout }) {
  const [objectives, setObjectives] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [heartbeatWork, setHeartbeatWork] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState(() => {
    // Load saved view from localStorage, default to 'upcoming' if not found
    return localStorage.getItem('dashboardView') || 'upcoming';
  });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingKR, setEditingKR] = useState(null);

  const handleViewChange = (newView) => {
    setView(newView);
    localStorage.setItem('dashboardView', newView);
  };

  const loadData = async () => {
    try {
      const [objData, metricsData, heartbeatData, tasksData] = await Promise.all([
        getCurrentObjectives(),
        getHealthMetrics(),
        getHeartbeatWork(),
        getTasks(view)
      ]);

      setObjectives(objData);
      setHealthMetrics(metricsData);
      setHeartbeatWork(heartbeatData);
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

  const handleUpdateHealthMetric = async (id, newStatus) => {
    try {
      const updated = await updateHealthMetric(id, { status: newStatus });
      setHealthMetrics(healthMetrics.map(m => m.id === id ? updated : m));
    } catch (error) {
      console.error('Error updating health metric:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'green': return '#27ae60';
      case 'yellow': return '#f39c12';
      case 'red': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'green': return '🟢';
      case 'yellow': return '🟡';
      case 'red': return '🔴';
      default: return '⚪';
    }
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
          <div className="header-title-section">
            <img src="/logo.png" alt="Logo" className="app-logo" />
            <div>
              <h1>Daily Task Planner</h1>
              <p className="date">{getCurrentDate()}</p>
            </div>
          </div>
          <div className="header-actions">
            <Link to="/history" className="btn-secondary">History</Link>
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
        <div className="top-modules-container">
          <section className="okr-section">
            <div className="section-header">
              <h2>Your Goals for {getCurrentQuarter()}</h2>
              <Link to="/okrs" className="btn-link">Manage Goals</Link>
            </div>

            {objectives.length === 0 ? (
              <div className="empty-state">
                <p>No goals set for this quarter.</p>
                <Link to="/okrs" className="btn-primary">Create Your First Goal</Link>
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

          {healthMetrics.length > 0 && (
            <section className="health-metrics-section">
              <div className="section-header">
                <h2>Health Metrics</h2>
                <Link to="/okrs" className="btn-link">Manage Metrics</Link>
              </div>

              <div className="health-metrics-grid">
                {healthMetrics.map(metric => (
                  <div key={metric.id} className="health-metric-card">
                    <div className="metric-name">{metric.name}</div>
                    <div className="metric-status-buttons">
                      {['green', 'yellow', 'red'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleUpdateHealthMetric(metric.id, status)}
                          className={`status-btn ${metric.status === status ? 'active' : ''}`}
                          style={{
                            backgroundColor: metric.status === status ? getStatusColor(status) : 'transparent',
                            borderColor: getStatusColor(status),
                            color: metric.status === status ? 'white' : getStatusColor(status)
                          }}
                          title={`Set status to ${status}`}
                        >
                          {getStatusEmoji(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

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
                heartbeatWork={heartbeatWork}
                onSubmit={handleCreateTask}
                onCancel={() => setShowTaskForm(false)}
              />
            )}
          </div>

          <div className="view-tabs">
            <button
              className={view === 'today' ? 'active' : ''}
              onClick={() => handleViewChange('today')}
            >
              Today
            </button>
            <button
              className={view === 'upcoming' ? 'active' : ''}
              onClick={() => handleViewChange('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={view === 'all' ? 'active' : ''}
              onClick={() => handleViewChange('all')}
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
                  heartbeatWork={heartbeatWork}
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
