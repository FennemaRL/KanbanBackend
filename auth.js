const Bcrypt = require("bcrypt");
require("dotenv").config();

function encrypt(password) {
  return Bcrypt.hashSync(password, 10);
}

const compare = (password, encryptpassword) => {
  return Bcrypt.compareSync(password, encryptpassword);
};

module.exports = {
  encrypt,
  compare
};
