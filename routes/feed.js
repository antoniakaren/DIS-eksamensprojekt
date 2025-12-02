import express from "express";
const router = express.Router();

import { Post } from "../models/postModel.js";
import { Comment } from "../models/commentModel.js";
import { requireLogin } from "../middleware/authMiddleware.js";
import { User } from "../models/userModel.js";
import { sendCommentNotification } from "../controllers/mailController.js";


// ---------- FEED (GET) ----------
router.get("/", async (req, res) => {
  const posts = await Post.getAll();

  for (const post of posts) {
    post.comments = await Comment.getForPost(post.postID);
  }

  res.render("feed", { posts });
});


// ---------- KOMMENTARER (POST) ----------
router.post("/:id/comments", requireLogin, async (req, res) => { 
  const postID = parseInt(req.params.id, 10);
  const { comment } = req.body;

  if (!comment || !comment.trim()) {
    return res.redirect("/feed");
  }

  // Opret kommentar i DB
  await Comment.create(
    postID,
    req.user.userID,
    comment.trim(),
    new Date().toLocaleString()
  );

  // Send mail til post-ejer
  const post = await Post.find(postID);
  if (post) {
    const postOwner = await User.findUserID(post.userID);
    await sendCommentNotification(postOwner, req.user.username, comment.trim());
  }

  res.redirect("/feed");
});


// ---------- DELETE POST ----------
router.post("/:id/delete", requireLogin, async (req, res) => {
  const postID = parseInt(req.params.id, 10);

  // Find opslag
  const post = await Post.find(postID);
  if (!post) return res.status(404).send("Opslaget findes ikke.");

  // Kun ejeren må slette
  if (post.userID !== req.user.userID) {
    return res.status(403).send("Du har ikke tilladelse til at slette dette opslag.");
  }

  // Slet kommentarer
  await Comment.deleteAllForPost(postID);

  // Slet opslag
  await Post.delete(postID);

  res.redirect("/feed");
});

export default router;
