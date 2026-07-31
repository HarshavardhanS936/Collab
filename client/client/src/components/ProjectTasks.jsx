import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { fetchProjectTasks, createTask, updateTask, toggleTaskStatus, deleteTask } from '../api/task.api';
import { generateTasks } from '../api/ai.api';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import Button from './Button';
import Input from './Input';

export default function ProjectTasks({ projectId, projectTitle, isMember, isOwner }) {
  const { showToast } = useToast();
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit task state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDate, setEditDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // AI Task Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState(null);
  const [isSavingGenerated, setIsSavingGenerated] = useState(false);
  const [aiError, setAiError] = useState(null);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchProjectTasks(projectId);
      const data = res.data || res;
      
      if (data.tasks && (data.tasks.pending || data.tasks.completed)) {
        setPending(data.tasks.pending || []);
        setCompleted(data.tasks.completed || []);
      } else if (data.pending || data.completed) {
        setPending(data.pending || []);
        setCompleted(data.completed || []);
      } else if (Array.isArray(data.tasks || data)) {
        const tasksArr = data.tasks || data;
        setPending(tasksArr.filter(t => t.status !== 'completed'));
        setCompleted(tasksArr.filter(t => t.status === 'completed'));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const handleToggle = async (task, isPendingList) => {
    if (!isMember) return;
    
    const targetId = task._id || task.id;
    const toggledTask = { ...task, status: isPendingList ? 'completed' : 'pending' };
    
    if (isPendingList) {
      setPending(prev => prev.filter(t => (t._id || t.id) !== targetId));
      setCompleted(prev => [toggledTask, ...prev]);
    } else {
      setCompleted(prev => prev.filter(t => (t._id || t.id) !== targetId));
      setPending(prev => [...prev, toggledTask]);
    }

    try {
      await toggleTaskStatus(targetId);
      showToast(`Task marked as ${isPendingList ? 'completed' : 'pending'}.`, "success");
    } catch (err) {
      setError('Failed to update task status.');
      loadTasks();
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    
    setPending(prev => prev.filter(t => (t._id || t.id) !== taskId));
    setCompleted(prev => prev.filter(t => (t._id || t.id) !== taskId));
    
    try {
      await deleteTask(taskId);
      showToast("Task deleted.", "info");
    } catch (err) {
      setError('Failed to delete task.');
      loadTasks();
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setIsAdding(true);
    try {
      const payload = { title: newTaskTitle, description: newTaskDesc };
      if (newTaskDate) payload.dueDate = newTaskDate;
      const res = await createTask(projectId, payload);
      const added = res.data?.task || res.task || res.data || res;
      
      setPending(prev => [added, ...prev]);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDate('');
      setShowAddForm(false);
      showToast("Task created successfully.", "success");
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task._id || task.id);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setIsEditing(true);
    try {
      const payload = { title: editTitle, description: editDesc };
      if (editDate) payload.dueDate = editDate;
      
      const res = await updateTask(editingTaskId, payload);
      const updated = res.data?.task || res.task || res.data || res;
      
      setPending(prev => prev.map(t => (t._id || t.id) === editingTaskId ? { ...t, ...updated } : t));
      setCompleted(prev => prev.map(t => (t._id || t.id) === editingTaskId ? { ...t, ...updated } : t));
      
      setEditingTaskId(null);
      showToast("Task updated.", "success");
    } catch (err) {
      setError('Failed to update task.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    setAiError(null);
    try {
      const res = await generateTasks(projectTitle || 'this project');
      let tasks = res.tasks || res.data?.tasks || [];
      tasks = tasks.map(t => typeof t === 'string' ? { title: t, description: '' } : t);
      setGeneratedTasks(tasks);
    } catch (err) {
      setAiError(err.response?.data?.message || 'Failed to generate tasks.');
    } finally {
      setIsGenerating(false);
    }
  };

  const removeGeneratedTask = (index) => {
    setGeneratedTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveGeneratedTasks = async () => {
    if (!generatedTasks || generatedTasks.length === 0) {
      setGeneratedTasks(null);
      return;
    }
    setIsSavingGenerated(true);
    try {
      for (const task of generatedTasks) {
        await createTask(projectId, { title: task.title, description: task.description || '' });
      }
      setGeneratedTasks(null);
      await loadTasks();
      showToast("Tasks saved to project!", "success");
    } catch (err) {
      setAiError('Failed to save some generated tasks.');
      await loadTasks();
    } finally {
      setIsSavingGenerated(false);
    }
  };

  if (isLoading) return <Loader />;

  const isEmpty = pending.length === 0 && completed.length === 0;

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Project Tasks</h2>
      </div>

      <ErrorMessage message={error} onRetry={loadTasks} />
      <ErrorMessage message={aiError} />

      {/* AI Generate Section */}
      {isOwner && isEmpty && !generatedTasks && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-lg mb-8 text-center">
          <p className="text-indigo-800 font-medium mb-4">You have no tasks yet. Let AI help you get started!</p>
          <Button 
            className="w-auto px-6 mx-auto bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500" 
            onClick={handleGenerateTasks}
            isLoading={isGenerating}
          >
            ✨ Generate Initial Task List
          </Button>
        </div>
      )}

      {/* AI Generated Preview */}
      {isOwner && generatedTasks && (
        <div className="bg-white border border-indigo-200 shadow-sm rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-indigo-900">✨ Generated Tasks Preview</h3>
            <button className="text-sm text-gray-500 hover:text-gray-800" onClick={() => setGeneratedTasks(null)}>
              Cancel
            </button>
          </div>
          <div className="space-y-3 mb-6">
            {generatedTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">All tasks removed.</p>
            ) : (
              generatedTasks.map((task, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded border border-gray-100">
                  <div>
                    <div className="font-medium text-gray-800">{task.title}</div>
                    {task.description && <div className="text-sm text-gray-500 mt-1">{task.description}</div>}
                  </div>
                  <button onClick={() => removeGeneratedTask(idx)} className="text-red-500 hover:text-red-700 p-1 font-bold">×</button>
                </div>
              ))
            )}
          </div>
          <Button 
            onClick={handleSaveGeneratedTasks}
            isLoading={isSavingGenerated}
            disabled={generatedTasks.length === 0}
            className="w-full sm:w-auto px-8 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
          >
            Save to Project
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pending Column */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending ({pending.length})</h3>
            {isOwner && !showAddForm && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="text-sm font-medium text-primary hover:text-[#1E3E75]"
              >
                + Add Task
              </button>
            )}
          </div>

          {showAddForm && isOwner && (
            <form onSubmit={handleAddTask} className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 space-y-3">
              <Input 
                placeholder="Task Title" 
                value={newTaskTitle} 
                onChange={e => setNewTaskTitle(e.target.value)} 
                required
              />
              <textarea
                placeholder="Description (optional)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                value={newTaskDesc}
                onChange={e => setNewTaskDesc(e.target.value)}
              />
              <Input 
                type="date"
                value={newTaskDate} 
                onChange={e => setNewTaskDate(e.target.value)} 
              />
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={isAdding} className="w-auto px-4 py-1.5 text-sm">
                  Save
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {pending.length === 0 && !showAddForm ? (
              <p className="text-gray-500 text-sm italic py-4">No pending tasks.</p>
            ) : (
              pending.map(task => renderTask(task, true))
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed ({completed.length})</h3>
          <div className="space-y-3">
            {completed.length === 0 ? (
              <p className="text-gray-500 text-sm italic py-4">No completed tasks.</p>
            ) : (
              completed.map(task => renderTask(task, false))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function renderTask(task, isPending) {
    const taskId = task._id || task.id;
    const isEditingThis = editingTaskId === taskId;

    if (isEditingThis) {
      return (
        <form key={taskId} onSubmit={handleSaveEdit} className="bg-white p-4 rounded-lg border border-primary shadow-sm space-y-3">
          <Input 
            value={editTitle} 
            onChange={e => setEditTitle(e.target.value)} 
            required
          />
          <textarea
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
          />
          <Input 
            type="date"
            value={editDate} 
            onChange={e => setEditDate(e.target.value)} 
          />
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setEditingTaskId(null)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <Button type="submit" isLoading={isEditing} className="w-auto px-4 py-1.5 text-sm">
              Update
            </Button>
          </div>
        </form>
      );
    }

    return (
      <div key={taskId} className={`p-4 rounded-lg border ${isPending ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-200'} group relative`}>
        <div className="flex items-start gap-3">
          {isMember && (
            <div className="pt-1">
              <input 
                type="checkbox"
                checked={!isPending}
                onChange={() => handleToggle(task, isPending)}
                className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300 cursor-pointer"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${!isPending ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className={`text-xs mt-1 ${!isPending ? 'text-gray-400' : 'text-gray-600'} break-words`}>
                {task.description}
              </p>
            )}
            {task.dueDate && (
              <div className={`text-xs mt-2 flex items-center ${!isPending ? 'text-gray-400' : 'text-gray-500'}`}>
                <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
          
          {isOwner && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button onClick={() => handleStartEdit(task)} className="text-gray-400 hover:text-primary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
              <button onClick={() => handleDelete(taskId)} className="text-gray-400 hover:text-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}
