const Bcrypt = require("bcrypt");
require("dotenv").config();

function encrypt(password) {
  return Bcrypt.hashSync(password, 10);
}

const compare = (password, encryptpassword) => {
  console.log("--------------estoy aka pa ");
  console.log({ p: password, ph: encryptpassword });
  return Bcrypt.compareSync(password, encryptpassword);
};

module.exports = {
  encrypt,
  compare
};
