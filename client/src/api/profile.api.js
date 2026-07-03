import { axiosClient } from './axiosClient';

export async function fetchProfile(userId) {
  const response = await axiosClient.get(`/profile/${userId}`);
  return response.data;
}

export async function updateProfile(data) {
  const response = await axiosClient.put('/profile', data);
  return response.data;
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await axiosClient.post('/profile/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}
