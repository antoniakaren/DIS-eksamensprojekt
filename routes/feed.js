// routes/feed.js
import express from "express";
const router = express.Router();

import posts from "../data/posts.js";
import { requireLogin } from "../middleware/authMiddleware.js";

import { User } from "../models/userModel.js";
import { sendCommentNotification } from "../controllers/mailController.js";


// GET /feed - offentlig (alle kan se opslag + kommentarer)
router.get("/", (req, res) => {
  res.render("feed", {
    title: "Feed",
    posts,
  });
});

// POST /feed/:id/comments - kræver login
router.post("/:id/comments", requireLogin, async (req, res) => { 
  const postId = parseInt(req.params.id, 10);
  const { comment } = req.body;

  const post = posts.find((p) => p.id === postId);
  if (!post) {
    return res.status(404).send("Opslaget blev ikke fundet.");
  }

  if (!comment || comment.trim().length === 0) {
    return res.redirect("/feed");
  }

  // req.user er sat af attachUserIfLoggedIn (globalt)
  post.comments.push({
    text: comment.trim(),
    author: req.user.username,
    date: new Date().toLocaleString(),
  });

  // ----------- AUTO MAIL ----------
  try {
    const postOwner = await User.findUserByUsername(post.author);

    if (postOwner) {
      await sendCommentNotification(
        postOwner,
        req.user.username,
        comment.trim()
      );
    }
  } catch (err) {
    console.error("Fejl ved automatisk kommentar-mail:", err);
  }

  res.redirect("/feed");
});

export default router;
