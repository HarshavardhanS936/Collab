const fs = require('fs');
const path = require('path');

const clientSrcPath = path.join(__dirname, 'client', 'src');

// Function to safely inject ToastContext
function injectToast(content) {
  if (content.includes('useToast')) return content;
  
  // Add import
  let newContent = content.replace(
    /(import .* from 'react';?)/,
    `$1\nimport { useToast } from '../context/ToastContext';`
  );
  
  // Try hook context
  if (newContent.includes('const { user } = useAuth();')) {
    newContent = newContent.replace('const { user } = useAuth();', 'const { user } = useAuth();\n  const { showToast } = useToast();');
  } else if (newContent.includes('const { user, login } = useAuth();')) {
    newContent = newContent.replace('const { user, login } = useAuth();', 'const { user, login } = useAuth();\n  const { showToast } = useToast();');
  } else if (newContent.includes('const navigate = useNavigate();')) {
    newContent = newContent.replace('const navigate = useNavigate();', 'const navigate = useNavigate();\n  const { showToast } = useToast();');
  } else {
    // fallback
    newContent = newContent.replace(/(export default function \w+\(.*\) \{)/, `$1\n  const { showToast } = useToast();`);
  }
  
  return newContent;
}

// 6. Dashboard.jsx (Add onRetry)
const dashboardPath = path.join(clientSrcPath, 'pages', 'Dashboard.jsx');
let dbContent = fs.readFileSync(dashboardPath, 'utf8');
dbContent = dbContent.replace('<ErrorMessage message={error} />', '<ErrorMessage message={error} onRetry={loadDashboard} />');
fs.writeFileSync(dashboardPath, dbContent);

// 7. Projects.jsx (Add onRetry)
const projectsPath = path.join(clientSrcPath, 'pages', 'Projects.jsx');
let prjContent = fs.readFileSync(projectsPath, 'utf8');
prjContent = prjContent.replace('<ErrorMessage message={error} />', '<ErrorMessage message={error} onRetry={loadProjects} />');
fs.writeFileSync(projectsPath, prjContent);

// 8. ProjectDetails.jsx (Add onRetry & Toasts)
const pdPath = path.join(clientSrcPath, 'pages', 'ProjectDetails.jsx');
let pdContent = fs.readFileSync(pdPath, 'utf8');
pdContent = injectToast(pdContent);
pdContent = pdContent.replace('<ErrorMessage message={error} />', '<ErrorMessage message={error} onRetry={loadProject} />');
// handleSendJoinRequest
pdContent = pdContent.replace('setHasRequested(true);', 'setHasRequested(true);\n      showToast("Join request sent successfully!", "success");');
// handleAcceptRequest
pdContent = pdContent.replace('loadProject(); // Reload project to update members list', 'loadProject(); // Reload project to update members list\n      showToast("User added to project.", "success");');
// handleRejectRequest
pdContent = pdContent.replace('setJoinRequests(prev => prev.filter(r => (r._id || r.id) !== reqId));', 'setJoinRequests(prev => prev.filter(r => (r._id || r.id) !== reqId));\n      showToast("Join request rejected.", "info");');
// handleDeleteProject
pdContent = pdContent.replace('navigate(\'/projects\');', 'showToast("Project deleted.", "info");\n        navigate(\'/projects\');');
fs.writeFileSync(pdPath, pdContent);

// 9. ProjectTasks.jsx (Add onRetry & Toasts)
const ptPath = path.join(clientSrcPath, 'components', 'ProjectTasks.jsx');
let ptContent = fs.readFileSync(ptPath, 'utf8');
ptContent = injectToast(ptContent);
ptContent = ptContent.replace('<ErrorMessage message={error} />', '<ErrorMessage message={error} onRetry={loadTasks} />');
ptContent = ptContent.replace('await toggleTaskStatus(targetId);', 'await toggleTaskStatus(targetId);\n      showToast(`Task marked as ${isPendingList ? \'completed\' : \'pending\'}.`, "success");');
ptContent = ptContent.replace('await deleteTask(taskId);', 'await deleteTask(taskId);\n      showToast("Task deleted.", "info");');
ptContent = ptContent.replace('setShowAddForm(false);', 'setShowAddForm(false);\n      showToast("Task created successfully.", "success");');
ptContent = ptContent.replace('setEditingTaskId(null);', 'setEditingTaskId(null);\n      showToast("Task updated.", "success");');
ptContent = ptContent.replace('await loadTasks();', 'await loadTasks();\n      showToast("Tasks saved to project!", "success");');
fs.writeFileSync(ptPath, ptContent);

// 10. Profile.jsx (Add onRetry & replace local successMsg with Toasts)
const profPath = path.join(clientSrcPath, 'pages', 'Profile.jsx');
let profContent = fs.readFileSync(profPath, 'utf8');
profContent = injectToast(profContent);
profContent = profContent.replace('<ErrorMessage message={error} />', '<ErrorMessage message={error} onRetry={() => window.location.reload()} />');
// Remove local successMsg block
profContent = profContent.replace(/\{successMsg && \([\s\S]*?\}\)/g, '');
profContent = profContent.replace(/const \[successMsg, setSuccessMsg\] = useState\(''\);/g, '');
profContent = profContent.replace(/setSuccessMsg\(''\);/g, '');
profContent = profContent.replace(/setSuccessMsg\('Profile updated successfully!'\);/g, 'showToast("Profile updated successfully!", "success");');
profContent = profContent.replace(/setTimeout\(\(\) => setSuccessMsg\(''\), 3000\);/g, '');
fs.writeFileSync(profPath, profContent);

// 11. Login.jsx & Register.jsx (Add useToast)
const loginPath = path.join(clientSrcPath, 'pages', 'Login.jsx');
let loginContent = fs.readFileSync(loginPath, 'utf8');
loginContent = injectToast(loginContent);
// Listen for ?registered=true and trigger toast
if (!loginContent.includes('registered=true')) {
  loginContent = loginContent.replace(
    'export default function Login() {',
    `import { useEffect } from 'react';\nimport { useLocation } from 'react-router-dom';\n\nexport default function Login() {`
  );
  loginContent = loginContent.replace(
    'const [password, setPassword] = useState(\'\');',
    `const [password, setPassword] = useState('');\n  const location = useLocation();\n\n  useEffect(() => {\n    const params = new URLSearchParams(location.search);\n    if (params.get('registered') === 'true') {\n      showToast("Registration successful! Please log in.", "success");\n      // Remove param from URL to prevent infinite toasts on refresh\n      navigate('/login', { replace: true });\n    }\n  }, [location, showToast, navigate]);`
  );
}
fs.writeFileSync(loginPath, loginContent);

console.log("Pages modified.");
