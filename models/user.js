"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {
  // Authenticate user with username, password.
  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT username,
              password
       FROM users
       WHERE username = $1`,
      [username],
    );

    const user = result.rows[0];

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        delete user.password;
        return user;
      }
    }
    throw new UnauthorizedError("Invalid username/password");
  }

  // Register user with data.
  static async register({ username, password }) {
    const duplicateCheck = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (username, password)
       VALUES ($1, $2)
       RETURNING id, username`,
      [username, hashedPassword],
    );

    const user = result.rows[0];
    return user;
  }

  // Find all users.
  static async findAll() {
    const result = await db.query(
      `SELECT username
       FROM users
       ORDER BY username`,
    );

    return result.rows;
  }

  // Given a username, return data about user.
  static async get(username) {
    const userRes = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [username],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    // Assuming this is meant to find saved articles for the user, not jobs.
    // Adjusting SQL and variable names accordingly.
    // const userSavedArticlesRes = await db.query(
    //   `SELECT article_id
    //    FROM user_saved_articles
    //    WHERE user_id = (SELECT id FROM users WHERE username = $1)`, 
    //    [username]);

    // Assuming articles are what we want to attach to the user, not jobs.
    // user.savedArticles = userSavedArticlesRes.rows.map(a => a.article_id);
    return user;
  }

  // Update user data with `data`.
  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {});
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username`;

    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  // Delete given user from database; returns undefined.
  static async remove(username) {
    const result = await db.query(
      `DELETE FROM users WHERE username = $1 RETURNING username`,
      [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }
}

module.exports = User;
