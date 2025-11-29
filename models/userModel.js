// models/userModel.js
// Vi importerer connection poolen fra db
import pool from "../database/userdb.js";
// Bcrypt bruges til at hashe og verificere passwords
import bcrypt from "bcrypt";

class User {
  constructor(userID, name, username, email, password) {
    this.userID = userID;
    this.name = name;
    this.username = username;
    this.email = email;
    this.password = password; // plaintext når man lige har oprettet brugeren
  }

  // Opretter en ny bruger i databasen
  async createUser() {
    const hashedPassword = await bcrypt.hash(this.password, 10);

    const [result] = await pool.query(
      `INSERT INTO Users (name, username, email, password)
       VALUES (?, ?, ?, ?)`,
      [this.name, this.username, this.email, hashedPassword]
    );

    this.userID = result.insertId;

    return {
      userID: this.userID,
      username: this.username,
      name: this.name,
      email: this.email,
    };
  }

  // Find bruger via ID
  static async findUserID(userID) {
    const [rows] = await pool.query(
      `SELECT * FROM Users WHERE userID = ?`,
      [userID]
    );
    return rows[0]; // enten user eller undefined
  }

  // Find bruger via brugernavn
  static async findUserByUsername(username) {
    const [rows] = await pool.query(
      `SELECT * FROM Users WHERE username = ?`,
      [username]
    );
    return rows[0];
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

    await pool.query(
      `UPDATE Users SET password = ? WHERE username = ?`,
      [hashedPassword, username]
    );
  }
}

export { User };