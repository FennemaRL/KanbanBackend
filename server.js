const express = require("express");
const app = express();
var cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require("./routes/user");
const boardRouter = require("./routes/board");
const bmrouter = require("./routes/cbm");
if (process.env.enviroment !== "production") require("dotenv").config();

app.use(express.json());
app.use(cors());
app.use("/user", userRouter);
app.use("/board", boardRouter);
app.use("/cbm", bmrouter);
if (process.env.environment !== "test") {
  const uri = process.env.URIMONGO;
  try {
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (err) {
    console.log(err.message);
  }
  let port = process.env.PORT || 3003;
  app.listen(port, () => console.log("server started"));
}

module.exports = app;
