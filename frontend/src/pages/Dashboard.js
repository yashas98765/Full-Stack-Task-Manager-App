import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, updateTask, deleteTask, toggleTask } from '../utils/api';

function EditModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      await onSave(task._id, form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit Task</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input form-textarea" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input filter-select" value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-input filter-select" value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input type="date" className="form-input" value={form.dueDate}
            onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading || !form.title.trim()}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete, onEdit }) {
  const priorityClass = `badge badge-priority-${task.priority}`;
  const statusClass = `badge badge-status-${task.status}`;
  const isCompleted = task.status === 'completed';

  return (
    <div className={`task-card ${isCompleted ? 'completed-card' : ''}`}>
      <div className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
        onClick={() => onToggle(task._id)} title="Toggle complete">
        {isCompleted && '✓'}
      </div>
      <div className="task-info">
        <div className={`task-title ${isCompleted ? 'done' : ''}`}>{task.title}</div>
        {task.description && <div className="task-desc">{task.description}</div>}
        <div className="task-meta">
          <span className={priorityClass}>{task.priority}</span>
          <span className={statusClass}>{task.status.replace('-', ' ')}</span>
          {task.dueDate && (
            <span className="task-date">
              Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
      <div className="task-actions">
        <button className="icon-btn" onClick={() => onEdit(task)} title="Edit">✏️</button>
        <button className="icon-btn delete" onClick={() => onDelete(task._id)} title="Delete">🗑</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterPriority !== 'all') params.priority = filterPriority;
      if (search) params.search = search;
      const res = await getTasks(params);
      setTasks(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, search]);

  useEffect(() => {
    const delay = setTimeout(loadTasks, 300);
    return () => clearTimeout(delay);
  }, [loadTasks]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setAddError('Title is required');
    setAddError('');
    setAdding(true);
    try {
      const res = await createTask(form);
      setTasks(prev => [res.data, ...prev]);
      setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add task');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleTask(id);
      setTasks(prev => prev.map(t => t._id === id ? res.data : t));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (e) { console.error(e); }
  };

  const handleUpdate = async (id, data) => {
    const res = await updateTask(id, data);
    setTasks(prev => prev.map(t => t._id === id ? res.data : t));
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-logo">
          <div className="nav-logo-icon">✓</div>
          <span className="nav-logo-name">TaskFlow</span>
        </div>
        <div className="nav-right">
          <div className="nav-user">
            <div className="nav-avatar">{initials}</div>
            <span>{user?.name}</span>
          </div>
          <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }} onClick={logout}>
            Sign out
          </button>
        </div>
      </nav>

      <div className="dashboard-body">
        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Tasks</div>
            <div className="stat-value total">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">To Do</div>
            <div className="stat-value todo">{stats.todo}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Progress</div>
            <div className="stat-value in-progress">{stats.inProgress}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value completed">{stats.completed}</div>
          </div>
        </div>

        <div className="dashboard-main">
          {/* Add Task Panel */}
          <div className="panel">
            <div className="panel-header">Add New Task</div>
            <div className="panel-body">
              <form className="add-form" onSubmit={handleAdd}>
                {addError && <div className="error-msg">{addError}</div>}
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" placeholder="What needs to be done?"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input form-textarea" placeholder="Optional details…"
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-input" value={form.priority}
                      onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-input"
                      value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={adding}>
                  {adding ? 'Adding…' : '+ Add Task'}
                </button>
              </form>
            </div>
          </div>

          {/* Tasks Panel */}
          <div className="panel">
            <div className="panel-header">
              <span>My Tasks</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{tasks.length} tasks</span>
            </div>

            <div className="filters-bar">
              <input className="form-input filter-input" placeholder="Search tasks…"
                value={search} onChange={e => setSearch(e.target.value)} />
              <select className="form-input filter-select" style={{ width: 130 }}
                value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select className="form-input filter-select" style={{ width: 130 }}
                value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="task-empty">
                <div className="task-empty-icon">📋</div>
                <div style={{ fontWeight: 500, marginBottom: 6 }}>No tasks found</div>
                <div style={{ fontSize: 13 }}>Add a task to get started</div>
              </div>
            ) : (
              <div className="task-list">
                {tasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onEdit={setEditingTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {editingTask && (
        <EditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}
