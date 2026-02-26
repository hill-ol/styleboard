import api from "./api";

export const register = async (data: {
  username: string;
  email: string;
  password: string;
  role: string;
}) => {
  const res = await api.post("/users/register", data);
  return res.data;
};

export const login = async (data: { username: string; password: string }) => {
  const res = await api.post("/users/login", data);
  return res.data;
};

export const logout = async () => {
  const res = await api.post("/users/logout");
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("/users/profile");
  return res.data;
};