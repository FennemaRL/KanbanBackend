const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRouter = require("./routes/user");
const boardRouter = require("./routes/board");
require("dotenv").config();

const uri = process.env.URIMONGO;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on("error connection", error => console.error(error));
db.once("open", () => console.log("conected 2 db"));

app.use(express.json());

app.use("/user", userRouter);
app.use("/board", boardRouter);
app.listen(3000, () => console.log("server started"));
