import express from "express";
import * as dao from "./dao.js";
import { requireAuth } from "../middleware.js";

const router = express.Router();

// Get trending/recent items
router.get("/", async (req, res) => {
  try {
    const items = await dao.findRecentItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get item by Unsplash ID
router.get("/unsplash/:unsplashId", async (req, res) => {
  try {
    const item = await dao.findItemByUnsplashId(req.params.unsplashId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get item by MongoDB ID
router.get("/:iid", async (req, res) => {
  try {
    const item = await dao.findItemById(req.params.iid);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save an item (auth required)
router.post("/", requireAuth, async (req, res) => {
  try {
    const item = await dao.findOrCreateItem(req.body);
    const updated = await dao.addSavedBy(item._id, req.currentUser._id);
    res.status(201).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unsave an item (auth required)
router.delete("/:iid/save", requireAuth, async (req, res) => {
  try {
    const updated = await dao.removeSavedBy(req.params.iid, req.currentUser._id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;