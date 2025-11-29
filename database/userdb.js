// database/userdb.js
// SQLite med sqlite3 (som i undervisningen), men gjort klar til async/await

import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

sqlite3.verbose();

// __dirname fix (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path til databasefilen (ligger ved siden af denne fil)
const dbPath = path.join(__dirname, "mydb.sqlite");

// Åbn database (oprettes hvis den ikke findes)
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("SQLite connection error:", err);
  } else {
    console.log("Connected to SQLite database at", dbPath);
  }
});

// Opret Users-tabel hvis den ikke findes
db.serialize(() => {
  console.log("Ensuring Users-table exists");
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      userID   INTEGER PRIMARY KEY AUTOINCREMENT,
      name     TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      email    TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);
});

/**
 * Helper: kør et SELECT, returnér én række
 */
export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

/**
 * Helper: kør et SELECT, returnér alle rækker
 */
export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

/**
 * Helper: kør INSERT/UPDATE/DELETE
 */
export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      // this.lastID & this.changes kommer fra sqlite3
      resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });
}
