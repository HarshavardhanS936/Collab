import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProjectById, deleteProject } from '../api/project.api';
import { sendJoinRequest, fetchJoinRequests, acceptJoinRequest, rejectJoinRequest } from '../api/joinRequest.api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Card from '../components/Card';
import Button from '../components/Button';
import ProjectTasks from '../components/ProjectTasks';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Join Requests state (Owner view)
  const [joinRequests, setJoinRequests] = useState([]);
  const [isFetchingRequests, setIsFetchingRequests] = useState(false);
  const [requestError, setRequestError] = useState(null);

  // Non-member request state
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProject = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchProjectById(id);
      const data = res?.data?.project || res?.project || res?.data || res;
      setProject(data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load project details.');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserId = () => user?.id || user?._id;
  const getOwnerId = () => project?.createdBy?.id || project?.createdBy?._id || project?.createdBy;

  const isOwner = !!(project && user && getOwnerId() === getUserId());
  
  const isMember = !!(project && user && (
    isOwner || 
    (project.members || []).some(m => (m.id || m._id || m) === getUserId())
  ));

  useEffect(() => {
    if (isOwner) {
      loadJoinRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner, id]);

  const loadJoinRequests = async () => {
    setIsFetchingRequests(true);
    try {
      const res = await fetchJoinRequests(id);
      const data = res?.data?.joinRequests || res?.joinRequests || res?.data || res || [];
      setJoinRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setRequestError('Failed to load join requests.');
    } finally {
      setIsFetchingRequests(false);
    }
  };

  const handleSendJoinRequest = async () => {
    setIsRequesting(true);
    setError(null);
    try {
      await sendJoinRequest(id);
      setHasRequested(true);
      showToast("Join request sent successfully!", "success");
    } catch (err) {
      // If error is 400, assume request already sent or user is invalid
      if (err.response?.status === 400 && err.response?.data?.message?.toLowerCase().includes('already')) {
        setHasRequested(true);
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to send join request.');
        // Set state anyway so they don't spam it if it was a generic 400 indicating already requested
        if(err.response?.status === 400) setHasRequested(true);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleAcceptRequest = async (reqId) => {
    try {
      await acceptJoinRequest(reqId);
      setJoinRequests(prev => prev.filter(r => (r._id || r.id) !== reqId));
      loadProject(); // Reload project to update members list
      showToast("User added to project.", "success");
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Failed to accept request.');
    }
  };

  const handleRejectRequest = async (reqId) => {
    try {
      await rejectJoinRequest(reqId);
      setJoinRequests(prev => prev.filter(r => (r._id || r.id) !== reqId));
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Failed to reject request.');
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(id);
        showToast("Project deleted.", "info");
        navigate('/projects');
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete project.');
      }
    }
  };

  if (isLoading) return <Loader />;
  if (error && !project) return <ErrorMessage message={error} onRetry={loadProject} />;
  if (!project) return null;

  const membersCount = project.members?.length || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <Card className="relative">
        {isOwner && (
          <div className="absolute top-6 right-6 flex gap-2">
            <Button 
              className="w-auto px-4 py-1.5 text-xs bg-red-600 hover:bg-red-700" 
              onClick={handleDeleteProject}
            >
              Delete
            </Button>
          </div>
        )}
        
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-primary">
            {project.domain || 'General'}
          </span>
          {project.deadline && (
            <span className="text-sm text-gray-500 flex items-center">
              <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Due {project.deadline}
            </span>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4 pr-24">{project.title}</h1>
        
        <div className="prose max-w-none text-gray-600 mb-6 whitespace-pre-wrap">
          {project.description}
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(project.requiredSkills || []).map((skill, idx) => (
              <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Team Progress</div>
              <div className="text-lg font-bold text-gray-900">{membersCount} / {project.teamSize} members</div>
            </div>
            {/* Simple progress bar */}
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden ml-4">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${Math.min(100, (membersCount / project.teamSize) * 100)}%` }}
              />
            </div>
          </div>
          
          {/* Action Button for Non-Members */}
          {!isMember && (
            <div>
              <Button 
                onClick={handleSendJoinRequest}
                disabled={hasRequested || isRequesting || membersCount >= project.teamSize}
                isLoading={isRequesting}
                className={`w-auto px-6 ${hasRequested ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                {hasRequested ? 'Request Sent' : membersCount >= project.teamSize ? 'Team Full' : 'Request to Join'}
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      {error && <ErrorMessage message={error} />}

      {/* Owner View: Pending Requests */}
      {isOwner && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Join Requests</h2>
          <ErrorMessage message={requestError} />
          
          {isFetchingRequests ? (
            <Loader />
          ) : joinRequests.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending requests at the moment.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {joinRequests.map(req => {
                const reqUser = req.requestedBy || req.user || req.requester || {}; // depending on population
                const reqId = req._id || req.id;
                return (
                  <div key={reqId} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{reqUser.name || 'Unknown User'}</div>
                      <div className="text-sm text-gray-500">
                        {reqUser.department} &bull; {reqUser.college}
                      </div>
                      {(reqUser.skills || []).length > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          Skills: {reqUser.skills.join(', ')}
                        </div>
                      )}
                      {reqUser.resumePath && (
                        <div className="mt-2">
                          <a 
                            href={`http://localhost:5000${reqUser.resumePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Resume
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleAcceptRequest(reqId)}
                        className="w-auto px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700"
                      >
                        Accept
                      </Button>
                      <button 
                        onClick={() => handleRejectRequest(reqId)}
                        className="w-auto px-3 py-1.5 text-xs bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Team Members */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Team Members</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(project.members || []).map(member => (
            <div key={member._id || member.id || member} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
              <div className="h-10 w-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">
                {(member.name || 'M').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-gray-900">{member.name || 'Team Member'}</div>
                <div className="text-xs text-gray-500">{member.department || 'Unknown Dept'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embed Tasks Section (Mocked for now) */}
      <ProjectTasks projectId={id} projectTitle={project.title} isMember={isMember} isOwner={isOwner} />
    </div>
  );
}
