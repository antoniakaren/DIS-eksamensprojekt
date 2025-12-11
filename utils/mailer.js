// utils/mailer.js
// Denne fil er ren “teknik”: forbindelsen til Gmail (eller anden SMTP) og en generel mailToUser-funktion.

import nodemailer from "nodemailer";

// Opretter en "transporter", der repræsenterer forbindelsen til mailserveren.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,   // smtp.mailersend.net
  port: Number(process.env.SMTP_PORT), // 587
  secure: false, // Skal være false på 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, 
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
 mailToUser: Generel hjælpefunktion til at sende en email.
 recipients - Modtagerens email (eller flere, adskilt med komma)
 subjectMsg - Emnet på mailen
 textMsg - Selve tekstindholdet i mailen (plain text)
 */
export async function mailToUser(recipients, subjectMsg, textMsg) {

  try {
  await transporter.sendMail({
    envelope: {
      from: "MS_xOKVJ1@understory.social",
      to: recipients,
    },
    from: "MS_xOKVJ1@understory.social",
    to: recipients,
    subject: subjectMsg,
    text: textMsg,
  });
    console.log("Email sendt afsted");
  } catch (error) {
    console.error("Fejl ved afsendelse af email:", error);
  }
}