const express = require("express");
const router = express.Router();
const auth = require("../auth");

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

router.get("/:TableName", isAuth, (req, res) => {
  let token = req.headers.token;
  res.status(200).json(auth.verify(token));
});

module.exports = router;
