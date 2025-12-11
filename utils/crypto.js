// utils/crypto.js
// Håndterer symmetrisk kryptering/dekryptering af følsomme data (fx brugerens email)
// AES-256-GCM giver både kryptering og integritetskontrol (auth tag)

import { randomBytes, createCipheriv, createDecipheriv } from "crypto";


// vælges algoritme – AES-256-GCM er moderne, sikker og hurtig
const ALGO = "aes-256-gcm";

// krypteringsnøglen hentes fra miljøvariabel
// 64 hex tegn = 32 bytes → krævet for AES-256
const KEY_HEX = process.env.APP_CRYPTO_KEY;
const KEY = KEY_HEX ? Buffer.from(KEY_HEX, "hex") : null;


// sikrer at nøglen eksisterer og har korrekt længde
function ensureKey() {
  if (!KEY || KEY.length !== 32) {
    throw new Error("APP_CRYPTO_KEY skal være 64 hex-tegn (32 bytes)");
  }
}

//encrypt 
// Krypterer tekst og returnerer: iv:tag:ciphertext
export function encrypt(plainText) {
  ensureKey();

  // GCM anbefaler en 96-bit (12-byte) IV for optimal sikkerhed
  const iv = randomBytes(12);

  // initialiserer cipher med algoritme, nøgle og IV
  const cipher = createCipheriv(ALGO, KEY, iv);

  // krypterer data
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final()
  ]);

  // auth tag sikrer integritet (beskytter mod manipulation)
  const tag = cipher.getAuthTag();

  // returnerer tre værdier samlet i ét felt til databasen
  return [
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":"); // format: iv:tag:ciphertext
}


// Dekryptering af payload i formatet "iv:tag:ciphertext"
export function decrypt(payload) {
  ensureKey();

  const [ivHex, tagHex, dataHex] = payload.split(":");

  // opretter decipher med samme algoritme og nøgle
  const decipher = createDecipheriv(ALGO, KEY, Buffer.from(ivHex, "hex"));

  // auth tag skal sættes før man dekrypterer 
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  // dekrypterer data
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
