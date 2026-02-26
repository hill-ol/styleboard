import api from "./api";

export const addComment = async (iid: string, text: string) => {
  const res = await api.post(`/items/${iid}/comments`, { text });
  return res.data;
};

export const deleteComment = async (cid: string) => {
  const res = await api.delete(`/comments/${cid}`);
  return res.data;
};