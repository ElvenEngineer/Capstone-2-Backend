const {BCRYPT_WORK_FACTOR, SECRET_KEY} = require("../config");
const jwt = require("jsonwebtoken")
const { ExpressError } = require("../expressError");


function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
      console.log('YOU HAVE A VALID TOKEN')
    }
    return next();
  } catch (err) {
    console.error('FAILER TO VERIFY TOKEN', e)
    return next();
  }
}

function ensureLoggedIn(req, res, next){
    if(!req.user){
        const e = new ExpressError("Unathorized", 401);
        return next(e);
    }else {
        console.log('Logged in verified')
        return next();
    }
}

function createToken(user) {
  let payload = { 
    username: user.username,
    id: user.id
  };
  console.log('we are hitting the createToken')
  return jwt.sign(payload, SECRET_KEY);
}


module.exports = { authenticateJWT, ensureLoggedIn, createToken };