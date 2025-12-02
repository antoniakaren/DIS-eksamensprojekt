// utils/crypto.js
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const ALGO = "aes-256-gcm";
const KEY_HEX = process.env.APP_CRYPTO_KEY;            // 64 hex chars = 32 bytes
const KEY = KEY_HEX ? Buffer.from(KEY_HEX, "hex") : null;

function ensureKey() {
  if (!KEY || KEY.length !== 32) {
    throw new Error("APP_CRYPTO_KEY skal være 64 hex-tegn (32 bytes)");
  }
}

export function encrypt(plainText) {
  ensureKey();
  const iv = randomBytes(12); // 96-bit IV anbefalet til GCM
  const cipher = createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":"); // iv:tag:ciphertext
}

export function decrypt(payload) {
  ensureKey();
  const [ivHex, tagHex, dataHex] = payload.split(":");
  const decipher = createDecipheriv(ALGO, KEY, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
