import { User } from "../models/userModel.js";

// Middleware der kræver at brugeren er logget ind
async function requireLogin(req, res, next) {
  try {
    // Hvis ingen session = ingen adgang
    if (!req.session || !req.session.userID) {
      return res.redirect("/users/login");
    }

    const userID = req.session.userID;

    // Find brugeren i databasen
    const user = await User.findUserID(userID);

    if (!user) {
      // Session findes, men brugeren fandtes ikke -> outdated session
      req.session.destroy(() => {});
      return res.redirect("/users/login");
    }

    // Tilføj req.user, så controllers kan bruge data
    req.user = {
      userID: user.userID,
      name: user.name,
      username: user.username,
      email: user.email,
    };

    // Videre til næste middleware / route
    next();
  } catch (err) {
    console.error("requireLogin fejl:", err);
    res.status(500).send("Serverfejl i login-middleware");
  }
}

export { requireLogin };
