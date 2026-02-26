const UNSPLASH_BASE = "https://api.unsplash.com";
const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

export const searchPhotos = async (query: string, page = 1, perPage = 20) => {
  const res = await fetch(
    `${UNSPLASH_BASE}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&client_id=${ACCESS_KEY}`
  );
  if (!res.ok) throw new Error("Unsplash search failed");
  return res.json();
};

export const getPhotoById = async (id: string) => {
  const res = await fetch(
    `${UNSPLASH_BASE}/photos/${id}?client_id=${ACCESS_KEY}`
  );
  if (!res.ok) throw new Error("Unsplash fetch failed");
  return res.json();
};

export const getRandomFashionPhotos = async (count = 12) => {
  const res = await fetch(
    `${UNSPLASH_BASE}/photos/random?query=fashion&count=${count}&client_id=${ACCESS_KEY}`
  );
  if (!res.ok) throw new Error("Unsplash fetch failed");
  return res.json();
};

// Required by Unsplash TOS — call when user saves a photo
export const triggerDownload = async (id: string) => {
  await fetch(
    `${UNSPLASH_BASE}/photos/${id}/download?client_id=${ACCESS_KEY}`
  );
};