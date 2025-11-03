import { useState } from 'react';
import TaskForm from './TaskForm';
import './TaskItem.css';

export default function TaskItem({ task, objectives, healthMetrics, heartbeatWork, onUpdate, onDelete, onCreateSubtask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    onUpdate(task.id, { ...task, status: newStatus });
  };

  const handleSubtaskStatusChange = (subtaskId, newStatus) => {
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (subtask) {
      onUpdate(subtaskId, { ...subtask, status: newStatus });
    }
  };

  const handleSave = (taskData) => {
    onUpdate(task.id, { ...task, ...taskData });
    setIsEditing(false);
  };

  const handleAddSubtask = (subtaskData) => {
    onCreateSubtask(subtaskData);
    setShowSubtaskForm(false);
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return <span className="deadline today">Today</span>;
    }

    return (
      <span className="deadline">
        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    );
  };

  const getAssignmentIcon = () => {
    if (task.assignment_type === 'objective') return '🎯';
    if (task.assignment_type === 'health_metric') return '💪';
    if (task.assignment_type === 'heartbeat_work') return '🔄';
    return '📋';
  };

  const getAssignmentLabel = () => {
    if (task.assignmentDetails) {
      return task.assignmentDetails.title || task.assignmentDetails.name;
    }
    return 'Other';
  };

  return (
    <div className={`task-item ${task.status === 'done' ? 'completed' : ''}`}>
      <div className="task-main">
        <select
          value={task.status || 'not_started'}
          onChange={handleStatusChange}
          className="task-status-select"
        >
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <div className="task-content">
          {isEditing ? (
            <TaskForm
              objectives={objectives}
              healthMetrics={healthMetrics}
              heartbeatWork={heartbeatWork}
              onSubmit={handleSave}
              onCancel={() => setIsEditing(false)}
              initialTask={task}
            />
          ) : (
            <>
              <div className="task-title">{task.title}</div>
              {task.description && <div className="task-description">{task.description}</div>}

              <div className="task-meta">
                <span className="task-assignment">
                  {getAssignmentIcon()} {getAssignmentLabel()}
                </span>
                {task.deadline && formatDeadline(task.deadline)}
              </div>
            </>
          )}
        </div>

        <div className="task-actions">
          {!isEditing && (
            <>
              <button onClick={() => setShowSubtaskForm(!showSubtaskForm)} className="btn-add-subtask">
                + Add subtask
              </button>
              <button onClick={() => setIsEditing(true)} className="btn-icon" title="Edit">
                ✏️
              </button>
              <button onClick={() => onDelete(task.id)} className="btn-icon" title="Delete">
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subtasks section - full width below main task */}
      {!isEditing && (
        <>
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="subtasks-list">
              {task.subtasks.map(subtask => (
                <div key={subtask.id} className="subtask-item">
                  <select
                    value={subtask.status || 'not_started'}
                    onChange={(e) => handleSubtaskStatusChange(subtask.id, e.target.value)}
                    className="subtask-status-select"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <span className={subtask.status === 'done' ? 'completed' : ''}>
                    {subtask.title}
                  </span>
                  {subtask.deadline && (
                    <span className="subtask-deadline">
                      {formatDeadline(subtask.deadline)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {showSubtaskForm && (
            <div className="subtask-form-container">
              <TaskForm
                objectives={objectives}
                healthMetrics={healthMetrics}
                heartbeatWork={heartbeatWork}
                onSubmit={handleAddSubtask}
                onCancel={() => setShowSubtaskForm(false)}
                parentTaskId={task.id}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
