const mongoose = require("mongoose");
const auth = require("../auth");
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  boards: []
});

userSchema.pre("save", function(next) {
  let user = this;
  if (!user.isModified("password")) return next();
  try {
    user.password = auth.encrypt(user.password);
    next();
  } catch (err) {
    next(err);
  }
});
module.exports = mongoose.model("User", userSchema);
