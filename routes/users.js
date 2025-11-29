import express from "express";
const router = express.Router();

import {
  renderLogin,
  signup,
  login,
  logout,
  renderChangePassword,
  changePassword,
} from "../controllers/userController.js";

// root
router.get("/", (req, res) => {
  res.redirect("/users/login");
});

// GET /users/login
router.get("/login", renderLogin);

//  GET /users/signup – viser signup-siden
router.get("/signup", (req, res) => {
  res.render("signup", { error: null, msg: null, title: "Opret virksomhed" });
});

// POST handlers
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// change password
router.get("/change-password", renderChangePassword);
router.post("/change-password", changePassword);

export default router;