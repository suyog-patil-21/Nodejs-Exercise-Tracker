const mongoose = require("mongoose");

const usersSchema = mongoose.Schema({
  username: { type: String, required: true },
  log: [
    {
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
    },
  ],
});
const Users = new mongoose.model("User", usersSchema);

exports.Users = Users;
