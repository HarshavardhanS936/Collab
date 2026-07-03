import { axiosClient } from './axiosClient';

export async function fetchAdminDashboardStats() {
  const response = await axiosClient.get('/admin/dashboard-stats');
  return response.data;
}

export async function fetchAdminUsers() {
  const response = await axiosClient.get('/admin/users');
  return response.data;
}

export async function deactivateAdminUser(userId) {
  const response = await axiosClient.put(`/admin/users/${userId}/deactivate`);
  return response.data;
}

export async function deleteAdminUser(userId) {
  const response = await axiosClient.delete(`/admin/users/${userId}`);
  return response.data;
}
