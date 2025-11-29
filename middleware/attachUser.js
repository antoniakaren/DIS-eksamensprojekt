// middleware/attachUser.js
import { User } from "../models/userModel.js";

export async function attachUserIfLoggedIn(req, res, next) {
  try {
    const userID = req.session?.userID;

    if (!userID) {
      req.user = null;
      return next();
    }

    const user = await User.findUserID(userID);
    req.user = user || null;

    return next();
  } catch (err) {
    console.error("attachUserIfLoggedIn error:", err);
    req.user = null;
    return next();
  }
}