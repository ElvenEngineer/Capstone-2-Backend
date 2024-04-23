"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

class Article {
    // Find all saved articles.
    static async findAll() {
        const result = await db.query(
            `SELECT * 
            FROM articles`
        );

        return result.rows;
    }

    // Delete given article from databse; returns undefined. 
    static async remove(articleTitle) {
      const result = await db.query(
        `DELETE FROM articles WHERE title = $1 RETURNING title`,
        [articleTitle]
      );
      const article = result.rows[0];
      if (!article) {
        throw new NotFoundError(`No article with title: ${articleTitle}`);
      }
      return article.title; // Returning the title of the deleted article for confirmation
    }
    

    //Add an article to the database
    static async add(articleData, userId) {
        try {
          // Start database transaction
          await db.query('BEGIN');

          // Implementation to add article to the databse
          const articleResult = await db.query(
            `INSERT INTO articles (title, url, description, urlToImage) 
             VALUES ($1, $2, $3, $4) RETURNING id, title`,
            [articleData.title, articleData.url, articleData.description, articleData.image]
          );
          console.log('we are hitting article model .add method')
          const articleId = articleResult.rows[0].id;

          //Insert into association table
          await db.query(
            `INSERT INTO user_saved_articles (user_id, article_id) VALUES ($1, $2)`,
            [userId, articleId]
          );

          // Commit transaction
          await db.query('COMMIT');

          return articleResult.rows[0];
        } catch (error) {
          // Rollback transaction in case of error
          await db.query('ROLLBACK');
          throw error; 
        }
      }

    //retrieve saved articles from the database
    static async getSavedArticle(userId) {
        try {

          const query = `
            SELECT a.id, a.title, a.url, a.description, a.urlToImage 
            FROM articles a
            INNER JOIN user_saved_articles usa ON a.id = usa.article_id
            WHERE usa.user_id = $1;
          `;

          const result = await db.query(query, [userId]);

          return result.rows;
        } catch (error) {
          // Rollback transaction in case of error
            console.error("Error retrieving saved articles:", error);
          throw error; 
        }
      }
}

module.exports = Article;