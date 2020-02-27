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
  mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("conected 2 db"))
    .catch(e => console.log(e));
  let port = process.env.PORT || 3000;
  app.listen(port, () => console.log("server started"));
}

module.exports = app;
