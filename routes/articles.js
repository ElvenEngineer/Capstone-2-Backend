"use strict";

/** Routes for saved articles. */
const jwt = require('jsonwebtoken');
const { SECRET_KEY} = require("../config");


const jsonschema = require("jsonschema");

const express = require("express");
// const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Article = require("../models/article");
const articleNewSchema = require("../schemas/articleNew.json");

const router = express.Router();

// add the article to the database
router.post("/articles", async function (req, res, next) {
  try {
      // Extract user id from jwt
      const token = req.headers.authorization?.split(' ')[1]; 
      console.log('we are hitting post /articles')
      console.log(token)
      console.log('headers: ', req.headers);  
      // console.log(articleData)
      let userId;
      if (token) {
          try {
              const payload = jwt.verify(token, SECRET_KEY);
              userId = payload.userId; 
              console.log('user id', userId);
          } catch (err) {
              throw new BadRequestError("Invalid token");
          }
      } else {
          throw new BadRequestError("Missing token");
      }

      // Validate the incoming request body against the article schema
      const validator = jsonschema.validate(req.body, articleNewSchema);
      if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
      }

      // Insert the article into the database
      const article = await Article.add(req.body, userId);
      console.log('article id', article.id);

      // Insert the article id and user id into the association table
      

      // Here, include logic to associate the article with the user using userId and article.id

      // Return article json
      return res.status(201).json({ article });
  } catch (err) {
      return next(err);
  }
});


// Get all the saved articles in the database
router.get("/", async function (req, res, next) {
    try {
      console.log('we are hitting the /articles route')
      const articles = await Article.findAll();
      return res.json({ articles });
    } catch (err) {
      return next(err);
    }
  });

router.get("/saved", async function (req, res, next) {
  try {
    console.log('we are hitting /saved route')
      // Extract user id from jwt
      const token = req.headers.authorization?.split(' ')[1]; 
      console.log('we are hitting /saved route')
      let userId;
      if (token) {
          try {
              const payload = jwt.verify(token, SECRET_KEY);
              userId = payload.userId; 
              console.log('user id', userId);
          } catch (err) {
              throw new BadRequestError("Invalid token");
          }
      } else {
          throw new BadRequestError("Missing token");
      }
    const saved = await Article.getSavedArticle(userId);
    return res.json({ saved });
  } catch (err) {
    return next(err);
  }
});

  router.delete("/saved", async function (req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; 
    console.log('we are hitting the back end')
    console.log(req.query.title)
    const title = req.query.title; 
    console.log('title:', title);

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    try {
      const payload = jwt.verify(token, SECRET_KEY);
      await Article.remove(title);
      res.status(200).json({ message: "Article deleted successfully" });
    } catch (err) {
      next(err);
    }
  });



module.exports = router;