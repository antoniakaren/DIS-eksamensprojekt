// models/postModel.js
import { run, get, all } from "../database/db.js";
import { Comment } from "./commentModel.js"; 

export const Post = {
  async create(userID, text, imageUrl, date) {
    return await run(
      `INSERT INTO Posts (userID, text, imageUrl, date)
       VALUES (?, ?, ?, ?)`,
      [userID, text, imageUrl, date]
    );
  },

  async getAll() {
    return await all(`
      SELECT Posts.*, Users.username AS author
      FROM Posts
      JOIN Users ON Posts.userID = Users.userID
      ORDER BY Posts.postID DESC
    `);
  },

  async find(postID) {
    return await get(`
      SELECT Posts.*, Users.username AS author
      FROM Posts
      JOIN Users ON Posts.userID = Users.userID
      WHERE Posts.postID = ?
    `, [postID]);
  },

  async delete(postID) {
    await Comment.deleteAllForPost(postID);
    return await run(`DELETE FROM Posts WHERE postID = ?`, [postID]);
  }  
};
