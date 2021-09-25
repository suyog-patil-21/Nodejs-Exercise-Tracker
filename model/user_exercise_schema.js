const mongoose = require("mongoose");
const exerciseSchema = mongoose.Schema({
  description: { type: String, require: true },
  duration: { type: Number, require: true },
  date: { type: Date, default: Date.now },
});

const usersSchema = mongoose.Schema({
  username: { type: String, require: true },
  count: { type: Number, default: 0 },
  log: [exerciseSchema],
});
const Users = new mongoose.model("User", usersSchema);

module.exports = Users;