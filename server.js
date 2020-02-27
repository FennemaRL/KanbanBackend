const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRouter = require("./routes/user");
const boardRouter = require("./routes/board");
const bmrouter = require("./routes/cbm");
if (process.env.enviroment !== "production") require("dotenv").config();

app.use(express.json());

app.use("/user", userRouter);
app.use("/board", boardRouter);
app.use("/cbm", bmrouter);
if (process.env.environment !== "test") {
  const uri = process.env.URIMONGO;
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection;

  db.on("error connection", error => console.error(error));
  db.once("open", () => console.log("conected 2 db"));
  let port = process.env.PORT || 3000;
  app.listen(port, () => console.log("server started"));
}

module.exports = app;
