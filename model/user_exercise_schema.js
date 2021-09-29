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
    min: 1,
  },
  date: { type: Date, default: Date.now },
  userId: { type: String, required: true },
});

const usersSchema = mongoose.Schema({
  username: { type: String, required: true },
});
const Users = new mongoose.model("User", usersSchema);
const Exercises = new mongoose.model("exercises", exerciseSchema);

exports.Users = Users;
exports.Exercises = Exercises;
