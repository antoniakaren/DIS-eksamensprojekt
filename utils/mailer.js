// utils/mailer.js
// Denne fil er ren “teknik”: forbindelsen til Gmail (eller anden SMTP) og en generel mailToUser-funktion.

import nodemailer from "nodemailer";

// Opretter en "transporter", der repræsenterer forbindelsen til mailserveren.
// Her bruger vi Gmail, men det kunne også være anden udbyder.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // Mailersend SMTP bruger TLS på port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Tester om forbindelsen til SMTP-serveren virker, når serveren starter
transporter.verify((error) => {
  if (error) {
    console.log("Fejl i SMTP forbindelse:", error);
  } else {
    console.log("Mail-server er klar til at sende emails");
  }
});

/*
 * mailToUser: Generel hjælpefunktion til at sende en email.
 * recipients - Modtagerens email (eller flere, adskilt med komma)
 * subjectMsg - Emnet på mailen
 * textMsg    - Selve tekstindholdet i mailen (plain text)
 */
export async function mailToUser(recipients, subjectMsg, textMsg) {
  const senderName = "Understory Feed";
  const senderAddress = process.env.MAIL_USER; // Samme konto som vi logger ind med

  try {
    await transporter.sendMail({
      from: `${senderName} <${senderAddress}>`, // Afsender, som modtageren ser
      to: recipients, // Modtager
      subject: subjectMsg, // Emnefelt
      text: textMsg, // Tekstindhold
    });

    console.log("Email sendt afsted");
  } catch (error) {
    console.error("Fejl ved afsendelse af email:", error);
  }
}