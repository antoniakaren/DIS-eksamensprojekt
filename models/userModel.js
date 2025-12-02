// models/userModel.js
// User-model der bruger SQLite helpers (get/all/run)

import { get, all, run } from "../database/db.js";
import bcrypt from "bcrypt";

class User {
  constructor(userID, name, username, email, password) {
    this.userID = userID;
    this.name = name;
    this.username = username;
    this.email = email;
    this.password = password; // plaintext når vi lige har modtaget den fra form
  }

  // Opretter en ny bruger i databasen
  async createUser() {
    const hashedPassword = await bcrypt.hash(this.password, 10);

    const result = await run(
      `
        INSERT INTO Users (name, username, email, password)
        VALUES (?, ?, ?, ?)
      `,
      [this.name, this.username, this.email, hashedPassword]
    );

    this.userID = result.lastID;

    return {
      userID: this.userID,
      name: this.name,
      username: this.username,
      email: this.email,
    };
  }

  // Find bruger via ID
  static async findUserID(userID) {
    const user = await get(
      `SELECT * FROM Users WHERE userID = ?`,
      [userID]
    );
    return user; // enten objekt eller null
  }

  // Find bruger via brugernavn
  static async findUserByUsername(username) {
    const user = await get(
      `SELECT * FROM Users WHERE username = ?`,
      [username]
    );
    return user; // enten objekt eller null
  }

  // Verificer login (brugernavn + password)
  static async verifyLogin(username, password) {
    const user = await User.findUserByUsername(username);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
  }

  // Opdater password
  static async updateUserPassword(username, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await run(
      `UPDATE Users SET password = ? WHERE username = ?`,
      [hashedPassword, username]
    );
  }

  // (valgfrit) find alle brugere
  static async findAllUsers() {
    const users = await all(`SELECT * FROM Users ORDER BY userID ASC`);
    return users;
  }
}

export { User };
