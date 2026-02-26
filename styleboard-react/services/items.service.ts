import api from "./api";

export const getTrendingItems = async () => {
  const res = await api.get("/items");
  return res.data;
};

export const getItemByUnsplashId = async (unsplashId: string) => {
  const res = await api.get(`/items/unsplash/${unsplashId}`);
  return res.data;
};

export const saveItem = async (data: {
  unsplashId: string;
  imageUrl: string;
  title?: string;
  photographer?: string;
  photographerUrl?: string;
  tags?: string[];
}) => {
  const res = await api.post("/items", data);
  return res.data;
};

export const unsaveItem = async (iid: string) => {
  const res = await api.delete(`/items/${iid}/save`);
  return res.data;
};