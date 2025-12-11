// models/postModel.js
// Model-laget for Posts – håndterer databasekald for opslag

import { run, get, all } from "../database/db.js";
// run  = INSERT / UPDATE / DELETE
// all  = SELECT flere rækker
// get  = SELECT én række

import { Comment } from "./commentModel.js"; 
// bruges til at slette kommentarer når et opslag slettes



export const Post = {

  // Opretter et nyt opslag i databasen
  async create(userID, text, imageUrl, date) {
    return await run(
      `INSERT INTO Posts (userID, text, imageUrl, date)
       VALUES (?, ?, ?, ?)`,
      [userID, text, imageUrl, date]
    );
  },


  // Henter alle opslag – newest first
  // JOIN giver forfatterens username med i resultatet
  async getAll() {
    return await all(`
      SELECT Posts.*, Users.username AS author
      FROM Posts
      JOIN Users ON Posts.userID = Users.userID
      ORDER BY Posts.postID DESC
    `);
  },


  // Finder ét opslag ud fra postID
  // bruges fx når man viser detaljer for et opslag
  async find(postID) {
    return await get(`
      SELECT Posts.*, Users.username AS author
      FROM Posts
      JOIN Users ON Posts.userID = Users.userID
      WHERE Posts.postID = ?
    `, [postID]);
  },


  // Sletter et opslag
  // først slettes alle kommentarer (foreign key dependency)
  // derefter slettes selve opslaget
  async delete(postID) {
    await Comment.deleteAllForPost(postID);
    return await run(`DELETE FROM Posts WHERE postID = ?`, [postID]);
  }  
};
