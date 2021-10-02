const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { Users, Exercises } = require("./model/user_exercise_schema");
require("dotenv").config();

app.use(cors());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((er) => {
    console.log("Mongoose Connection failed Error => ", er);
  });

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  console.log(
    "Logger",
    req.method,
    req.path,
    "\n   Body",
    req.body,
    "\n   Query",
    req.query
  );
  next();
});

app
  .route("/api/users")
  .get((req, res) => {
    // after user got created
    Users.find({}, (err, data) => {
      if (err) {
        const message = err.message;
        console.log(err.message);
        return res.end(message.substring(message.lastIndexOf(":") + 1));
      }
      var allusers = [];
      data.forEach((value) => {
        allusers.push({
          username: value.username,
          _id: value._id,
          __v: value.__v,
        });
      });
      res.json(allusers);
    });
  })
  .post((req, res) => {
    let username = req.body.username;
    Users.create({ username: username }, (err, user) => {
      if (err) {
        const message = err.message;
        console.log(err.message);
        return res.end(message.substring(message.lastIndexOf(":") + 1));
      }
      res.status(200).json({ username: user.username, _id: user._id });
    });
  });

// Create user Exercises
app.post("/api/users/:_id/exercises", (req, res) => {
  const id = req.params._id;
  const { description, duration } = req.body;
  let date;
  if (req.body.date) {
    date = new Date(req.body.date).toDateString();
    if (date == "Invalid Date") {
      return res.end("Invalid Date Format");
    }
  } else {
    date = new Date().toDateString();
  }

  Users.findById(id, (err, user) => {
    if (err) {
      console.log(err.message);
      return res.end(err.message);
    }
    user.log.push({ description, duration, date });
    user.save((err, data) => {
      if (err) {
        return res.end(err.message);
      }
      console.log("Exercise got created : ", data);
      const latestExercise = data.log[data.log.length - 1];
      res.json({
        _id: data._id,
        username: data.username,
        description: latestExercise.description,
        duration: Number(latestExercise.duration),
        date: new Date(latestExercise.date).toDateString(),
      });
    });
  });
});

// Finding All User Exercise Log
app.get("/api/users/:_id/logs", (req, res) => {
  const id = req.params._id;
  let { from, to, limit } = req.query;

  Users.findById(id, (err, user) => {
    if (err) {
      console.log(err.message);
      return res.end(err.message);
    }
    let userlog = user.log.map((item) => {
      return {
        description: item.description,
        duration: item.duration,
        date: new Date(item.date).toDateString(),
      };
    });

    if (from && new Date(from) != "Invalid Date") {
      userlog = userlog.filter(
        (log) => new Date(log.date).getTime() >= new Date(from).getTime()
      );
    }
    if (from && new Date(to) != "Invalid Date") {
      userlog = userlog.filter(
        (log) => new Date(log.date).getTime() <= new Date(to).getTime()
      );
    }
    if (limit) {
      userlog = userlog.slice(0, limit);
    }
    res.json({
      _id: user._id,
      username: user.username,
      count: userlog.length,
      log: userlog,
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
