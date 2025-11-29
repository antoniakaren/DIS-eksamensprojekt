// routes/upload.js
import express from "express";
const router = express.Router();

import { uploadMiddleware, handleUpload } from "../controllers/uploadController.js";
import { requireLogin } from "../middleware/authMiddleware.js";

// GET upload-siden – kun for loggede brugere
router.get("/", requireLogin, (req, res) => {
  res.render("upload", { title: "Upload" });
});

// POST upload handling – også kun for loggede brugere
router.post("/", requireLogin, uploadMiddleware, handleUpload);

export default router;
