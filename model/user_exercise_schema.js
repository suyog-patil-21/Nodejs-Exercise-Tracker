const mongoose = require("mongoose");
const exerciseSchema = mongoose.Schema({
  description: {
    type: String,
    required: [true, "Path `description` is required."],
    maxLength: [20, "description too long"],
  },
  duration: {
    type: Number,
    required: [true, "Path `duration` is required."],
    min: [0, "duration too short"],
  },
  date: { type: Date, default: Date.now },
});

const usersSchema = mongoose.Schema({
  username: { type: String, required: [true, "Path `username` is required."] },
  count: { type: Number, default: 0 },
  log: [exerciseSchema],
});
const Users = new mongoose.model("User", usersSchema);

module.exports = Users;
