import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as dao from "./dao.js";
import { requireAuth } from "../middleware.js";

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    { _id: user._id, username: user.username, role: user.role },
    process.env.SESSION_SECRET,
    { expiresIn: "7d" }
  );

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existingUser = await dao.findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }
    const existingEmail = await dao.findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await dao.createUser({
      username,
      email,
      password: hashedPassword,
      role: role || "explorer",
    });
    const safeUser = { ...user.toObject(), password: undefined };
    const token = signToken(safeUser);
    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await dao.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const safeUser = { ...user.toObject(), password: undefined };
    const token = signToken(safeUser);
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Logout (client just deletes token)
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

// Get current user from token
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const user = await dao.findUserById(req.currentUser._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const safeUser = { ...user.toObject(), password: undefined };
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get any user by ID
router.get("/:uid", async (req, res) => {
  try {
    const user = await dao.findUserById(req.params.uid);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update own profile
router.put("/:uid", requireAuth, async (req, res) => {
  try {
    if (req.currentUser._id !== req.params.uid) {
      return res.status(403).json({ message: "Cannot edit another user's profile" });
    }
    const updated = await dao.updateUser(req.params.uid, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Follow a user
router.post("/:uid/follow", requireAuth, async (req, res) => {
  try {
    await dao.followUser(req.currentUser._id, req.params.uid);
    res.json({ message: "Followed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unfollow a user
router.delete("/:uid/follow", requireAuth, async (req, res) => {
  try {
    await dao.unfollowUser(req.currentUser._id, req.params.uid);
    res.json({ message: "Unfollowed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;