const express = require("express");
const router = new express.Router();
const { ExpressError } = require("../expressError");
const db = require("../db")
const bcrypt = require("bcrypt");
const {BCRYPT_WORK_FACTOR, SECRET_KEY} = require("../config");
const jwt = require("jsonwebtoken")

router.get('/', (req, res, next) => {
    res.send("APP IS WORKING!!!")
})

router.post('/register', async (req, res, next) => {
    try {
        const {username, password} = req.body;
        if(!username || !password) {
            throw new ExpressError("Username and password requried", 400)
        }
        // hash password
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
        //save to db
        const results = await db.query(`
            INSERT INTO users (username, password)
            VALUES ($1, $2)
            RETURNING username`,
            [username, hashedPassword]);
            console.log('hello')
        return res.json(results.rows[0]);
    } catch (e) {
        // if(e.code === '23505') {
        //     throw(new ExpressError("Username taken. Please pick another!", 400));
        // }
        return next(e)
    
    }
})

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new ExpressError("Username and password required", 400);
        }
        const results = await db.query(
            `SELECT id, username, password
                FROM users
                WHERE username = $1`,
            [username]
        );
        const user = results.rows[0];
        if (user) {
            if (await bcrypt.compare(password, user.password)) {
                const token = jwt.sign({ userId: user.id, username }, SECRET_KEY);
                console.log('Here is the user id', user.id)
                return res.json({ message: `Logged in!`, token});
            } else {
                throw new ExpressError("Invalid password", 400); 
            }
        } else {
            throw new ExpressError("Username not found", 400); 
        }
    } catch (e) {
        return next(e); 
    }
});

module.exports = router;

