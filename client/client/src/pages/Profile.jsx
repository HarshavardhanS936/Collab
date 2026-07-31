import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { fetchProfile, updateProfile, uploadResume } from '../api/profile.api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import SkillTagInput from '../components/SkillTagInput';

export default function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState('basic');
  const [editSection, setEditSection] = useState(null); // 'basic', 'education', 'skills', etc.
  const [isSaving, setIsSaving] = useState(false);
  
  // Resume Upload State
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeError, setResumeError] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [college, setCollege] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      const userId = user?.id || user?._id;
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchProfile(userId);
        const data = res.data?.user || res.data || res.profile || res;
        setProfile(data);
        
        // Initialize form state
        setName(data.name || '');
        setEmail(data.email || '');
        setDepartment(data.department || '');
        setCollege(data.college || '');
        setBio(data.bio || '');
        setSkills(data.skills || []);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      const payload = { name, email, department, college, bio, skills };
      const res = await updateProfile(payload);
      const data = res.data?.user || res.data || res.profile || res;
      setProfile(data);
      setEditSection(null);
      showToast("Profile updated successfully!", "success");
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
      showToast("Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setIsUploadingResume(true);
    setResumeError(null);
    try {
      const res = await uploadResume(resumeFile);
      const data = res.data?.user || res.user || res.data || res;
      setProfile(data);
      setResumeFile(null);
      showToast("Resume uploaded successfully!", "success");
    } catch (err) {
      setResumeError(err.response?.data?.message || 'Failed to upload resume.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  if (isLoading) return <Loader />;
  if (error && !profile) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (!profile) return null;

  const renderBasicDetails = () => {
    const isEditing = editSection === 'basic';
    
    return (
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Basic Details</h2>
          {!isEditing && (
            <button 
              onClick={() => setEditSection('basic')}
              className="mt-2 md:mt-0 px-4 py-1.5 border border-blue-200 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Info
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <Input 
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-gray-700">Bio / Summary</label>
                <span className={`text-xs ${bio.length > 300 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                  {bio.length} / 300
                </span>
              </div>
              <textarea
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors min-h-[120px] ${bio.length > 300 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Engineering enthusiast passionate about transforming theoretical knowledge..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <Button type="button" onClick={() => setEditSection(null)} className="w-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving} className="w-auto px-8" disabled={bio.length > 300}>
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
              <div className="col-span-1">
                <p className="text-sm font-medium text-gray-500 mb-1">Full Name :</p>
                <p className="text-gray-900">{profile.name}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500 mb-1">Email Address :</p>
                <p className="text-gray-900">{profile.email}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-50">
              <p className="text-sm font-medium text-gray-500 mb-2">Summary</p>
              {profile.bio ? (
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
              ) : (
                <p className="text-gray-400 italic text-sm">No summary provided yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEducation = () => {
    const isEditing = editSection === 'education';
    
    return (
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Education Details</h2>
          {!isEditing && (
            <button 
              onClick={() => setEditSection('education')}
              className="mt-2 md:mt-0 px-4 py-1.5 border border-blue-200 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Info
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="College / University"
                value={college}
                onChange={e => setCollege(e.target.value)}
                placeholder="e.g. VSB Engineering College"
                required
              />
              <Input 
                label="Department / Course"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                required
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <Button type="button" onClick={() => setEditSection(null)} className="w-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving} className="w-auto px-8">
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
             <div className="grid grid-cols-1 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Current/Latest College :</p>
                <p className="text-gray-900 font-medium">{profile.college || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Department / Course :</p>
                <p className="text-gray-700">{profile.department || 'Not specified'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSkills = () => {
    const isEditing = editSection === 'skills';
    
    return (
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Skills & Expertise</h2>
          {!isEditing && (
            <button 
              onClick={() => setEditSection('skills')}
              className="mt-2 md:mt-0 px-4 py-1.5 border border-blue-200 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Info
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
              <SkillTagInput 
                value={skills}
                onChange={setSkills}
                placeholder="Type a skill and press Enter"
              />
              <p className="text-xs text-gray-500 mt-2">Add all relevant programming languages, tools, and methodologies.</p>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <Button type="button" onClick={() => setEditSection(null)} className="w-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving} className="w-auto px-8">
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div>
            {(!profile.skills || profile.skills.length === 0) ? (
              <p className="text-gray-500 text-sm italic">No skills listed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.skills.map(s => (
                  <span key={s} className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderResume = () => {
    return (
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Resume & Documents</h2>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
               </div>
               <div>
                  <h3 className="font-semibold text-gray-900">Professional Resume</h3>
                  {profile.resumePath ? (
                    <a 
                      href={`http://localhost:5000${profile.resumePath}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-1 inline-block font-medium"
                    >
                      View Current Document
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">No document uploaded yet</p>
                  )}
               </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              <label className="cursor-pointer group flex items-center gap-2 w-full md:w-auto">
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="hidden"
                  id="resume-upload"
                />
                <span className="w-full md:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium group-hover:bg-gray-50 transition-colors text-center shadow-sm">
                  {resumeFile ? resumeFile.name : 'Choose File'}
                </span>
              </label>
              
              {resumeFile && (
                <Button 
                  onClick={handleResumeUpload} 
                  isLoading={isUploadingResume}
                  className="w-full text-sm py-2 mt-2"
                >
                  Upload New Resume
                </Button>
              )}
            </div>
          </div>
          {resumeError && <p className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-md">{resumeError}</p>}
        </div>
      </div>
    );
  };

  const navItems = [
    { id: 'basic', label: 'Basic Details' },
    { id: 'education', label: 'Education Details' },
    { id: 'skills', label: 'Skills & Expertise' },
    { id: 'resume', label: 'Resume' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Profile Navigation */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            
            {/* User Info Header */}
            <div className="p-6 flex flex-col items-center border-b border-gray-100 bg-gray-50">
              <div className="h-24 w-24 rounded-full bg-slate-800 text-white flex items-center justify-center text-4xl font-bold shadow-sm mb-4">
                {(profile.name || 'U').charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center">{profile.name}</h2>
              <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">ProjectHub ID: {profile.id?.substring(0, 8) || 'N/A'}</p>
            </div>
            
            {/* Navigation Menu */}
            <nav className="p-3 flex flex-col space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setEditSection(null); // Reset edit mode on tab change
                  }}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <Card className="min-h-[500px] border-t-4 border-t-blue-600 shadow-sm rounded-xl">
            <ErrorMessage message={error} />
            
            <div className="p-2 md:p-6">
              {activeTab === 'basic' && renderBasicDetails()}
              {activeTab === 'education' && renderEducation()}
              {activeTab === 'skills' && renderSkills()}
              {activeTab === 'resume' && renderResume()}
            </div>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
