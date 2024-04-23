"use strict";

/** Routes for companies. */

// const jsonschema = require("jsonschema");
const express = require("express");
const axios = require('axios');
const bcrypt = require("bcrypt");
const {BCRYPT_WORK_FACTOR, SECRET_KEY} = require("../config");
const jwt = require("jsonwebtoken")
const { ensureLoggedIn } = require("../middleware/auth")

const { BadRequestError } = require("../expressError");


const API_Key = '401f00ccc6974e46845bfeee32c712df'

const router = new express.Router();

// Function to fetch data from the API triggered by search
async function getDataFromAPI(keyword) {
    try {
        const response = await axios.get(`https://newsapi.org/v2/everything?q=${keyword}&apiKey=${API_Key}`);
        // const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=401f00ccc6974e46845bfeee32c712df`);
        // console.log('response data', response.data);
        return response.data;
    } catch (error) {
        throw error; 
    }
}

// Function to fetch data from the API top headlines
async function getTopNews(country='us', category='health') {
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=${country || 'us'}&category=${category || 'health'}&apiKey=${API_Key}`);
    console.log('get top news activated')
    console.log('here is the country', country)

    return response.data;
  } catch (error) {
    throw error;
  }
}

router.get("/news", async (req, res, next) => {
  try {
    const keyword = req.query.q || 'keyword';
    const data = await getDataFromAPI(keyword);
    res.json(data);
  } catch (err) {
    return next(err);
  }
});

router.get("/home", async (req, res, next) => {
  try {
    const country = req.query.country || 'us';
    const category = req.query.cat || 'general';
    console.log(category);
    console.log(country);
    const data = await getTopNews(country, category);
    res.json(data);
  } catch (err) {
    return next(err);
  }
})

// router.get("/saved", async (req, res, next) => {
//   try {
//     const country = req.query.country || 'us';
//     const category = req.query.cat || 'general';
//     console.log(category);
//     console.log(country);
//     const data = await getTopNews(country, category);
//     res.json(data);
//   } catch (err) {
//     return next(err);
//   }
// })

router.get("/")

module.exports = router;
