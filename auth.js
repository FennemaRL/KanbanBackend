const Bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
if (process.env.enviroment !== "production") require("dotenv").config();
let secret = process.env.SECRET;

const encrypt = password => Bcrypt.hashSync(password, 10);

const compare = (password, encryptpassword) =>
  Bcrypt.compareSync(password, encryptpassword);

const genToken = user => {
  return jwt.sign({ data: user.userName }, secret, {
    expiresIn: "0.5h"
  });
};

const verify = token => jwt.verify(token, secret);
const verifybM = token => jwt.verify(token, process.env.secretbm);
const isAuth = (req, res, next) => {
  try {
    if (!req.headers.token) throw Error("no token");
    let token = req.headers.token.split(" ")[1];
    verify(token);
    next();
  } catch (err) {
    res.status(401).json({ message: "not authorized " + err.message });
  }
};
const getName = tokenb => {
  if (!tokenb) throw Error("no token");
  let token = tokenb.split(" ")[1];
  return verify(token).data;
};
module.exports = {
  encrypt,
  compare,
  genToken,
  verify,
  isAuth,
  getName,
  verifybM
};
