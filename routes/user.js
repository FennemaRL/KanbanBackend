const express = require("express");
const router = express.Router();
const User = require("../persistence/user");

router.post("/register", async (req, res) => {
  let user = new User({
    userName: req.body.userName,
    passwordHash: req.body.passwordHash
  });
  try {
    let newUser = await user.save();
    res.status(201).json({ userName: newUser.userName });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/login", (req, res) => {
  req.param.id;
});

module.exports = router;
