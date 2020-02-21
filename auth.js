const Bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
let secret = process.env.SECRET;

const encrypt = password => Bcrypt.hashSync(password, 10);

const compare = (password, encryptpassword) =>
  Bcrypt.compareSync(password, encryptpassword);

const genToken = user => {
  return {
    token: jwt.sign({ data: user.userName }, secret, {
      expiresIn: "0.5h"
    })
  };
};
const verify = token => jwt.verify(token, secret);

const isAuth = (req, res, next) => {
  let token = req.headers.token;
  if (!token) throw "no token";
  try {
    verify(token);
    next();
  } catch (err) {
    res.status(401).json({ message: "not authorized" + err });
  }
};

module.exports = {
  encrypt,
  compare,
  genToken,
  verify,
  isAuth
};
