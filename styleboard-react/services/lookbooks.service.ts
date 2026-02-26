import api from "./api";

export const getPublishedLookbooks = async () => {
  const res = await api.get("/lookbooks");
  return res.data;
};

export const getLookbooksByStylist = async (uid: string) => {
  const res = await api.get(`/lookbooks/stylist/${uid}`);
  return res.data;
};

export const getLookbookById = async (lid: string) => {
  const res = await api.get(`/lookbooks/${lid}`);
  return res.data;
};

export const createLookbook = async (data: object) => {
  const res = await api.post("/lookbooks", data);
  return res.data;
};

export const updateLookbook = async (lid: string, data: object) => {
  const res = await api.put(`/lookbooks/${lid}`, data);
  return res.data;
};

export const deleteLookbook = async (lid: string) => {
  const res = await api.delete(`/lookbooks/${lid}`);
  return res.data;
};