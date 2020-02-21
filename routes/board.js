const express = require("express");
const router = express.Router();
const auth = require("../auth");
const Board = require("../persistence/board");
const User = require("../persistence/user");

const isAuth = (req, res, next) => {
  let token = req.headers.token;
  if (!token) throw "no token";
  try {
    auth.verify(token);
  } catch (e) {
    res.status(401).json({ message: "not authorized" });
  }
  next();
};

router.get("/:boardName", isAuth, (req, res) => {
  let title = req.params.boardName;
  let boardFind = Board.findByTitle(title);

  res.status(200).json({ board: boardFind });
});

router.post("/", isAuth, async (req, res) => {
  let boardTitle = req.body.boardName;
  let userName = auth.verify(req.headers.token);
  try {
    let user2Update = await User.findByName(userName);
    console.log({ boardpre: user2Update.boards });
    user2Update.boards.push(boardTitle);
    await user2Update.save();
    let boardToCreate = new Board({
      title: boardTitle
    });
    await boardToCreate.save();
    console.log({ boardpost: user2Update.boards });
    res.status(201).json({ title: boardToCreate.title });
  } catch (e) {
    res.status(500).json({ message: e });
  }
});
module.exports = router;
