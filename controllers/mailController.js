// controllers/mailController.js
// Håndterer afsendelse af automatiske emails i applikationen

import { mailToUser } from "../utils/mailer.js"; // funktion der faktisk sender selve mailen
import { decrypt } from "../utils/crypto.js";     // bruges til at dekryptere email fra databasen


// Sender velkomstmail når en ny bruger oprettes
export async function sendWelcomeEmail(user) {
  try {
    // email er gemt krypteret i databasen – vi dekrypterer før afsendelse
    const email = decrypt(user.email);

    await mailToUser(
      email,
      "Velkommen til Understory",
      `Hej ${user.name},\nDin konto er nu oprettet!`
    );
  } catch (err) {
    console.error("Fejl ved sendWelcomeEmail:", err);
  }
}


// Sender mail når en bruger har oprettet et opslag
export async function sendPostCreatedEmail(user, postText) {
  try {
    // dekrypter email, da den er lagret sikkert
    const email = decrypt(user.email);

    await mailToUser(
      email,
      "Dit opslag er nu live",
      `Hej ${user.username},\nDit opslag er blevet oprettet:\n\n"${postText}"`
    );
  } catch (err) {
    console.error("Fejl ved sendPostCreatedEmail:", err);
  }
}


// Sender mail til opslagsejer når en anden bruger kommenterer
export async function sendCommentNotification(postOwner, commentAuthor, commentText) {
  try {
    // dekrypter email for opslagsejeren
    const email = decrypt(postOwner.email);

    await mailToUser(
      email,
      "Ny kommentar på dit opslag",
      `Hej ${postOwner.username},\n${commentAuthor} har kommenteret:\n\n"${commentText}"`
    );
  } catch (err) {
    console.error("Fejl ved sendCommentNotification:", err);
  }
}
