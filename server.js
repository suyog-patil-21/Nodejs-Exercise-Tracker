const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const Users = require("./model/user_exercise_schema");
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

// for body parsing
app.use(express.urlencoded({ extended: false }));

app
  .route("/api/users")
  .get((req, res) => {
    // after user got created
    Users.find({}, (err, data) => {
      if (err) {
        const message = err.message;
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
    // if (username !== "") {
    Users.create({ username: username }, (err, user) => {
      if (err) {
        const message = err.message;
        return res.end(message.substring(message.lastIndexOf(":") + 1));
      }
      res.status(200).json({ username: user.username, _id: user._id });
    });
    // } else {
    // res.status(400).end("Path `username` is required.");
    // }
  });
// invalid id or not present in database // * res.end("Cast to ObjectId failed for value "234" at path "_id" for model "Users"");
// description max length 20
//  duration less than 0 // * res.end("duration too short");
// date no manidatory
// date must be valid or  // * res.end('Cast to date failed for value "2021-14-21" at path "date"');
app.post("/api/users/:_id/exercises", (req, res) => {
  const id = req.params._id;
  const description = req.body.description;
  const duration = Number(req.body.duration);
  const dateString = req.body.date;
  let date = dateString === "" ? new Date(Date.now()) : new Date(dateString);
  // console.log(id, description, duration, date);

  Users.findById(id, async (err, user) => {
    if (err) {
      return res.end(err.message);
    }
    console.log("at Start  :", user);

    // FIXME : default date by mongodb
    if (user !== undefined && user._id !== null) {
      Users.findOneAndUpdate(
        user._id,
        {
          count: 1 + user.log.length,
          $push: {
            log: {
              duration,
              description,
              date: date.toISOString(),
            },
          },
        },
        { runValidators: true },
        (err) => {
          if (err) {
            return res.end(message);
          } else {
            res.json({
              username: user.username,
              _id: user._id,
              duration,
              description,
              date: date.toDateString(),
            });
          }
        }
      );
    }
  });
});

app.get("/api/:_id/logs", (req, res) => {
  // {"_id":"6121b53bf5860e05a3652fee",
  // "username":"megan",
  // "count":1,
  // "log":[
  // {
  // "description":"1231",
  // "duration":123,
  // "date":"Mon Nov 26 1973"
  // }
  // ]}
  const id = req.params._id;
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
