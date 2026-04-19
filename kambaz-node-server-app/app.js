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
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// routes
import userRoutes from "./Users/routes.js";
import boardRoutes from "./Boards/routes.js";
import savedItemRoutes from "./SavedItems/routes.js";
import commentRoutes from "./Comments/routes.js";
import lookbookRoutes from "./Lookbooks/routes.js";

app.use("/api/users", userRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/items", savedItemRoutes);
app.use("/api", commentRoutes);
app.use("/api/lookbooks", lookbookRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "StyleBoard API is running" });
});

export default app;
