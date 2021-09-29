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
  .catch((er) => {
    console.log("Mongoose Connection error => ", er);
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
// for body parsing

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
      var temp = [];
      data.forEach((value) => {
        temp.push({ username: value.username, _id: value._id, __v: value.__v });
      });
      res.json(temp);
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

app.post("/api/users/:_id/exercises", async (req, res) => {
  const id = req.params._id;
  let description;
  let duration;
  let date;

  const isUserQuery = await Users.findById(id)
    .exec()
    .catch((err) => {
      // ? User
      console.log("Catch err encounter :", err.message);
      res.status(400).end("Unknown userId");
    });
  // ? Description
  if (req.body.description === "") {
    return res.end("Path `description` is required.");
  } else if (req.body.description.length >= 20) {
    return res.end("description too long");
  } else {
    description = req.body.description;
  }
  // ? Duration
  if (req.body.duration === "") {
    return res.status(400).end("Path `duration` is required.");
  } else if (isNaN(parseInt(req.body.duration))) {
    return res
      .status(400)
      .end(
        'Cast to Number failed for value "' +
          req.body.duration +
          '" at path "duration"'
      );
  } else if (duration < 1) {
    return res.status(400).end("duration is short");
  } else {
    duration = parseInt(req.body.duration);
  }
  // ? DATE
  if (req.body.date === "") {
    date = new Date(Date.now());
  } else if (new Date(req.body.date) == "Invalid Date") {
    return res
      .status(400)
      .end(
        'Cast to date failed for value "' + req.body.date + '" at path "date"'
      );
  } else {
    date = new Date(req.body.date);
  }
  //valid isUser then process
  if (isUserQuery) {
    Exercises.create(
      { userId: isUserQuery._id, description, duration, date },
      (err, data) => {
        if (err) {
          return console.log(err.message);
        }
        if (data) {
          res.json({
            _id: isUserQuery._id,
            username: isUserQuery.username,
            description,
            duration,
            date: date.toDateString(),
          });
        }
      }
    );
  }
});

app.get("/api/users/:_id/logs?", async (req, res) => {
  const id = req.params._id;
  let { from, to, limit } = req.query;
  const findQuery = {};
  const isUserQuery = await Users.findById(id)
    .exec()
    .catch((err) => {
      console.log("Catch err encounter :", err.message);
      return res.status(400).end("Unknown userId");
    });
  if (new Date(from) != "Invalid Date") {
    from = new Date(from);
    findQuery.date = { $gt: from };
  }
  if (new Date(to) != "Invalid Date") {
    to = new Date(from);
    // to.setDate(to.getDate() + 1);
    findQuery.date = { $lte: to };
  }
  if (isNaN(limit)) {
    limit = 0;
  } else {
    limit = Number(limit);
  }
  console.log("find Query content = ", findQuery);
  if (isUserQuery) {
    findQuery.userId = isUserQuery._id;
    Exercises.find(findQuery)
      .select("userId description duration date")
      .sort({ date: -1 })
      .limit(limit)
      .exec((err, data) => {
        if (err) {
          console.log(err.message);
          return res.end("Error");
        }
        if (data) {
          // console.log("Exercises : ", data);
          res.status(200).json({
            _id: isUserQuery._id,
            username: isUserQuery.username,
            count: data.length,
            log: data,
          });
        }
      });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

/**
 * You can make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.
A request to a user's log GET /api/users/:_id/logs returns a user object with a count property representing the number of exercises that belong to that user.
A GET request to /api/users/:id/logs will return the user object with a log array of all the exercises added.
Each item in the log array that is returned from GET /api/users/:id/logs is an object that should have a description, duration, and date properties.
The description property of any object in the log array that is returned from GET /api/users/:id/logs should be a string.
The duration property of any object in the log array that is returned from GET /api/users/:id/logs should be a number.
The date property of any object in the log array that is returned from GET /api/users/:id/logs should be a string.. Use the dateString format of the Date API.
You can add from, to and limit parameters to a GET /api/users/:_id/logs request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.
 */
