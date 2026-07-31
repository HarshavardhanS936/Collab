import axiosClient from './axiosClient';

export const fetchProjectMessages = async (projectId) => {
  return axiosClient.get(`/projects/${projectId}/messages`);
};

export const sendMessage = async (projectId, content) => {
  return axiosClient.post(`/projects/${projectId}/messages`, { content });
};
