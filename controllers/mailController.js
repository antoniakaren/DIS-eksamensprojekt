// controllers/mailController.js
import { mailToUser } from "../utils/mailer.js";
import { decrypt } from "../utils/crypto.js";


export async function sendWelcomeEmail(user) {
  try {
    const email = user.email; // <-- plaintext, ingen decrypt endnu

    await mailToUser(
      email,
      "Velkommen til Understory",
      `Hej ${user.name},\nDin konto er nu oprettet!`
    );
  } catch (err) {
    console.error("Fejl ved sendWelcomeEmail:", err);
  }
}

/**
 * Send mail når en bruger laver et opslag
 */
export async function sendPostCreatedEmail(user, postText) {
  try {
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

/**
 * Send mail når en kommentar kommer på et opslag
 */
export async function sendCommentNotification(postOwner, commentAuthor, commentText) {
  try {
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
