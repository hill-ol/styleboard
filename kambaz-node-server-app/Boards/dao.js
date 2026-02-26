import Board from "./schema.js";

export const createBoard = (data) => Board.create(data);

export const findBoardById = (id) =>
  Board.findById(id).populate("owner", "-password").populate("items");

export const findBoardsByUser = (userId) =>
  Board.find({ owner: userId }).populate("items");

export const findPublicBoards = () =>
  Board.find({ isPublic: true }).populate("owner", "-password");

export const updateBoard = (id, updates) =>
  Board.findByIdAndUpdate(id, updates, { new: true });

export const deleteBoard = (id) => Board.findByIdAndDelete(id);

export const addItemToBoard = (boardId, itemId) =>
  Board.findByIdAndUpdate(
    boardId,
    { $addToSet: { items: itemId } },
    { new: true }
  );

export const removeItemFromBoard = (boardId, itemId) =>
  Board.findByIdAndUpdate(
    boardId,
    { $pull: { items: itemId } },
    { new: true }
  );