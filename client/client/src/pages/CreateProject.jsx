import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../api/project.api';
import { generateProject } from '../api/ai.api';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import Card from '../components/Card';
import SkillTagInput from '../components/SkillTagInput';

export default function CreateProject() {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('Web');
  const [teamSize, setTeamSize] = useState(2);
  const [deadline, setDeadline] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  
  // AI Feature State
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Validation & Submission
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Skill Tag Input State
  const handleAutoFill = async () => {
    if (!idea.trim()) {
      setAiError('Please enter a project idea first.');
      return;
    }
    setAiError(null);
    setIsGenerating(true);
    try {
      const res = await generateProject(idea);
      const data = res.data || res;
      
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      
      if (data.skills && Array.isArray(data.skills)) {
        const merged = Array.from(new Set([...requiredSkills, ...data.skills]));
        setRequiredSkills(merged);
      }
      
      // Clear validation errors for auto-filled fields
      setValidationErrors(prev => ({ 
        ...prev, 
        title: null, 
        description: null,
        requiredSkills: null
      }));
    } catch (err) {
      setAiError(err.response?.data?.message || err.response?.data?.error || 'Failed to generate project details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (!domain.trim()) errors.domain = 'Domain is required';
    
    if (teamSize < 2 || teamSize > 10) errors.teamSize = 'Team size must be between 2 and 10';
    
    if (!deadline) {
      errors.deadline = 'Deadline/Duration is required';
    }

    if (requiredSkills.length === 0) {
      errors.requiredSkills = 'At least one required skill is needed';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        domain,
        teamSize: Number(teamSize),
        deadline,
        requiredSkills
      };
      
      const res = await createProject(payload);
      const newProject = res.project || res.data?.project || res.data || res;
      navigate(`/admin/projects/${newProject._id || newProject.id}`);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.response?.data?.error || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create a New Project</h1>
        <p className="text-gray-500 mt-2">Start a new initiative and find the perfect team members.</p>
      </div>

      <Card>
        <ErrorMessage message={submitError} />

        {/* AI Features Section */}
        <div className="bg-blue-50/50 rounded-lg p-5 border border-blue-100 mb-8">
          <h3 className="text-lg font-medium text-[#1E3E75] mb-2 flex items-center">
            <span className="mr-2">✨</span> AI Assistance
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Describe your idea briefly, and let AI automatically fill out the project title, description, and required skills for you!
          </p>
          <div className="space-y-4">
            <Input 
              placeholder="E.g., A mobile app for adopting shelter pets using ML matching..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
            <ErrorMessage message={aiError} />
            <div className="flex flex-wrap gap-3">
              <Button 
                type="button"
                onClick={handleAutoFill}
                isLoading={isGenerating}
                className="w-auto text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
              >
                ✨ Auto-Fill Project Details
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Project Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationErrors.title) setValidationErrors(prev => ({ ...prev, title: null }));
            }}
            placeholder="Awesome Project Name"
            error={validationErrors.title}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors min-h-[120px] ${
                validationErrors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (validationErrors.description) setValidationErrors(prev => ({ ...prev, description: null }));
              }}
              placeholder="What is this project about? What are the goals?"
            />
            {validationErrors.description && <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <select 
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  if (validationErrors.domain) setValidationErrors(prev => ({ ...prev, domain: null }));
                }}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white ${
                  validationErrors.domain ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="AI">AI/ML</option>
                <option value="Web">Web Development</option>
                <option value="Mobile">Mobile App</option>
                <option value="Data">Data Science</option>
                <option value="Hardware">Hardware</option>
                <option value="Other">Other</option>
              </select>
              {validationErrors.domain && <p className="mt-1 text-sm text-red-600">{validationErrors.domain}</p>}
            </div>

            <Input 
              label="Team Size (2-10)"
              type="number"
              min="2"
              max="10"
              value={teamSize}
              onChange={(e) => {
                setTeamSize(e.target.value);
                if (validationErrors.teamSize) setValidationErrors(prev => ({ ...prev, teamSize: null }));
              }}
              error={validationErrors.teamSize}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration / Deadline
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                validationErrors.deadline ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
              value={deadline}
              onChange={(e) => {
                setDeadline(e.target.value);
                if (validationErrors.deadline) setValidationErrors(prev => ({ ...prev, deadline: null }));
              }}
            >
              <option value="">Select duration...</option>
              <option value="1 month">1 month</option>
              <option value="2 months">2 months</option>
              <option value="3 months">3 months</option>
              <option value="4 months">4 months</option>
              <option value="5 months">5 months</option>
              <option value="6 months">6 months</option>
              <option value="9 months">9 months</option>
              <option value="1 year">1 year</option>
              <option value="> 1 year">&gt; 1 year</option>
            </select>
            {validationErrors.deadline && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.deadline}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Skills
            </label>
            <SkillTagInput 
              value={requiredSkills} 
              onChange={(newSkills) => {
                setRequiredSkills(newSkills);
                if (validationErrors.requiredSkills) setValidationErrors(prev => ({ ...prev, requiredSkills: null }));
              }} 
              error={validationErrors.requiredSkills} 
            />
            {validationErrors.requiredSkills && <p className="mt-1 text-sm text-red-600">{validationErrors.requiredSkills}</p>}
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Button 
              type="button"
              className="w-auto px-6 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="w-auto px-8"
              isLoading={isSubmitting}
            >
              Create Project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
