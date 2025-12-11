import express from "express";
const router = express.Router();

import { Post } from "../models/postModel.js";
import { Comment } from "../models/commentModel.js";
import { requireLogin } from "../middleware/authMiddleware.js"; 
// middleware som sikrer at brugeren er logget ind
import { User } from "../models/userModel.js";
import { sendCommentNotification } from "../controllers/mailController.js";



// Feed GET
// Henter alle opslag + deres kommentarer og viser feed-siden
router.get("/", async (req, res) => {
  // hent alle opslag (JOIN med Users sker i modellen)
  const posts = await Post.getAll();

  // hent kommentarer for hvert opslag
  for (const post of posts) {
    post.comments = await Comment.getForPost(post.postID);
  }

  // renderer EJS-view med alle posts og tilhørende kommentarer
  res.render("feed", { posts });
});



// Kommentarer POST
// Brugere skal være logget ind for at kommentere
router.post("/:id/comments", requireLogin, async (req, res) => { 
  const postID = parseInt(req.params.id, 10);
  const { comment } = req.body;

  // simpel validering – tom kommentar ignoreres
  if (!comment || !comment.trim()) {
    return res.redirect("/feed");
  }

  // opret ny kommentar i databasen
  await Comment.create(
    postID,
    req.user.userID,// req.user sættes af attachUser-middleware
    comment.trim(),
    new Date().toLocaleString()
  );

  // find opslagets ejer og send mail-notifikation
  const post = await Post.find(postID);
  if (post) {
    const postOwner = await User.findUserID(post.userID);

    await sendCommentNotification(
      postOwner,  // den der modtager mailen
      req.user.username, // den der kommenterede
      comment.trim()  // selve kommentaren
    );
  }

  res.redirect("/feed");
});



// Delete post 
// Kun ejeren af opslaget må slette det
router.post("/:id/delete", requireLogin, async (req, res) => {
  const postID = parseInt(req.params.id, 10);

  // find opslag i databasen
  const post = await Post.find(postID);
  if (!post) return res.status(404).send("Opslaget findes ikke.");

  // Tjek om nuværende bruger er ejeren
  if (post.userID !== req.user.userID) {
    return res.status(403).send("Du har ikke tilladelse til at slette dette opslag.");
  }

  // slet alle kommentarer knyttet til opslaget
  await Comment.deleteAllForPost(postID);

  // slet selve opslaget
  await Post.delete(postID);

  res.redirect("/feed");
});


export default router;
