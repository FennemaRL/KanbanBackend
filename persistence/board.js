const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  table: []
});

module.exports = mongoose.model("Board", boardSchema);
