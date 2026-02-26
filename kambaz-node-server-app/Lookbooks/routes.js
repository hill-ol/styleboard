import express from "express";
import * as dao from "./dao.js";

const router = express.Router();

// Get all published lookbooks
router.get("/", async (req, res) => {
  try {
    const lookbooks = await dao.findPublishedLookbooks();
    res.json(lookbooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get lookbooks by stylist
router.get("/stylist/:uid", async (req, res) => {
  try {
    const lookbooks = await dao.findLookbooksByStylist(req.params.uid);
    res.json(lookbooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single lookbook
router.get("/:lid", async (req, res) => {
  try {
    const lookbook = await dao.findLookbookById(req.params.lid);
    if (!lookbook) return res.status(404).json({ message: "Lookbook not found" });
    await dao.incrementViewCount(req.params.lid);
    res.json(lookbook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create lookbook (stylist only)
router.post("/", async (req, res) => {
  try {
    if (!req.session.currentUser) {
      return res.status(401).json({ message: "Not logged in" });
    }
    if (req.session.currentUser.role !== "stylist") {
      return res.status(403).json({ message: "Only stylists can create lookbooks" });
    }
    const lookbook = await dao.createLookbook({
      ...req.body,
      stylist: req.session.currentUser._id,
    });
    res.status(201).json(lookbook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update lookbook (stylist/owner only)
router.put("/:lid", async (req, res) => {
  try {
    if (!req.session.currentUser) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const lookbook = await dao.findLookbookById(req.params.lid);
    if (!lookbook) return res.status(404).json({ message: "Lookbook not found" });
    if (lookbook.stylist._id.toString() !== req.session.currentUser._id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const updated = await dao.updateLookbook(req.params.lid, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete lookbook (stylist/owner only)
router.delete("/:lid", async (req, res) => {
  try {
    if (!req.session.currentUser) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const lookbook = await dao.findLookbookById(req.params.lid);
    if (!lookbook) return res.status(404).json({ message: "Lookbook not found" });
    if (lookbook.stylist._id.toString() !== req.session.currentUser._id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await dao.deleteLookbook(req.params.lid);
    res.json({ message: "Lookbook deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;