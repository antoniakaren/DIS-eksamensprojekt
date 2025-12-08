// controllers/userController.js
// Håndterer signup, login, logout og password-skift.

import { User } from "../models/userModel.js";
import { encrypt, decrypt } from "../utils/crypto.js";
import { sendWelcomeEmail } from "../controllers/mailController.js"; // *** automatisk mail ***

/*
 * validatePassword(password)
 * - returnerer string med fejlbesked hvis password er ugyldigt
 * - returnerer null hvis password er OK
 */
function validatePassword(password) {
  if (!password || password.length < 8) return "Password has to be at least 8 characters";
  if (!/[a-z]/.test(password)) return "Password has to include a lowercase letter";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter";
  if (!/[0-9]/.test(password)) return "Password has to include a number";
  return null;
}

/*
 * GET /auth/login
 * Viser login-siden.
 */
async function renderLogin(req, res) {
  res.render("login", { error: null, msg: null });
}

/*
 * POST /auth/signup
 * - læser input fra req.body
 * - validerer brugernavn og password
 * - tjekker om brugernavn allerede findes
 * - opretter bruger (modellen hasher password)
 * - logger brugeren ind og redirecter til feed
 */
async function signup(req, res) {
  try {
    const { name, username, email, password } = req.body;

    // Basal validering af brugernavn
    if (!username || username.length < 3) {
      return res.status(400).render("signup", {
        title: "Opret virksomhed",
        error: "Username must be at least 3 characters",
        msg: null,
      });
    }

    // Password-regler
    const pwdErr = validatePassword(password);
    if (pwdErr) {
      return res.status(400).render("signup", { 
        title: "Opret virksomhed",
        error: pwdErr, 
        msg: null 
      });
    }

    // Unikheds-tjek på brugernavn
    const existing = await User.findUserByUsername(username);
    if (existing) {
      return res.status(409).render("signup", { 
        title: "Opret virksomhed",
        error: "Username already exists", 
        msg: null 
      });
    }
// Krypter email før vi sender den til modellen
const encryptedEmail = encrypt(email);

    // Opretter bruger (User.createUser() hasher password)
const user = new User(null, name, username, encryptedEmail, password);
    const created = await user.createUser();
  
// Hent fuld bruger (inkl krypteret mail)
const newUser = await User.findUserID(created.userID);

// AUTOMATISK VELKOMSTMAIL 
await sendWelcomeEmail(newUser);

    // Opret session
    req.session.userID = created.userID;

    // Redirect til feed ved succes
    res.redirect("/feed");
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).render("signup", { 
      title: "Opret virksomhed",
      error: "Failed to create user", 
      msg: null 
    });
  }
}

/*
 * POST /auth/login
 * - læser brugernavn og password
 * - verificerer via User.verifyLogin (bcrypt)
 * - sætter session og redirecter til feed
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    const authed = await User.verifyLogin(username, password);
    if (!authed) {
      return res
        .status(401)
        .render("login", { error: "Incorrect username or password", msg: null });
    }

    req.session.userID = authed.userID;

    res.redirect("/feed");
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .render("login", { error: "Login failed. Try again.", msg: null });
  }
}

/*
 * (valgfri) GET /user/feed – hvis du bruger denne i stedet for feedRouter
 * Henter bruger ud fra session og viser feed-view.
 */
async function renderFeed(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const user = await User.findUserID(userID);
    if (!user) return res.status(404).send("User not found");

    res.render("feed", {
      username: user.username,
    });
  } catch (err) {
    console.error("Render feed error:", err);
    res.status(500).send("Failed to render feed");
  }
}

/*
 * GET /auth/change-password
 */
async function renderChangePassword(req, res) {
  const userID = req.session.userID;
  if (!userID) return res.status(401).send("Unauthorized");
  res.render("change-password", { error: null, msg: null });
}

/*
 * POST /auth/change-password
 */
async function changePassword(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const { oldPassword, newPassword } = req.body;

    const pwdErr = validatePassword(newPassword);
    if (pwdErr) {
      return res
        .status(400)
        .render("change-password", { error: pwdErr, msg: null });
    }

    const user = await User.findUserID(userID);
    if (!user) {
      return res
        .status(404)
        .render("change-password", { error: "User not found", msg: null });
    }

    const ok = await User.verifyLogin(user.username, oldPassword);
    if (!ok) {
      return res
        .status(401)
        .render("change-password", {
          error: "Old password is incorrect",
          msg: null,
        });
    }

    await User.updateUserPassword(user.username, newPassword);

    res.redirect("/feed");
  } catch (err) {
    console.error("Change password error:", err);
    res
      .status(500)
      .render("change-password", {
        error: "Something went wrong. Try again",
        msg: null,
      });
  }
}

/*
 * POST /auth/logout
 */
async function logout(req, res) {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Failed to log out");
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
}

export {
  validatePassword,
  renderLogin,
  signup,
  login,
  renderFeed,
  renderChangePassword,
  changePassword,
  logout,
};