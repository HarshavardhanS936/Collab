import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjects } from '../api/project.api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [skill, setSkill] = useState('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Handle filter changes (reset page)
  const handleDomainChange = (e) => {
    setDomain(e.target.value);
    setPage(1);
  };
  const handleSkillChange = (e) => {
    setSkill(e.target.value);
    setPage(1);
  };

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchProjects({
        search: debouncedSearch,
        domain,
        skill,
        page,
        limit: 12
      });
      
      // Handle variations in backend response format
      const data = res.data || res;
      setProjects(data.projects || data.data || []);
      setTotalPages(data.totalPages || data.pagination?.totalPages || 1);
      
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to fetch projects.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, domain, skill, page]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Explore Projects</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/3">
          <Input 
            label="Search" 
            placeholder="Search projects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
          <select 
            value={domain}
            onChange={handleDomainChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white"
          >
            <option value="">All Domains</option>
            <option value="AI">AI/ML</option>
            <option value="Web">Web Development</option>
            <option value="Mobile">Mobile App</option>
            <option value="Data">Data Science</option>
            <option value="Hardware">Hardware</option>
          </select>
        </div>
        <div className="w-full md:w-1/4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
          <input 
            type="text"
            value={skill}
            onChange={handleSkillChange}
            placeholder="e.g. React"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>
      </div>

      <ErrorMessage message={error} onRetry={loadProjects} />

      {/* Projects Grid */}
      {isLoading ? (
        <Loader />
      ) : projects.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-4">No projects match your search criteria.</p>
          <Button 
            className="w-auto mx-auto px-6"
            onClick={() => {
              setSearch('');
              setDebouncedSearch('');
              setDomain('');
              setSkill('');
            }}
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Link 
                key={project._id || project.id} 
                to={`/projects/${project._id || project.id}`}
                className="group block"
              >
                <Card className="h-full flex flex-col hover:border-primary transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-primary">
                      {project.domain || 'General'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Team: {project.teamSize || '?'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
                    {project.title}
                  </h3>
                  <div className="flex-grow">
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(project.requiredSkills || []).slice(0, 3).map((s, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          {s}
                        </span>
                      ))}
                      {(project.requiredSkills?.length || 0) > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                          +{project.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  {project.deadline && (
                    <div className="mt-4 text-xs text-gray-500 flex items-center">
                      <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    Due: {project.deadline}
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 pt-4">
              <Button 
                disabled={page <= 1} 
                onClick={() => setPage(p => p - 1)}
                className="w-auto px-4"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700 font-medium">
                Page {page} of {totalPages}
              </span>
              <Button 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="w-auto px-4"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
