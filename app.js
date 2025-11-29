import "dotenv/config";
import express from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import morgan from "morgan";

import { fileURLToPath } from "url";
import { dirname } from "path";

import { attachUserIfLoggedIn } from "./middleware/attachUser.js";

import indexRouter from "./routes/index.js";
import feedRouter from "./routes/feed.js";
import uploadRouter from "./routes/upload.js";
import usersRouter from "./routes/users.js";

const app = express();

// --- ESM __dirname fix ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Logging
app.use(morgan("dev"));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

// Static files
app.use(express.static(path.join(__dirname, "public")));

// 🔑 GLOBAL: sæt req.user og res.locals.user for ALLE requests
app.use(attachUserIfLoggedIn);
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use("/", indexRouter);
app.use("/feed", feedRouter);
app.use("/upload", uploadRouter);
app.use("/users", usersRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
