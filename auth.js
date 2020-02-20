const Bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const encrypt = password => Bcrypt.hashSync(password, 10);

const compare = (password, encryptpassword) =>
  Bcrypt.compareSync(password, encryptpassword);

let secret = process.env.SECRET;
const genToken = user => {
  return {
    token: jwt.sign({ data: user.UserName }, `${secret}`, { expiresIn: "2h" })
  };
};

module.exports = {
  encrypt,
  compare,
  genToken
};
