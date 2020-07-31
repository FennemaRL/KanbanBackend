const express = require("express");
const app = express();
var cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./routes/user");
const boardRoute = require("./routes/board");
const bmRoute = require("./routes/cbm");
const mailRoute = require("./routes/sendMail");

if (process.env.enviroment !== "production") require("dotenv").config();

app.use(express.json());
app.use(cors());
app.use("/user", userRoute);
app.use("/board", boardRoute);
app.use("/cbm", bmRoute);
app.use("/sendmail", mailRoute);
if (process.env.environment !== "test") {
  const uri = process.env.URIMONGO;
  try {
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.log(err.message);
  }
  let port = process.env.PORT || 3003;
  app.listen(port, () => console.log("server started "));
}

module.exports = app;
