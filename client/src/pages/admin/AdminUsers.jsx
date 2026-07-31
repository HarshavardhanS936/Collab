import { useState, useEffect } from 'react';
import { fetchAdminUsers, deleteAdminUser } from '../../api/admin.api';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import { useToast } from '../../context/ToastContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);

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

  const handleViewProfile = (user) => {
    setSelectedUser(user);
  };

  const closeProfileModal = () => {
    setSelectedUser(null);
  };

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={loadUsers} />;

  return (
    <div className="space-y-6 relative">
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
                      onClick={() => handleViewProfile(user)}
                      className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                      title="View Profile"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-900 transition-colors p-1"
                      title="Delete User"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">User Profile</h2>
              <button 
                onClick={closeProfileModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-slate-800 text-white flex items-center justify-center text-2xl font-bold shadow-sm">
                  {(selectedUser.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedUser.name}</h3>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">College/University</p>
                    <p className="text-slate-900 font-medium">{selectedUser.college || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Department</p>
                    <p className="text-slate-900 font-medium">{selectedUser.department || 'Not specified'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Summary / Bio</p>
                  {selectedUser.bio ? (
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">{selectedUser.bio}</p>
                  ) : (
                    <p className="text-slate-400 italic text-sm">No summary provided.</p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Skills</p>
                  {(!selectedUser.skills || selectedUser.skills.length === 0) ? (
                    <p className="text-slate-400 text-sm italic">No skills listed.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills.map(s => (
                        <span key={s} className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedUser.resumePath && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-2">Resume</p>
                    <a 
                      href={`http://localhost:5000${selectedUser.resumePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Resume Document
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={closeProfileModal}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
