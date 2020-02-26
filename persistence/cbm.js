const mongoose = require("mongoose");

const concertSchema = new mongoose.Schema({
  place: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});
concertSchema.statics.findLatestConcerts = function() {
  return this.find({
    date: { $gte: new Date() }
  }).limit(6);
};
module.exports = mongoose.model("concert", concertSchema);
