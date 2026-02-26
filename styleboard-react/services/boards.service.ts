import api from "./api";

export const getPublicBoards = async () => {
  const res = await api.get("/boards");
  return res.data;
};

export const getBoardsByUser = async (uid: string) => {
  const res = await api.get(`/boards/user/${uid}`);
  return res.data;
};

export const getBoardById = async (bid: string) => {
  const res = await api.get(`/boards/${bid}`);
  return res.data;
};

export const createBoard = async (data: object) => {
  const res = await api.post("/boards", data);
  return res.data;
};

export const updateBoard = async (bid: string, data: object) => {
  const res = await api.put(`/boards/${bid}`, data);
  return res.data;
};

export const deleteBoard = async (bid: string) => {
  const res = await api.delete(`/boards/${bid}`);
  return res.data;
};

export const addItemToBoard = async (bid: string, iid: string) => {
  const res = await api.post(`/boards/${bid}/items/${iid}`);
  return res.data;
};

export const removeItemFromBoard = async (bid: string, iid: string) => {
  const res = await api.delete(`/boards/${bid}/items/${iid}`);
  return res.data;
};