import { axiosClient } from './axiosClient';

export async function generateDescription(idea) {
  const response = await axiosClient.post('/ai/generate-description', { idea });
  return response.data;
}

export async function suggestSkills(idea) {
  const response = await axiosClient.post('/ai/suggest-skills', { idea });
  return response.data;
}

export async function generateTasks(projectTitle) {
  const response = await axiosClient.post('/ai/generate-tasks', { projectTitle });
  return response.data;
}

export async function generateProject(idea) {
  const response = await axiosClient.post('/ai/generate-project', { idea });
  return response.data;
}
