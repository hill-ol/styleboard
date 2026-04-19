import api from "./api";

export const register = async (data: {
  username: string;
  email: string;
  password: string;
  role: string;
}) => {
  const res = await api.post("/users/register", data);
  const { user, token } = res.data;
  localStorage.setItem("sb_token", token);
  return user;
};

export const login = async (data: { username: string; password: string }) => {
  const res = await api.post("/users/login", data);
  const { user, token } = res.data;
  localStorage.setItem("sb_token", token);
  return user;
};

export const logout = async () => {
  localStorage.removeItem("sb_token");
  await api.post("/users/logout");
};

export const getProfile = async () => {
  const token = localStorage.getItem("sb_token");
  if (!token) throw new Error("No token");
  const res = await api.get("/users/profile");
  return res.data;
};