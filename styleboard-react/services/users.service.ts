import api from "./api";

export const getUserById = async (uid: string) => {
  const res = await api.get(`/users/${uid}`);
  return res.data;
};

export const updateUser = async (uid: string, data: object) => {
  const res = await api.put(`/users/${uid}`, data);
  return res.data;
};

export const followUser = async (uid: string) => {
  const res = await api.post(`/users/${uid}/follow`);
  return res.data;
};

export const unfollowUser = async (uid: string) => {
  const res = await api.delete(`/users/${uid}/follow`);
  return res.data;
};