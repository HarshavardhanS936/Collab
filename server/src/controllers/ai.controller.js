import { callOpenRouter } from '../services/openrouter.service.js';
import { ApiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const generateDescription = asyncHandler(async (req, res, next) => {
  const { idea } = req.body;

  if (!idea || typeof idea !== 'string') {
    return next(new ApiError(400, 'Idea is required and must be a string'));
  }

  if (idea.length < 10 || idea.length > 300) {
    return next(new ApiError(400, 'Idea must be between 10 and 300 characters'));
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a professional technical writer for student software projects.'
    },
    {
      role: 'user',
      content: `Write a concise, professional 3-4 sentence project description for this student project idea: ${idea}`
    }
  ];

  // If this throws, asyncHandler automatically intercepts it and forwards it via next(err)
  const content = await callOpenRouter(messages);
  
  return apiResponse(res, 200, 'Description generated successfully', {
    description: content.trim()
  });
});

export const suggestSkills = asyncHandler(async (req, res, next) => {
  const { idea } = req.body;

  if (!idea || typeof idea !== 'string') {
    return next(new ApiError(400, 'Idea is required and must be a string'));
  }

  const messages = [
    {
      role: 'system',
      content: 'You must output ONLY a comma-separated list of 5-10 relevant technologies/skills. Do not include any extra commentary, labels, or formatting.'
    },
    {
      role: 'user',
      content: idea
    }
  ];

  const content = await callOpenRouter(messages);
  
  // Parse the comma-separated response into a de-duplicated array of trimmed strings
  const rawSkills = content.split(',').map(s => s.trim()).filter(s => s.length > 0);
  const skills = [...new Set(rawSkills)];

  return apiResponse(res, 200, 'Skills suggested successfully', { skills });
});

export const generateProject = asyncHandler(async (req, res, next) => {
  const { idea } = req.body;

  if (!idea || typeof idea !== 'string') {
    return next(new ApiError(400, 'Idea is required and must be a string'));
  }

  if (idea.length < 5 || idea.length > 500) {
    return next(new ApiError(400, 'Idea must be between 5 and 500 characters'));
  }

  const messages = [
    {
      role: 'system',
      content: `You are a technical project architect. The user will give you a brief project idea.
You must return ONLY a raw JSON object (without markdown code blocks) with the following structure:
{
  "title": "A short, catchy project title",
  "description": "A concise, professional 3-4 sentence project description",
  "skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"]
}
Do not include any other text.`
    },
    {
      role: 'user',
      content: idea
    }
  ];

  const content = await callOpenRouter(messages, { maxTokens: 800 });
  
  try {
    const rawJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(rawJson);
    return apiResponse(res, 200, 'Project generated successfully', data);
  } catch (err) {
    console.error('Failed to parse AI response as JSON:', content);
    return next(new ApiError(500, 'Failed to parse AI response'));
  }
});

export const generateTasks = asyncHandler(async (req, res, next) => {
  const { projectTitle } = req.body;

  if (!projectTitle || typeof projectTitle !== 'string') {
    return next(new ApiError(400, 'Project title is required and must be a string'));
  }

  const messages = [
    {
      role: 'system',
      content: 'You must output ONLY a numbered list of 6-10 concise development tasks for building this project, one per line. Do not include any extra commentary or introductory text.'
    },
    {
      role: 'user',
      content: projectTitle
    }
  ];

  const content = await callOpenRouter(messages, { maxTokens: 800 });
  
  // Parse the numbered list into an array of task title strings
  // Strips leading numbers, periods, bullets, and trims whitespace
  const rawLines = content.split('\n');
  const tasks = rawLines
    .map(line => line.replace(/^[0-9.\-*]+\s*/, '').trim())
    .filter(line => line.length > 0);

  return apiResponse(res, 200, 'Tasks generated successfully', { tasks });
});
