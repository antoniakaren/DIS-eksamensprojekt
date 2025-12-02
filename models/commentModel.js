// models/commentModel.js
import { run, all } from "../database/db.js";

export const Comment = {
  async create(postID, userID, text, date) {
    return await run(
      `INSERT INTO Comments (postID, userID, text, date)
       VALUES (?, ?, ?, ?)`,
      [postID, userID, text, date]
    );
  },

  async getForPost(postID) {
    return await all(`
      SELECT Comments.*, Users.username AS author
      FROM Comments
      JOIN Users ON Comments.userID = Users.userID
      WHERE Comments.postID = ?
      ORDER BY Comments.commentID ASC
    `, [postID]);
  },

  async deleteAllForPost(postID) {
    return await run(`DELETE FROM Comments WHERE postID = ?`, [postID]);
  }
};
