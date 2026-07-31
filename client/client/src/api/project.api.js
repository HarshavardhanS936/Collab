import { axiosClient } from './axiosClient';

export async function fetchProjects(params) {
  const response = await axiosClient.get('/projects', { params });
  return response.data;
}

export async function fetchProjectById(id) {
  const response = await axiosClient.get(`/projects/${id}`);
  return response.data;
}

export async function createProject(data) {
  const response = await axiosClient.post('/projects', data);
  return response.data;
}

export async function updateProject(id, data) {
  const response = await axiosClient.put(`/projects/${id}`, data);
  return response.data;
}

export async function deleteProject(id) {
  const response = await axiosClient.delete(`/projects/${id}`);
  return response.data;
}
