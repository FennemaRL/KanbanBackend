const express = require("express");
const router = express.Router();
const User = require("../persistence/user");
const auth = require("../auth");
router.post("/register", async (req, res) => {
  let user = new User({
    userName: req.body.userName,
    password: req.body.password
  });
  try {
    let newUser = await user.save();
    res.status(201).json({ userName: newUser.userName });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  let userTofind = req.body.userName;
  let pass = req.body.password;
  try {
    let user = await User.findByName(userTofind);
    if (!user || !auth.compare(pass, user.password)) throw " ";
    res.status(200).json(auth.genToken(user));
  } catch (e) {
    res.status(400).json({ message: "User or password incorrect " + e });
  }
});

module.exports = router;
