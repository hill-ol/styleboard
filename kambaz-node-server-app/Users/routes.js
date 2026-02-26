import express from "express";
import bcrypt from "bcryptjs";
import * as dao from "./dao.js";

const router = express.Router();

// ─── Auth ───────────────────────────────────────────────

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
    req.session.currentUser = safeUser;
    res.status(201).json(safeUser);
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
    req.session.currentUser = safeUser;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out" });
});

// Get current session user
router.get("/profile", (req, res) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ message: "Not logged in" });
  }
  res.json(req.session.currentUser);
});

// ─── User profiles ───────────────────────────────────────

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
router.put("/:uid", async (req, res) => {
  try {
    if (!req.session.currentUser) {
      return res.status(401).json({ message: "Not logged in" });
    }
    if (req.session.currentUser._id !== req.params.uid) {
      return res.status(403).json({ message: "Cannot edit another user's profile" });
    }
    const updated = await dao.updateUser(req.params.uid, req.body);
    req.session.currentUser = updated;
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Follow a user
router.post("/:uid/follow", async (req, res) => {
  try {
    if (!req.session.currentUser) {
      return res.status(401).json({ message: "Not logged in" });
    }
    await dao.followUser(req.session.currentUser._id, req.params.uid);
    res.json({ message: "Followed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unfollow a user
router.delete("/:uid/follow", async (req, res) => {
  try {
    if (!req.session.currentUser) {
      return res.status(401).json({ message: "Not logged in" });
    }
    await dao.unfollowUser(req.session.currentUser._id, req.params.uid);
    res.json({ message: "Unfollowed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;