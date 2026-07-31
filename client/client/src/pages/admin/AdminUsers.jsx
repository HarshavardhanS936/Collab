import { useState, useEffect } from 'react';
import { fetchAdminUsers, deactivateAdminUser, deleteAdminUser } from '../../api/admin.api';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import { useToast } from '../../context/ToastContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetchAdminUsers();
      const data = res.data || res;
      setUsers(data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    try {
      await deactivateAdminUser(id);
      showToast("User deactivated successfully", "success");
      loadUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to deactivate", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this user?")) return;
    try {
      await deleteAdminUser(id);
      showToast("User deleted successfully", "success");
      loadUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={loadUsers} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.department} - {user.college}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button 
                      onClick={() => handleDeactivate(user._id)}
                      className="text-amber-600 hover:text-amber-900"
                    >
                      Deactivate
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    No users found.
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
