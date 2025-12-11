// middleware/attachUser.js
// Middleware der tilføjer den aktuelle bruger til req-objektet, hvis brugeren er logget ind

import { User } from "../models/userModel.js";

export async function attachUserIfLoggedIn(req, res, next) {
  try {
    // tjekker om der findes en session med userID
    // sessions håndteres af express-session
    const userID = req.session?.userID;

    // hvis ingen bruger er logget ind tilføjes null
    if (!userID) {
      req.user = null;
      return next(); // fortsæt til næste middleware/route
    }

    // find brugeren i databasen ud fra sessionens userID
    const user = await User.findUserID(userID);

    // req.user kan nu bruges i views 
    req.user = user || null;

    return next();
  } catch (err) {
    console.error("attachUserIfLoggedIn error:", err);

    // ved fejl fjerner vi brugerinfo og fortsætter
    req.user = null;
    return next();
  }
}
