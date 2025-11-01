import { useState } from 'react';
import './TaskForm.css';

export default function TaskForm({ objectives, healthMetrics, onSubmit, onCancel, parentTaskId = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assignmentType, setAssignmentType] = useState('other');
  const [assignmentId, setAssignmentId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const taskData = {
      title,
      description: description || null,
      deadline: deadline || null,
      assignment_type: assignmentType === 'other' ? null : assignmentType,
      assignment_id: assignmentType === 'other' ? null : assignmentId,
      parent_task_id: parentTaskId
    };

    onSubmit(taskData);

    // Reset form
    setTitle('');
    setDescription('');
    setDeadline('');
    setAssignmentType('other');
    setAssignmentId('');
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-group">
        <input
          type="text"
          placeholder={parentTaskId ? "Subtask title..." : "Task title..."}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="form-group">
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="2"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Assign to:</label>
          <select
            value={assignmentType}
            onChange={(e) => {
              setAssignmentType(e.target.value);
              setAssignmentId('');
            }}
          >
            <option value="other">Other / Unaligned</option>
            <option value="objective">OKR</option>
            <option value="health_metric">Health Metric</option>
          </select>
        </div>

        {assignmentType === 'objective' && (
          <div className="form-group">
            <label>Select OKR:</label>
            <select
              value={assignmentId}
              onChange={(e) => setAssignmentId(e.target.value)}
              required
            >
              <option value="">Choose...</option>
              {objectives.map(obj => (
                <option key={obj.id} value={obj.id}>{obj.title}</option>
              ))}
            </select>
          </div>
        )}

        {assignmentType === 'health_metric' && (
          <div className="form-group">
            <label>Select Metric:</label>
            <select
              value={assignmentId}
              onChange={(e) => setAssignmentId(e.target.value)}
              required
            >
              <option value="">Choose...</option>
              {healthMetrics.map(metric => (
                <option key={metric.id} value={metric.id}>{metric.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Deadline:</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {parentTaskId ? 'Add Subtask' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
