import SavedItem from "./schema.js";

export const findOrCreateItem = async (itemData) => {
  const existing = await SavedItem.findOne({ unsplashId: itemData.unsplashId });
  if (existing) return existing;
  return SavedItem.create(itemData);
};

export const findItemById = (id) =>
  SavedItem.findById(id)
    .populate("savedBy", "username avatarUrl")
    .populate({ path: "comments", populate: { path: "author", select: "username avatarUrl" } });

export const findItemByUnsplashId = (unsplashId) =>
  SavedItem.findOne({ unsplashId })
    .populate("savedBy", "username avatarUrl")
    .populate({ path: "comments", populate: { path: "author", select: "username avatarUrl" } });

export const addSavedBy = (itemId, userId) =>
  SavedItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { savedBy: userId }, $inc: { saveCount: 1 } },
    { new: true }
  );

export const removeSavedBy = (itemId, userId) =>
  SavedItem.findByIdAndUpdate(
    itemId,
    { $pull: { savedBy: userId }, $inc: { saveCount: -1 } },
    { new: true }
  );

export const addCommentToItem = (itemId, commentId) =>
  SavedItem.findByIdAndUpdate(
    itemId,
    { $push: { comments: commentId } },
    { new: true }
  );

export const findRecentItems = () =>
  SavedItem.find().sort({ saveCount: -1 }).limit(20);