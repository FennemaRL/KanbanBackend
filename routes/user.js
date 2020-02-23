const express = require("express");
const router = express.Router();
const User = require("../persistence/user");
const auth = require("../auth");

{
  /*register*/
}
router.post("/register", async (req, res) => {
  let user = new User({
    userName: req.body.userName,
    password: req.body.password
  });
  try {
    let newUser = await user.save();
    res.status(201).json({ userName: newUser.userName });
  } catch (err) {
    res.status(400);
    if (err.name === "MongoError" && err.code === 11000)
      res.json({ message: "Username already exists" });
    else res.json({ message: "Username or password empty" });
  }
});

{
  /*login*/
}
router.post("/login", async (req, res) => {
  let userTofind = req.body.userName;
  let pass = req.body.password;
  try {
    let user = await User.findByName(userTofind);
    if (!user || !auth.compare(pass, user.password)) throw " ";
    res.status(200).json({ token: auth.genToken(user) });
  } catch (err) {
    res.status(400).json({ message: "User or password incorrect " + err });
  }
});
{
  /*reorder*/
}
router.patch("/newOrder", auth.isAuth, async (req, res) => {
  let userName = auth.verify(req.headers.token).data;
  try {
    let boardReOrder = req.body.boardsOrder;
    let userToUpdate = await User.findByName(userName);
    userToUpdate.boards = boardReOrder;
    await userToUpdate.save();
    res.status(200).json({ message: "complete" });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

module.exports = router;
