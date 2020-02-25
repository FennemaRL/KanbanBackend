const express = require("express");
const router = express.Router();
const auth = require("../auth");
const Board = require("../persistence/board");
const User = require("../persistence/user");

{
  /*get board */
}
router.get("/:boardTitle", auth.isAuth, async (req, res) => {
  try {
    let boardFind = await _findBoard(req);
    res
      .status(200)
      .json({ tables: boardFind.tables, title: boardFind.title.split(".")[0] });
  } catch (e) {
    res.status(400).json({ message: "Board not found" });
  }
});
{
  /*create board */
}
router.post("/", auth.isAuth, async (req, res) => {
  try {
    let boardTitle = req.body.boardTitle;
    if (!boardTitle) throw new Error("The board is empty");
    let userName = auth.getName(req.headers.token);
    let user2Update = await User.findByName(req);
    if (!user2Update.boards) user2Update.boards = [];
    user2Update.boards.push(boardTitle);
    await user2Update.save();
    let boardToCreate = new Board({
      title: boardTitle + "." + userName
    });
    await boardToCreate.save();
    res.status(201).json({ tables: [], title: boardTitle });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
{
  /*create table */
}
router.post("/newTable/", auth.isAuth, async (req, res) => {
  let newTableTitle = req.body.tableTitle;
  try {
    let board2Update = await _findBoard(req);
    if (!newTableTitle) throw new Error("The new table don't have title");
    if (!board2Update.tables) board2Update.tables = [];
    board2Update.tables.push({ titleTable: newTableTitle, content: [] });
    await board2Update.save();
    res
      .status(201)
      .json({ boardTitle: board2Update.title, tables: board2Update.tables });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

{
  /*create task */
}

router.post("/newTask/", auth.isAuth, async (req, res) => {
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
  let boardTitle = req.params.boardTitle || req.body.boardTitle;
  let userName = auth.getName(req.headers.token);
  return Board.findByTitle(boardTitle + "." + userName);
};
module.exports = router;
