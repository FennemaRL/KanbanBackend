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

module.exports = {
  encrypt,
  compare,
  genToken,
  verify
};
