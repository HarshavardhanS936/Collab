import { axiosClient } from './axiosClient';

export async function sendJoinRequest(projectId) {
  const response = await axiosClient.post(`/projects/${projectId}/join-requests`);
  return response.data;
}

export async function fetchJoinRequests(projectId) {
  const response = await axiosClient.get(`/projects/${projectId}/join-requests?status=pending`);
  return response.data;
}

export async function acceptJoinRequest(requestId) {
  const response = await axiosClient.put(`/join-requests/${requestId}/accept`);
  return response.data;
}

export async function rejectJoinRequest(requestId) {
  const response = await axiosClient.put(`/join-requests/${requestId}/reject`);
  return response.data;
}
