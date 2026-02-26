import User from "./schema.js";

export const createUser = (userData) => User.create(userData);

export const findUserByUsername = (username) =>
  User.findOne({ username });

export const findUserByEmail = (email) =>
  User.findOne({ email });

export const findUserById = (id) =>
  User.findById(id).select("-password");

export const updateUser = (id, updates) =>
  User.findByIdAndUpdate(id, updates, { new: true }).select("-password");

export const followUser = (currentUserId, targetUserId) =>
  Promise.all([
    User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } }),
    User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } }),
  ]);

export const unfollowUser = (currentUserId, targetUserId) =>
  Promise.all([
    User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } }),
    User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } }),
  ]);

export const getAllUsers = () =>
  User.find().select("-password");