import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPastObjectives, getTasks } from '../api';
import './History.css';

export default function History({ onLogout }) {
  const [pastObjectives, setPastObjectives] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('tasks'); // 'tasks' or 'okrs'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [objectives, tasks] = await Promise.all([
        getPastObjectives(),
        getTasks('completed')
      ]);

      setPastObjectives(objectives);
      setCompletedTasks(tasks);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (level) => {
    const confidence = level || 5;
    if (confidence >= 7) return '#27ae60';
    if (confidence >= 4) return '#f39c12';
    return '#e74c3c';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  return (
    <div className="history-page">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1>📚 History</h1>
            <p>Your past OKRs and completed tasks</p>
          </div>
          <div className="header-actions">
            <Link to="/" className="btn-secondary">Back to Dashboard</Link>
            <button onClick={onLogout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <div className="history-content">
        <div className="view-toggle">
          <button
            className={view === 'tasks' ? 'active' : ''}
            onClick={() => setView('tasks')}
          >
            Completed Tasks ({completedTasks.length})
          </button>
          <button
            className={view === 'okrs' ? 'active' : ''}
            onClick={() => setView('okrs')}
          >
            Past OKRs ({pastObjectives.length})
          </button>
        </div>

        {view === 'tasks' && (
          <div className="completed-tasks-section">
            {completedTasks.length === 0 ? (
              <div className="empty-state">
                <p>No completed tasks yet. Keep working on your goals!</p>
              </div>
            ) : (
              <div className="tasks-timeline">
                {completedTasks.map(task => (
                  <div key={task.id} className="history-task-item">
                    <div className="task-status-badge">
                      {task.status === 'done' ? '✓' : '✕'}
                    </div>
                    <div className="task-details">
                      <h3 className={task.status === 'cancelled' ? 'cancelled' : ''}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      <div className="task-meta">
                        <span className="completion-date">
                          {task.status === 'done' ? 'Completed' : 'Cancelled'}: {formatDate(task.completed_at)}
                        </span>
                        {task.assignmentDetails && (
                          <span className="task-assignment">
                            → {task.assignmentDetails.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'okrs' && (
          <div className="past-okrs-section">
            {pastObjectives.length === 0 ? (
              <div className="empty-state">
                <p>No past OKRs yet. This is your first quarter!</p>
              </div>
            ) : (
              <div className="okrs-by-quarter">
                {pastObjectives.map(obj => (
                  <div key={obj.id} className="past-okr-card">
                    <div className="okr-quarter-badge">
                      Q{obj.quarter} {obj.year}
                    </div>
                    <h3>{obj.title}</h3>
                    {obj.description && (
                      <p className="okr-description">{obj.description}</p>
                    )}
                    {obj.keyResults && obj.keyResults.length > 0 && (
                      <div className="key-results-archive">
                        <h4>Key Results:</h4>
                        {obj.keyResults.map(kr => (
                          <div key={kr.id} className="kr-archive-item">
                            <div className="kr-description">{kr.description}</div>
                            <div className="kr-final-status">
                              <span className="confidence-label">Final Confidence:</span>
                              <span
                                className="confidence-badge"
                                style={{
                                  backgroundColor: getConfidenceColor(kr.confidence_level),
                                  color: 'white'
                                }}
                              >
                                {kr.confidence_level !== undefined ? kr.confidence_level : 5}/10
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
          </div>
        )}
      </div>
    </div>
  );
}
