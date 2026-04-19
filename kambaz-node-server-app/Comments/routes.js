import express from "express";
import * as commentDao from "./dao.js";
import * as itemDao from "../SavedItems/dao.js";
import { requireAuth } from "../middleware.js";

const router = express.Router();

// Add a comment to an item (auth required)
router.post("/items/:iid/comments", requireAuth, async (req, res) => {
  try {
    const comment = await commentDao.createComment({
      text: req.body.text,
      author: req.currentUser._id,
      itemId: req.params.iid,
    });
    await itemDao.addCommentToItem(req.params.iid, comment._id);
    const populated = await commentDao.findCommentById(comment._id);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a comment (author only)
router.delete("/comments/:cid", requireAuth, async (req, res) => {
  try {
    const comment = await commentDao.findCommentById(req.params.cid);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.author._id.toString() !== req.currentUser._id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await commentDao.deleteComment(req.params.cid);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;