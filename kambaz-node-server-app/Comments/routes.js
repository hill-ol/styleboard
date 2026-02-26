import express from "express";
import * as commentDao from "./dao.js";
import * as itemDao from "../SavedItems/dao.js";

const router = express.Router();

// Add a comment to an item (auth required)
router.post("/items/:iid/comments", async (req, res) => {
  try {
    if (!req.session.currentUser) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const comment = await commentDao.createComment({
      text: req.body.text,
      author: req.session.currentUser._id,
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
router.delete("/comments/:cid", async (req, res) => {
  try {
    if (!req.session.currentUser) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const comment = await commentDao.findCommentById(req.params.cid);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.author._id.toString() !== req.session.currentUser._id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await commentDao.deleteComment(req.params.cid);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;