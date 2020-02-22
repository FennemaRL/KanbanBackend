const express = require("express");
const router = express.Router();
const auth = require("../auth");
const Board = require("../persistence/board");
const User = require("../persistence/user");

{
  /*get board */
}
router.get("/:boardName", auth.isAuth, async (req, res) => {
  let boardFind = await _findBoard(req);

  res.status(200).json({ board: boardFind });
});
{
  /*create board */
}
router.post("/", auth.isAuth, async (req, res) => {
  try {
    let user2Update = await User.findByName(req);
    if (!user2Update.boards) user2Update.boards = [];
    user2Update.boards.push(boardTitle);
    await user2Update.save();
    let boardToCreate = new Board({
      title: boardTitle + "." + userName
    });
    await boardToCreate.save();
    res.status(201).json({ title: boardToCreate.title });
  } catch (e) {
    res.status(500).json({ message: e });
  }
});
{
  /*create table */
}
router.post("/newTable", auth.isAuth, async (req, res) => {
  let newTableTitle = req.body.tableTitle;
  try {
    let board2Update = await _findBoard(req);
    if (!board2Update.tables) board2Update.tables = [];
    board2Update.tables.push({ titleTable: newTableTitle, content: [] });
    await board2Update.save();
    res.status(201).json({ table: { newTableTitle } });
  } catch (err) {
    res.status(400).json({ message: "error + " + err });
  }
});

{
  /*create task */
}

router.post("/newTask", auth.isAuth, async (req, res) => {
  let task = req.body.task;
  let tableTitle = req.body.tableTitle;
  try {
    let board2Update = await _findBoard(req);
    let indextable = board2Update.tables.findIndex(
      t => t.titleTable === tableTitle
    );
    let table = board2Update.tables[indextable];

    if (!table.content) table.content = [];

    table.content.push(task);
    board2Update.tables.splice(indextable, 1, table);
    await board2Update.save();
    res.status(201).json(table);
  } catch (err) {
    res.status(400).json("error + " + err);
  }
});

const _findBoard = req => {
  let boardTitle = req.body.boardTitle;
  let userName = auth.verify(req.headers.token).data;
  return Board.findByTitle(boardTitle + "." + userName);
};
module.exports = router;
