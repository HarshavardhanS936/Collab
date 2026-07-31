import { axiosClient } from './axiosClient';

export async function fetchDashboard() {
  const response = await axiosClient.get('/dashboard');
  return response.data;
}
