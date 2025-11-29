import express from "express";
const router = express.Router();

// Import af controller med ESM
import {
  renderMailPage,
  sendMail,
  renderMailToUserPage,
  sendMailToUser
} from "../controllers/mailController.js";

// Generel mail-sides
router.get("/", renderMailPage);
router.post("/", sendMail);

// Mail mellem brugere – baseret på userID
router.get("/user/:userID", renderMailToUserPage);
router.post("/user/:userID", sendMailToUser);

export default router;
