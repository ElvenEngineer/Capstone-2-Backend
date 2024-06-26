"use strict";

/** Express app for jobly. */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");
const authRoutes = require('./routes/auth');
const articlesRoutes = require("./routes/articles")
const usersRoutes = require("./routes/users");
const newsRoutes = require("./routes/news");
const { authenticateJWT } = require("./middleware/auth");

const morgan = require("morgan");

const app = express();

app.use(cors());

app.use(express.json());
app.use("/articles", articlesRoutes);
app.use("/users", usersRoutes);

app.use(authenticateJWT);
app.use(morgan("tiny"));
app.use("/", newsRoutes);
app.use("/auth", authRoutes);

app.get('/test', function (req, res){
  return res.status(200).json({
    message: 'yes'
  })
})

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
    return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;
  
    return res.status(status).json({
      error: { message, status },
    });
  });
  
  app.use(function (err, req, res, next){
    return res.status(200).json({
      message: 'yes'
    })
  })
  
  module.exports = app;

