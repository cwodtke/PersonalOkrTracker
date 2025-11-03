import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getObjectives, createObjective, updateObjective, deleteObjective, getHealthMetrics, createHealthMetric, updateHealthMetric, deleteHealthMetric, getHeartbeatWork, createHeartbeatWork, updateHeartbeatWork, deleteHeartbeatWork, updateKeyResult } from '../api';
import OKRQualityChecker from '../components/OKRQualityChecker';
import './ManageOKRs.css';

export default function ManageOKRs({ onLogout }) {
  const [objectives, setObjectives] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [heartbeatWork, setHeartbeatWork] = useState([]);
  const [showOKRForm, setShowOKRForm] = useState(false);
  const [showMetricForm, setShowMetricForm] = useState(false);
  const [showHeartbeatForm, setShowHeartbeatForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingKR, setEditingKR] = useState(null);
  const [editingOKR, setEditingOKR] = useState(null);

  const [newOKR, setNewOKR] = useState({
    title: '',
    quarter: Math.floor(new Date().getMonth() / 3) + 1,
    year: new Date().getFullYear(),
    keyResults: [{ description: '', type: 'numeric', start_value: 0, target_value: 100 }]
  });

  const [newMetric, setNewMetric] = useState({
    name: '',
    description: '',
    status: 'green',
    notes: ''
  });

  const [newHeartbeat, setNewHeartbeat] = useState({
    name: '',
    description: '',
    category: ''
  });

  const [editingMetric, setEditingMetric] = useState(null);
  const [editingHeartbeat, setEditingHeartbeat] = useState(null);
  const [editingNotes, setEditingNotes] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [objData, metricsData, heartbeatData] = await Promise.all([
        getObjectives(),
        getHealthMetrics(),
        getHeartbeatWork()
      ]);

      setObjectives(objData);
      setHealthMetrics(metricsData);
      setHeartbeatWork(heartbeatData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOKR = async (e) => {
    e.preventDefault();

    try {
      const created = await createObjective(newOKR);
      setObjectives([created, ...objectives]);
      setShowOKRForm(false);
      setNewOKR({
        title: '',
        quarter: Math.floor(new Date().getMonth() / 3) + 1,
        year: new Date().getFullYear(),
        keyResults: [{ description: '', type: 'numeric', start_value: 0, target_value: 100 }]
      });
    } catch (error) {
      console.error('Error creating OKR:', error);
    }
  };

  const handleEditOKR = (obj) => {
    setEditingOKR(obj.id);
    setNewOKR({
      title: obj.title,
      quarter: obj.quarter,
      year: obj.year,
      keyResults: obj.keyResults.map(kr => ({
        id: kr.id,
        description: kr.description,
        type: kr.type,
        start_value: kr.start_value || 0,
        target_value: kr.target_value || 100,
        current_value: kr.current_value
      }))
    });
    setShowOKRForm(true);
  };

  const handleUpdateOKR = async (e) => {
    e.preventDefault();

    try {
      const updated = await updateObjective(editingOKR, newOKR);
      setObjectives(objectives.map(obj => obj.id === editingOKR ? updated : obj));
      setShowOKRForm(false);
      setEditingOKR(null);
      setNewOKR({
        title: '',
        quarter: Math.floor(new Date().getMonth() / 3) + 1,
        year: new Date().getFullYear(),
        keyResults: [{ description: '', type: 'numeric', start_value: 0, target_value: 100 }]
      });
    } catch (error) {
      console.error('Error updating OKR:', error);
    }
  };

  const handleCreateMetric = async (e) => {
    e.preventDefault();

    try {
      const created = await createHealthMetric(newMetric);
      setHealthMetrics([...healthMetrics, created]);
      setShowMetricForm(false);
      setNewMetric({
        name: '',
        description: '',
        status: 'green',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating metric:', error);
    }
  };

  const handleUpdateMetric = async (id, updates) => {
    try {
      const updated = await updateHealthMetric(id, updates);
      setHealthMetrics(healthMetrics.map(m => m.id === id ? updated : m));
      setEditingMetric(null);
      // Clear the editing notes for this metric
      const newEditingNotes = { ...editingNotes };
      delete newEditingNotes[id];
      setEditingNotes(newEditingNotes);
    } catch (error) {
      console.error('Error updating metric:', error);
    }
  };

  const handleDeleteMetric = async (id) => {
    if (!confirm('Are you sure you want to delete this health metric?')) return;

    try {
      await deleteHealthMetric(id);
      setHealthMetrics(healthMetrics.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting metric:', error);
    }
  };

  const handleCreateHeartbeat = async (e) => {
    e.preventDefault();

    try {
      const created = await createHeartbeatWork(newHeartbeat);
      setHeartbeatWork([...heartbeatWork, created]);
      setShowHeartbeatForm(false);
      setNewHeartbeat({
        name: '',
        description: '',
        category: ''
      });
    } catch (error) {
      console.error('Error creating heartbeat work:', error);
    }
  };

  const handleUpdateHeartbeat = async (id, updates) => {
    try {
      const updated = await updateHeartbeatWork(id, updates);
      setHeartbeatWork(heartbeatWork.map(h => h.id === id ? updated : h));
      setEditingHeartbeat(null);
    } catch (error) {
      console.error('Error updating heartbeat work:', error);
    }
  };

  const handleDeleteHeartbeat = async (id) => {
    if (!confirm('Are you sure you want to delete this heartbeat work?')) return;

    try {
      await deleteHeartbeatWork(id);
      setHeartbeatWork(heartbeatWork.filter(h => h.id !== id));
    } catch (error) {
      console.error('Error deleting heartbeat work:', error);
    }
  };

  const addKeyResult = () => {
    setNewOKR({
      ...newOKR,
      keyResults: [...newOKR.keyResults, { description: '', type: 'numeric', start_value: 0, target_value: 100 }]
    });
  };

  const updateKeyResult = (index, field, value) => {
    const updated = [...newOKR.keyResults];
    updated[index] = { ...updated[index], [field]: value };
    setNewOKR({ ...newOKR, keyResults: updated });
  };

  const removeKeyResult = (index) => {
    setNewOKR({
      ...newOKR,
      keyResults: newOKR.keyResults.filter((_, i) => i !== index)
    });
  };

  const handleDeleteOKR = async (id) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await deleteObjective(id);
      setObjectives(objectives.filter(obj => obj.id !== id));
    } catch (error) {
      console.error('Error deleting OKR:', error);
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
      const objData = await getObjectives();
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

  const getCurrentQuarter = () => {
    const month = new Date().getMonth();
    const quarter = Math.floor(month / 3) + 1;
    const year = new Date().getFullYear();
    return `Q${quarter} ${year}`;
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="manage-okrs">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1>Manage Goals & Health Metrics</h1>
            <p>Define your quarterly objectives and personal wellness goals</p>
          </div>
          <div className="header-actions">
            <Link to="/" className="btn-secondary">Back to Dashboard</Link>
            <button onClick={onLogout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <div className="manage-content">
        <section className="okrs-section">
          <div className="section-header">
            <h2>Objectives & Key Results</h2>
            {!showOKRForm && (
              <button onClick={() => setShowOKRForm(true)} className="btn-primary">
                + Add Goal
              </button>
            )}
          </div>

          {showOKRForm && (
            <form onSubmit={editingOKR ? handleUpdateOKR : handleCreateOKR} className="okr-form card">
              <h3>{editingOKR ? 'Edit Goal' : 'Create New Goal'}</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Quarter</label>
                  <select
                    value={newOKR.quarter}
                    onChange={(e) => setNewOKR({ ...newOKR, quarter: parseInt(e.target.value) })}
                  >
                    <option value="1">Q1</option>
                    <option value="2">Q2</option>
                    <option value="3">Q3</option>
                    <option value="4">Q4</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={newOKR.year}
                    onChange={(e) => setNewOKR({ ...newOKR, year: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Objective *</label>
                <input
                  type="text"
                  value={newOKR.title}
                  onChange={(e) => setNewOKR({ ...newOKR, title: e.target.value })}
                  placeholder="e.g., Improve product engagement"
                  required
                />
              </div>

              <div className="key-results-section">
                <h4>Key Results</h4>

                {newOKR.keyResults.map((kr, index) => (
                  <div key={index} className="key-result-form">
                    <div className="form-group">
                      <input
                        type="text"
                        value={kr.description}
                        onChange={(e) => updateKeyResult(index, 'description', e.target.value)}
                        placeholder="e.g., Increase DAU by 20%"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <select
                          value={kr.type}
                          onChange={(e) => updateKeyResult(index, 'type', e.target.value)}
                        >
                          <option value="numeric">Numeric</option>
                          <option value="binary">Binary (Yes/No)</option>
                        </select>
                      </div>

                      {kr.type === 'numeric' && (
                        <>
                          <div className="form-group">
                            <input
                              type="number"
                              value={kr.start_value}
                              onChange={(e) => updateKeyResult(index, 'start_value', parseFloat(e.target.value))}
                              placeholder="Start"
                            />
                          </div>

                          <div className="form-group">
                            <input
                              type="number"
                              value={kr.target_value}
                              onChange={(e) => updateKeyResult(index, 'target_value', parseFloat(e.target.value))}
                              placeholder="Target"
                            />
                          </div>
                        </>
                      )}

                      {newOKR.keyResults.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeKeyResult(index)}
                          className="btn-icon"
                          title="Remove"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button type="button" onClick={addKeyResult} className="btn-secondary btn-small">
                  + Add Key Result
                </button>
              </div>

              <OKRQualityChecker
                objective={newOKR.title}
                keyResults={newOKR.keyResults}
              />

              <div className="form-actions">
                <button type="button" onClick={() => {
                  setShowOKRForm(false);
                  setEditingOKR(null);
                  setNewOKR({
                    title: '',
                    quarter: Math.floor(new Date().getMonth() / 3) + 1,
                    year: new Date().getFullYear(),
                    keyResults: [{ description: '', type: 'numeric', start_value: 0, target_value: 100 }]
                  });
                }} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingOKR ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          )}

          <div className="objectives-list">
            {objectives.length === 0 ? (
              <div className="empty-state">
                <p>No goals created yet. Add your first one to get started!</p>
              </div>
            ) : (
              objectives.map(obj => (
                <div key={obj.id} className="objective-card card">
                  <div className="card-header">
                    <div>
                      <h3>{obj.title}</h3>
                      <span className="quarter-badge">Q{obj.quarter} {obj.year}</span>
                    </div>
                    <div className="card-actions">
                      <button onClick={() => handleEditOKR(obj)} className="btn-icon" title="Edit">
                        ✏️
                      </button>
                      <button onClick={() => handleDeleteOKR(obj.id)} className="btn-icon" title="Delete">
                        🗑️
                      </button>
                    </div>
                  </div>

                  {obj.description && <p className="objective-description">{obj.description}</p>}

                  {obj.keyResults && obj.keyResults.length > 0 && (
                    <div className="key-results">
                      <h4>Key Results:</h4>
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
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="metrics-section">
          <div className="section-header">
            <h2>Health Metrics</h2>
            {!showMetricForm && (
              <button onClick={() => setShowMetricForm(true)} className="btn-primary">
                + Add Metric
              </button>
            )}
          </div>

          {showMetricForm && (
            <form onSubmit={handleCreateMetric} className="metric-form card">
              <h3>Create Health Metric</h3>
              <p className="form-hint">
                e.g. finances, physical health, mental health
              </p>

              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newMetric.name}
                  onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                  placeholder="e.g., Exercise, Sleep, Finances"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={newMetric.description}
                  onChange={(e) => setNewMetric({ ...newMetric, description: e.target.value })}
                  placeholder="What does this metric track?"
                  rows="2"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowMetricForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Metric
                </button>
              </div>
            </form>
          )}

          <div className="metrics-list">
            {healthMetrics.length === 0 ? (
              <div className="empty-state">
                <p>No health metrics yet. Add one to track your wellness!</p>
              </div>
            ) : (
              healthMetrics.map(metric => (
                <div key={metric.id} className="metric-card card">
                  <div className="metric-header">
                    <div>
                      <h3>{metric.name}</h3>
                    </div>
                    <button
                      onClick={() => handleDeleteMetric(metric.id)}
                      className="btn-icon"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>

                  {metric.description && <p className="metric-description">{metric.description}</p>}

                  <div className="metric-status-section">
                    <label>Current Status:</label>
                    <div className="status-buttons">
                      {['green', 'yellow', 'red'].map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            handleUpdateMetric(metric.id, {
                              status,
                              notes: editingNotes[metric.id] !== undefined ? editingNotes[metric.id] : metric.notes
                            });
                          }}
                          className={`status-btn ${metric.status === status ? 'active' : ''}`}
                          style={{
                            backgroundColor: metric.status === status ? getStatusColor(status) : 'transparent',
                            borderColor: getStatusColor(status),
                            color: metric.status === status ? 'white' : getStatusColor(status)
                          }}
                        >
                          {getStatusEmoji(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>

                    <div className="notes-section">
                      <label>Notes (Optional):</label>
                      <textarea
                        value={editingNotes[metric.id] !== undefined ? editingNotes[metric.id] : (metric.notes || '')}
                        onChange={(e) => setEditingNotes({ ...editingNotes, [metric.id]: e.target.value })}
                        placeholder="What's affecting this metric this week?"
                        rows="2"
                        className="notes-input"
                      />
                    </div>
                  </div>

                  {metric.last_updated && (
                    <div className="metric-footer">
                      <small>Last updated: {new Date(metric.last_updated).toLocaleDateString()}</small>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="heartbeat-section">
          <div className="section-header">
            <h2>Heartbeat Work</h2>
            {!showHeartbeatForm && (
              <button onClick={() => setShowHeartbeatForm(true)} className="btn-primary">
                + Add Heartbeat Work
              </button>
            )}
          </div>

          {showHeartbeatForm && (
            <form onSubmit={handleCreateHeartbeat} className="heartbeat-form card">
              <h3>Add Heartbeat Work</h3>
              <p>Track ongoing, recurring work like classes or regular commitments</p>

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newHeartbeat.name}
                  onChange={(e) => setNewHeartbeat({ ...newHeartbeat, name: e.target.value })}
                  placeholder="e.g., Teaching my classes"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={newHeartbeat.description}
                  onChange={(e) => setNewHeartbeat({ ...newHeartbeat, description: e.target.value })}
                  placeholder="Additional details..."
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Category (optional)</label>
                <input
                  type="text"
                  value={newHeartbeat.category}
                  onChange={(e) => setNewHeartbeat({ ...newHeartbeat, category: e.target.value })}
                  placeholder="e.g., Work, Teaching, Admin"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowHeartbeatForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Heartbeat Work
                </button>
              </div>
            </form>
          )}

          <div className="heartbeat-list">
            {heartbeatWork.length === 0 ? (
              <div className="empty-state">
                <p>No heartbeat work added yet. Add recurring work to track daily tasks.</p>
              </div>
            ) : (
              heartbeatWork.map(work => (
                <div key={work.id} className="heartbeat-card card">
                  <div className="card-header">
                    {editingHeartbeat === work.id ? (
                      <input
                        type="text"
                        defaultValue={work.name}
                        onBlur={(e) => handleUpdateHeartbeat(work.id, { name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateHeartbeat(work.id, { name: e.target.value });
                          } else if (e.key === 'Escape') {
                            setEditingHeartbeat(null);
                          }
                        }}
                        autoFocus
                        className="edit-input"
                      />
                    ) : (
                      <h3 onClick={() => setEditingHeartbeat(work.id)} className="editable-title">
                        {work.name}
                      </h3>
                    )}
                    <button
                      onClick={() => handleDeleteHeartbeat(work.id)}
                      className="btn-icon"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>

                  {work.description && (
                    <p className="heartbeat-description">{work.description}</p>
                  )}

                  {work.category && (
                    <div className="heartbeat-category">
                      <span className="category-badge">{work.category}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
