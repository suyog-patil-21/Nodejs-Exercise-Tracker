const mongoose = require("mongoose");
const exerciseSchema = mongoose.Schema({
  description: {
    type: String,
    required: true,
    maxLength: 20,
  },
  duration: {
    type: Number,
    required: true,
    min: [1,"duration is short"],
  },
  date: { type: Date, default: Date.now },
});

const usersSchema = mongoose.Schema({
  username: { type: String, required: true },
  count: { type: Number, default: 0, min: 0 },
  log: [exerciseSchema],
});
const Users = new mongoose.model("User", usersSchema);

module.exports = Users;
