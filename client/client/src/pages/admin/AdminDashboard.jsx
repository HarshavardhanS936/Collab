import { useState, useEffect } from 'react';
import { fetchAdminDashboardStats } from '../../api/admin.api';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const res = await fetchAdminDashboardStats();
        setData(res.data || res);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load dashboard stats.');
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  const { stats, latestRegistrations } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Projects</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalProjects}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Completed Tasks</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.completedTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Pending Tasks</p>
          <p className="mt-2 text-3xl font-bold text-amber-500">{stats.pendingTasks}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mt-8">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Latest Registrations</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {latestRegistrations && latestRegistrations.length > 0 ? (
            latestRegistrations.map(user => (
              <div key={user._id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <div className="text-sm text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500">No recent registrations.</div>
          )}
        </div>
      </div>
    </div>
  );
}
