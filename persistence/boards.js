const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }
});

const tableSchema = new mongoose.Schema({
  title: { type: String, required: true },
  task: []
});

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  table: []
});

module.exports = {
  board: mongoose.model("Board", boardSchema),
  schema: boardSchema.type
};
