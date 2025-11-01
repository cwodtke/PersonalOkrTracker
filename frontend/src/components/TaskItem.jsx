import { useState } from 'react';
import TaskForm from './TaskForm';
import './TaskItem.css';

export default function TaskItem({ task, objectives, healthMetrics, onUpdate, onDelete, onCreateSubtask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });

  const handleStatusChange = (e) => {
    const newStatus = e.target.checked ? 'done' : 'todo';
    onUpdate(task.id, { ...task, status: newStatus });
  };

  const handleSubtaskStatusChange = (subtaskId, checked) => {
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (subtask) {
      onUpdate(subtaskId, { ...subtask, status: checked ? 'done' : 'todo' });
    }
  };

  const handleSave = () => {
    onUpdate(task.id, editedTask);
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
        <input
          type="checkbox"
          checked={task.status === 'done'}
          onChange={handleStatusChange}
          className="task-checkbox"
        />

        <div className="task-content">
          {isEditing ? (
            <div className="task-edit">
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="task-title-edit"
              />
              <div className="task-edit-actions">
                <button onClick={handleSave} className="btn-small btn-primary">Save</button>
                <button onClick={() => setIsEditing(false)} className="btn-small btn-secondary">Cancel</button>
              </div>
            </div>
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

              {task.subtasks && task.subtasks.length > 0 && (
                <div className="subtasks-list">
                  {task.subtasks.map(subtask => (
                    <div key={subtask.id} className="subtask-item">
                      <input
                        type="checkbox"
                        checked={subtask.status === 'done'}
                        onChange={(e) => handleSubtaskStatusChange(subtask.id, e.target.checked)}
                        className="subtask-checkbox"
                      />
                      <span className={subtask.status === 'done' ? 'completed' : ''}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {showSubtaskForm && (
                <div className="subtask-form-container">
                  <TaskForm
                    objectives={objectives}
                    healthMetrics={healthMetrics}
                    onSubmit={handleAddSubtask}
                    onCancel={() => setShowSubtaskForm(false)}
                    parentTaskId={task.id}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="task-actions">
          {!isEditing && (
            <>
              <button onClick={() => setShowSubtaskForm(!showSubtaskForm)} className="btn-icon" title="Add subtask">
                +
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
    </div>
  );
}
