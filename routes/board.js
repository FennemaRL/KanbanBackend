const express = require("express");
const router = express.Router();
const auth = require("../auth");
const Board = require("../persistence/board");
const User = require("../persistence/user");

/*get board */

router.get("/:boardTitle", auth.isAuth, async (req, res) => {
  try {
    let boardFind = await _findBoard(req);
    res
      .status(200)
      .json({ tables: boardFind.tables, title: _boardTitle(boardFind) });
  } catch (e) {
    res.status(400).json({ message: "Board not found" });
  }
});

/*create board */

router.post("/", auth.isAuth, async (req, res) => {
  try {
    let boardTitle = req.body.boardTitle;
    _fieldCheck([[boardTitle, "boardTitle"]]);
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

/*create table */

router.post("/table", auth.isAuth, async (req, res) => {
  let newTableTitle = req.body.tableTitle;
  try {
    _fieldCheck([[newTableTitle, "tableTitle"]]);
    let board2Update = await _findBoard(req);
    if (!board2Update) throw new Error("couldn't find the board board1");
    board2Update.tables.push({ titleTable: newTableTitle, content: [] });
    await board2Update.save();
    res.status(201).json({
      boardTitle: _boardTitle(board2Update),
      tables: board2Update.tables
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/*create task */

router.post("/table/task", auth.isAuth, async (req, res) => {
  try {
    let task = req.body.task;
    let tableTitle = req.body.tableTitle;
    if (
      !tableTitle ||
      (Object.entries(task).length === 0 && task.constructor === Object)
    )
      throw new Error("The tableTitle or the task are empty");
    let board2Update = await _findBoard(req);
    let indextable = board2Update.tables.findIndex(
      t => t.titleTable === tableTitle
    );
    if (indextable === -1)
      throw new Error(
        "The table dont belong to the board : " + _boardTitle(board2Update)
      );

    board2Update.tables[indextable].content.push(task);
    board2Update.markModified("tables");
    await board2Update.save();
    res.status(201).json({
      boardTitle: _boardTitle(board2Update),
      tables: board2Update.tables
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
const _boardTitle = board => {
  return board.title.split(".")[0];
};
const _findBoard = req => {
  let boardTitle = req.params.boardTitle || req.body.boardTitle;
  _fieldCheck([[boardTitle, "boardTitle"]]);
  let userName = auth.getName(req.headers.token);
  return Board.findByTitle(boardTitle + "." + userName);
};

/*delete table*/
router.delete("/table", auth.isAuth, async (req, res) => {
  try {
    let userNamed = auth.getName(req.headers.token);
    let titleBoard = req.body.boardTitle;
    let tableTitle = req.body.tableTitle;

    let query = {
      title: titleBoard + "." + userNamed
    };
    let remove = { $pull: { tables: { titleTable: tableTitle } } };
    await Board.updateOne(query, remove);
    res.status(204).json({ message: "empty" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
/*delete board */
router.delete("/", auth.isAuth, async (req, res) => {
  try {
    let userNamed = auth.getName(req.headers.token);
    let titleb = req.body.boardTitle;
    _fieldCheck([[titleb, "boardTitle"]]);
    await Board.deleteOne({ title: titleb + "." + userNamed });
    let query = {
      userName: userNamed
    };
    let remove = { $pull: { boards: titleb } };
    await User.updateOne(query, remove);
    res.status(204).json({ message: "empty" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
/*delete task*/
router.delete("/table/task", auth.isAuth, async (req, res) => {
  /*seguir aka */
  try {
    let titleTable = req.body.tableTitle;
    let tasktitle = req.body.taskTitle;
    _fieldCheck([
      [titleTable, "tableTitle"],
      [tasktitle, "taskTitle"]
    ]);

    let board2update = await _findBoard(req);
    let table = board2update.tables.find(
      table => table.titleTable === titleTable
    );
    table.content = table.content.filter(task => !task.titleTask === tasktitle);
    board2update.markModified("tables");
    board2update.save();
    /* investigar
    let query = {
      title: titleBoard + "." + userNamed,
      tables: titleTables
    };
    let remove = {
      $pull: { tables: { content: { $elemMatch: { titleTask: tasktitle } } } }
    };
    await Board.updateOne(query, remove);*/
    let board;
    res.status(204).json({ message: "empty" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});
const _fieldCheck = list => {
  /*first value second field name */
  let emptyF = list.filter(f => !f[0]).map(f => f[1]);
  if (emptyF.length === 1) throw new Error(`The field ${emptyF} is empty`);
  if (emptyF.length > 1) throw new Error(`The fields ${emptyF} are empty`);
};
module.exports = router;
