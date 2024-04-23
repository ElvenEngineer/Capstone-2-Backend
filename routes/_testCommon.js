"use strict";

const db = require("../db");
const User = require("../models/user");
const Article = require("../models/article");
const { createToken } = require("../middleware/auth");

// Array to hold test data ids
let testArticleIds = [];

let u1Token
let u2Token

async function commonBeforeAll() {
    // Clear existing data
    await db.query("DELETE FROM user_saved_articles");
    await db.query("DELETE FROM articles");
    await db.query("DELETE FROM users");

    // Create sample users
    let user1 = await User.register({
        username: "u1",
        password: "password1"
    });
    let user2 = await User.register({
        username: "u2",
        password: "password2"
    });
    console.log("Created user with ID:", user1.id);

    console.log(user1, user2);

    // Tokens for testing authorization
    u1Token = createToken({ username: "u1", id: user1.id });
    u2Token = createToken({ username: "u2", id: user2.id });

    // Log for confirmation
    console.log("Created user1 with ID:", user1.id, "and token:", u1Token);
    console.log("Created user2 with ID:", user2.id, "and token:", u2Token);

    // Create sample articles and save their ids for referencing in tests
    testArticleIds[0] = (await Article.add({
        title: "Article 1",
        url: "http://example.com/article1",
        description: "Description of article 1",
        urltoimage: "http://example.com/img/article1.jpg"
    }, user1.id)).id;  // Assuming user with ID 1
    console.log('hello', testArticleIds);
    testArticleIds[1] = (await Article.add({
        title: "Article 2",
        url: "http://example.com/article2",
        description: "Description of article 2",
        urltoimage: "http://example.com/img/article2.jpg"
    }, user1.id)).id;  // Assuming user with ID 1

    // Assuming user u1 saved both articles
    console.log('user1.id', user1.id)
    // await db.query(
    //     `INSERT INTO user_saved_articles (user_id, article_id)
    //      VALUES ($1, $2), ($1, $3)`,
    //     [user1.id, testArticleIds[0], testArticleIds[1]]  // Assuming user with ID 1
    // );
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}



module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testArticleIds,
    // u1Token,
    // u2Token,
};
