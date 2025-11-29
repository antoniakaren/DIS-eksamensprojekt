import { User } from "../models/userModel.js";
import { mailToUser } from "../utils/mailer.js";

/* Viser en formular til at sende mail til en bestemt bruger.
 * Route: GET /mail/user/:userID
 * Krav:  Bruger skal være logget ind (vi antager, at middleware har tjekket det)
 */
async function renderMailToUserPage(req, res) {
  // Henter userID fra URL-parameteren
  const userID = parseInt(req.params.userID, 10);

  try {
    // Finder modtager-brugeren i databasen
    const recipient = await User.findUserID(userID);

    if (!recipient) {
      return res.status(404).send("Bruger ikke fundet");
    }

    // Vi sender recipient + evt. afsender-info med ned til viewet
    res.render("mailToUser", {
      title: "Send mail til bruger",
      recipient,         // indeholder fx recipient.name, recipient.email
      sender: req.user,  // den indloggede bruger (sættes af jeres auth-middleware)
    });
  } catch (error) {
    console.error("Fejl ved hentning af bruger:", error);
    res.status(500).send("Der opstod en serverfejl");
  }
}

/*Sender en mail til en bestemt bruger ud fra deres userID.
 * Route: POST /mail/user/:userID
 * Body:  { subject: "...", message: "..." }
 *  Bruger skal være logget ind (req.user er sat)
 */
async function sendMailToUser(req, res) {
  const userID = parseInt(req.params.userID, 10);

  try {
    // Finder modtageren i databasen
    const recipient = await User.findUserID(userID);

    if (!recipient) {
      return res.status(404).json({ message: "Bruger ikke fundet" });
    }

    // Emne og besked fra formularen
    const { subject, message } = req.body;

    // Afsender-information fra den indloggede bruger.
    // Her forventer vi, at jeres login-middleware har sat req.user:
    // req.user = { userID, name, username, email, ... }
    const senderName = req.user?.name || "En bruger på Understory";
    const senderEmail = req.user?.email || "ukendt email";

    //fuldt beskedindhold
    const fullMessage = `Besked fra: ${senderName} (${senderEmail}) ${message}`;

    // Sender mail til recipient.email via hjælperen
    await mailToUser(recipient.email, subject, fullMessage);

    // Svar tilbage til klienten. vi kan evt redirecte til feed
    res.status(201).json({
      message: "Email sendt til brugeren!",
      to: recipient.email,
    });
  } catch (error) {
    console.error("Fejl ved afsendelse af mail til bruger:", error);
    res.status(500).json({ message: "Der opstod en serverfejl" });
  }
}

/*Generel mail-side hvis vi vil lave en kontaktformular el lign
 * Route: GET /mail */
async function renderMailPage(req, res) {
  res.render("mail", { title: "Understory Mailer", sender: req.user });
}

/* Generel mail-afsendelse – uden at slå recipient op i DB.
 * Route: POST /mail
 * Body: { sendTo, sendSubject, sendText } */
async function sendMail(req, res) {
  const { sendTo, sendSubject, sendText } = req.body;

  await mailToUser(sendTo, sendSubject, sendText);

  res.status(201).json({ message: "Email sendt afsted!" });
}


export {
  renderMailPage,
  sendMail,
  renderMailToUserPage,
  sendMailToUser,
};
