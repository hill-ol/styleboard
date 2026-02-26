import Comment from "./schema.js";

export const createComment = (data) => Comment.create(data);

export const findCommentById = (id) =>
  Comment.findById(id).populate("author", "username avatarUrl");

export const deleteComment = (id) => Comment.findByIdAndDelete(id);