const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  tables: []
});
boardSchema.statics.findByTitle = function(name) {
  return this.findOne({ title: new RegExp(name, "i") });
};
module.exports = mongoose.model("Board", boardSchema);
