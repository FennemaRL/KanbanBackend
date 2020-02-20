const express = require("express");
const router = express.Router();
const User = require("../persistence/user");

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

router.post("/login", (req, res) => {
  let userTofind = req.body.userName;
  let pass = req.body.password;
  try {
    let user = User.findByName(userTofind);
    if (!user || Auth.compare(pass, user.password))
      res.status(400).json({ message: "User or password incorrect" });
    res.status(200).json({ message: "todo" });
  }
});

module.exports = router;
