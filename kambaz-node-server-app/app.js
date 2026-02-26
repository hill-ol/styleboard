import express from "express";
import cors from "cors";
import session from "express-session";
import "dotenv/config";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

// routes
import userRoutes from "./Users/routes.js";
app.use("/api/users", userRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "StyleBoard API is running" });
});

export default app;