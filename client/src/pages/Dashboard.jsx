import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../api/dashboard.api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const res = await fetchDashboard();
        setData(res.data || res);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={loadDashboard} />;
  if (!data) return null;

  const projectsCreated = data.projectsCreated || [];
  const projectsJoined = data.projectsJoined || [];
  const allProjects = [...projectsCreated, ...projectsJoined];
  const recentTasks = data.recentTasks || [];
  const projectsJoinedCount = data.projectsJoinedCount || data.projectsJoined?.length || 0;
  const pendingTasksCount = data.taskStats?.pending || data.pendingTasksCount || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back to ProjectHub AI.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-sm font-medium text-gray-500 mb-1">Total Projects</div>
          <div className="text-3xl font-bold text-gray-900">{allProjects.length}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-500 mb-1">Completed Tasks</div>
          <div className="text-3xl font-bold text-gray-900">{data.taskStats?.completed || 0}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-500 mb-1">Pending Tasks</div>
          <div className="text-3xl font-bold text-gray-900">{pendingTasksCount}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Projects */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Projects</h2>
          {allProjects.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't joined or been assigned any projects yet.</p>
            </Card>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
              {allProjects.map(project => (
                <Link 
                  key={project._id || project.id} 
                  to={`/projects/${project._id || project.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-semibold text-primary">{project.title}</div>
                  <div className="text-sm text-gray-500 mt-1">{project.domain || 'General'}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-gray-500">You have no recent tasks.</p>
            </Card>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
              {recentTasks.map(task => (
                <div key={task._id || task.id} className="p-4 flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{task.project?.title || 'Unknown Project'}</div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    task.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
