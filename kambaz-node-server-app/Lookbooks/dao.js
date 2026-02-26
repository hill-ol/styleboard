import Lookbook from "./schema.js";

export const createLookbook = (data) => Lookbook.create(data);

export const findLookbookById = (id) =>
  Lookbook.findById(id)
    .populate("stylist", "username avatarUrl displayName")
    .populate("items");

export const findLookbooksByStylist = (stylistId) =>
  Lookbook.find({ stylist: stylistId }).populate("items");

export const findPublishedLookbooks = () =>
  Lookbook.find({ isPublished: true })
    .populate("stylist", "username avatarUrl displayName")
    .sort({ createdAt: -1 });

export const updateLookbook = (id, updates) =>
  Lookbook.findByIdAndUpdate(id, updates, { new: true });

export const deleteLookbook = (id) => Lookbook.findByIdAndDelete(id);

export const incrementViewCount = (id) =>
  Lookbook.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true });