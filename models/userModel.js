// models/userModel.js
// User-model der håndterer al database-logik for brugere

import { get, all, run } from "../database/db.js"; 
// get  = SELECT én række
// all  = SELECT flere rækker
// run  = INSERT / UPDATE / DELETE

import bcrypt from "bcrypt"; // bruges til hashing af passwords 



class User {
  constructor(userID, name, username, email, password) {
    this.userID = userID;
    this.name = name;
    this.username = username;
    this.email = email;     // email krypteret når den gemmes
    this.password = password; // plaintext password kun inden hashing
  }



  // Opretter en ny bruger i databasen
  async createUser() {
    // hash password før den gemmes — vigtigt for sikkerhed
    const hashedPassword = await bcrypt.hash(this.password, 10);

    const result = await run(
      `
        INSERT INTO Users (name, username, email, password)
        VALUES (?, ?, ?, ?)
      `,
      [this.name, this.username, this.email, hashedPassword]
    );

    // lastID er det nye userID genereret af SQLite
    this.userID = result.lastID;

    // returnerer et rent objekt uden password
    return {
      userID: this.userID,
      name: this.name,
      username: this.username,
      email: this.email,
    };
  }



  // Find bruger via userID - bruges ved session-tjek 
  static async findUserID(userID) {
    const user = await get(
      `SELECT * FROM Users WHERE userID = ?`,
      [userID]
    );
    return user; // objekt eller null
  }


  // Find bruger via brugernavn 
  static async findUserByUsername(username) {
    const user = await get(
      `SELECT * FROM Users WHERE username = ?`,
      [username]
    );
    return user; // objekt eller null
  }

  // Verificer login — tjekker brugernavn + bcrypt-hashed password
  static async verifyLogin(username, password) {
    const user = await User.findUserByUsername(username);
    if (!user) return null;

    // sammenligner plaintext password med hashed password i db
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
  }



  // Opdater password — bruges i changepassword 
  static async updateUserPassword(username, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await run(
      `UPDATE Users SET password = ? WHERE username = ?`,
      [hashedPassword, username]
    );
  }



  // Find alle brugere (kun til admin eller debugging)
  static async findAllUsers() {
    const users = await all(`SELECT * FROM Users ORDER BY userID ASC`);
    return users;
  }
}

export { User };
