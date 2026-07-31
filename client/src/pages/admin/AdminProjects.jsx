import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjects, deleteProject } from '../../api/project.api';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      // Fetching all projects, ideally backend can filter by creator
      const res = await fetchProjects({ limit: 100 });
      let data = res.data?.data || res.data || res;
      let allProjects = data.projects || data || [];
      if (!Array.isArray(allProjects)) allProjects = [];
      // Filter locally for now to show only projects this admin created
      const adminProjects = allProjects.filter(p => p.createdBy?._id === user?.id || p.createdBy === user?.id || p.createdBy?.id === user?.id);
      setProjects(adminProjects);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load projects.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(projectId);
      showToast('Project deleted.', 'info');
      setProjects(prev => prev.filter(p => p._id !== projectId));
    } catch (err) {
      setError('Failed to delete project.');
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={loadProjects} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Manage Projects</h1>
        <Link 
          to="/admin/projects/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 font-medium"
        >
          + Create Project
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Domain</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Team Size</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {(Array.isArray(projects) ? projects : []).map(project => (
                <tr key={project._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{project.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{project.domain}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{project.members?.length || 0} / {project.teamSize}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {project.deadline}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                    <Link to={`/admin/projects/${project._id}`} className="text-blue-600 hover:text-blue-900">View</Link>
                    <button onClick={() => handleDelete(project._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    You haven't created any projects yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
