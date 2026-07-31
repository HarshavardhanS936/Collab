import { axiosClient } from './axiosClient';

export async function fetchProjectTasks(projectId) {
  const response = await axiosClient.get(`/projects/${projectId}/tasks`);
  return response.data;
}

export async function createTask(projectId, data) {
  const response = await axiosClient.post(`/projects/${projectId}/tasks`, data);
  return response.data;
}

export async function updateTask(taskId, data) {
  const response = await axiosClient.put(`/tasks/${taskId}`, data);
  return response.data;
}

export async function toggleTaskStatus(taskId) {
  const response = await axiosClient.put(`/tasks/${taskId}/status`);
  return response.data;
}

export async function deleteTask(taskId) {
  const response = await axiosClient.delete(`/tasks/${taskId}`);
  return response.data;
}
