// controllers/userController.js
// Håndterer signup, login, logout og password-skift.

import { User } from "../models/userModel.js";
import { encrypt, decrypt } from "../utils/crypto.js";
import { sendWelcomeEmail } from "../controllers/mailController.js"; // bruges til at sende automatisk velkomstmail

//funktion til at validere password-regler
function validatePassword(password) {
  if (!password || password.length < 8) return "Password has to be at least 8 characters";
  if (!/[a-z]/.test(password)) return "Password has to include a lowercase letter";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter";
  if (!/[0-9]/.test(password)) return "Password has to include a number";
  return null;
}

// GET /auth/login – viser login-siden
async function renderLogin(req, res) {
  res.render("login", { error: null, msg: null });
}

// POST /auth/signup – opretter ny bruger og logger ind
// læser input, validerer, tjekker om brugernavn findes, opretter bruger og laver session
async function signup(req, res) {
  try {
    const { name, username, email, password } = req.body;

    // basal validering af brugernavn
    if (!username || username.length < 3) {
      return res.status(400).render("signup", {
        title: "Opret virksomhed",
        error: "Username must be at least 3 characters",
        msg: null,
      });
    }

    // password-regler
    const pwdErr = validatePassword(password);
    if (pwdErr) {
      return res.status(400).render("signup", { 
        title: "Opret virksomhed",
        error: pwdErr, 
        msg: null 
      });
    }

    // tjek om brugernavn allerede findes i databasen
    const existing = await User.findUserByUsername(username);
    if (existing) {
      return res.status(409).render("signup", { 
        title: "Opret virksomhed",
        error: "Username already exists", 
        msg: null 
      });
    }

    // krypter email før vi sender den til modellen (beskytter persondata i databasen)
    const encryptedEmail = encrypt(email);

    // opretter bruger – modellen hasher selv password med bcrypt
    const user = new User(null, name, username, encryptedEmail, password);
    const created = await user.createUser();
  
    // hent fuld bruger (inkl krypteret mail) efter oprettelse
    const newUser = await User.findUserID(created.userID);

    // sender automatisk velkomstmail til den nye bruger
    await sendWelcomeEmail(newUser);

    // opretter session så brugeren bliver logget ind
    req.session.userID = created.userID;

    // redirect til feed ved succesfuld signup
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

// POST /auth/login – logger bruger ind
// læser brugernavn/password, verificerer via modellen og sætter session
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // verifyLogin tjekker brugernavn + password med bcrypt
    const authed = await User.verifyLogin(username, password);
    if (!authed) {
      return res
        .status(401)
        .render("login", { error: "Incorrect username or password", msg: null });
    }

    // gemmer userID i session, så vi kan genkende brugeren på andre sider
    req.session.userID = authed.userID;

    // redirect til feed hvis login er ok
    res.redirect("/feed");
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .render("login", { error: "Login failed. Try again.", msg: null });
  }
}

// (valgfri) GET /user/feed – hvis denne bruges i stedet for en separat feedRouter
// henter bruger ud fra session og renderer feed-view
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

// GET /auth/change-password – viser siden til skift af password
async function renderChangePassword(req, res) {
  const userID = req.session.userID;
  if (!userID) return res.status(401).send("Unauthorized");
  res.render("change-password", { error: null, msg: null });
}

// POST /auth/change-password – skifter password for den nuværende bruger
async function changePassword(req, res) {
  try {
    const userID = req.session.userID;
    if (!userID) return res.status(401).send("Unauthorized");

    const { oldPassword, newPassword } = req.body;

    // validerer det nye password med samme regler som ved signup
    const pwdErr = validatePassword(newPassword);
    if (pwdErr) {
      return res
        .status(400)
        .render("change-password", { error: pwdErr, msg: null });
    }

    // finder brugeren i databasen
    const user = await User.findUserID(userID);
    if (!user) {
      return res
        .status(404)
        .render("change-password", { error: "User not found", msg: null });
    }

    // tjekker om det gamle password er korrekt via verifyLogin
    const ok = await User.verifyLogin(user.username, oldPassword);
    if (!ok) {
      return res
        .status(401)
        .render("change-password", {
          error: "Old password is incorrect",
          msg: null,
        });
    }

    // opdaterer password i databasen (hashing sker i modellen)
    await User.updateUserPassword(user.username, newPassword);

    // redirect til feed efter succesfuldt password-skift
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

// POST /auth/logout – logger brugeren ud
// destruerer session og sletter session-cookien
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
