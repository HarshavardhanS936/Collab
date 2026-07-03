import { axiosClient } from './axiosClient';

export async function fetchNotifications() {
  const response = await axiosClient.get('/notifications');
  return response.data;
}

export async function markNotificationAsRead(id) {
  const response = await axiosClient.put(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await axiosClient.put('/notifications/read-all');
  return response.data;
}
