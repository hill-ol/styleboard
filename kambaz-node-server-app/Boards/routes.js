import express from "express";
import * as dao from "./dao.js";
import { requireAuth } from "../middleware.js";

const router = express.Router();

// Get all public boards
router.get("/", async (req, res) => {
  try {
    const boards = await dao.findPublicBoards();
    res.json(boards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get boards for a specific user
router.get("/user/:uid", async (req, res) => {
  try {
    const boards = await dao.findBoardsByUser(req.params.uid);
    res.json(boards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single board by ID
router.get("/:bid", async (req, res) => {
  try {
    const board = await dao.findBoardById(req.params.bid);
    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a board (auth required)
router.post("/", requireAuth, async (req, res) => {
  try {
    const board = await dao.createBoard({
      ...req.body,
      owner: req.currentUser._id,
    });
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a board (owner only)
router.put("/:bid", requireAuth, async (req, res) => {
  try {
    const board = await dao.findBoardById(req.params.bid);
    if (!board) return res.status(404).json({ message: "Board not found" });
    if (board.owner._id.toString() !== req.currentUser._id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const updated = await dao.updateBoard(req.params.bid, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a board (owner only)
router.delete("/:bid", requireAuth, async (req, res) => {
  try {
    const board = await dao.findBoardById(req.params.bid);
    if (!board) return res.status(404).json({ message: "Board not found" });
    if (board.owner._id.toString() !== req.currentUser._id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await dao.deleteBoard(req.params.bid);
    res.json({ message: "Board deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add item to board
router.post("/:bid/items/:iid", requireAuth, async (req, res) => {
  try {
    const updated = await dao.addItemToBoard(req.params.bid, req.params.iid);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove item from board
router.delete("/:bid/items/:iid", requireAuth, async (req, res) => {
  try {
    const updated = await dao.removeItemFromBoard(req.params.bid, req.params.iid);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;