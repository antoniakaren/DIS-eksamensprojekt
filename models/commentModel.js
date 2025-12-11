// models/commentModel.js
// Model-laget for Comments – håndterer databasekald for kommentarer

import { run, all } from "../database/db.js"; 
// run = INSERT / UPDATE / DELETE
// all = SELECT mange rækker



export const Comment = {

  // Opretter en ny kommentar i databasen
  async create(postID, userID, text, date) {
    return await run(
      `INSERT INTO Comments (postID, userID, text, date)
       VALUES (?, ?, ?, ?)`,
      [postID, userID, text, date]
    );
  },


  // Henter alle kommentarer til et bestemt opslag
  // JOIN bruges til at hente username på den bruger der skrev kommentaren
  async getForPost(postID) {
    return await all(`
      SELECT Comments.*, Users.username AS author
      FROM Comments
      JOIN Users ON Comments.userID = Users.userID
      WHERE Comments.postID = ?
      ORDER BY Comments.commentID ASC
    `, [postID]);
  },


  // Sletter alle kommentarer knyttet til et opslag
  // bruges fx hvis et opslag slettes
  async deleteAllForPost(postID) {
    return await run(`DELETE FROM Comments WHERE postID = ?`, [postID]);
  }
};
