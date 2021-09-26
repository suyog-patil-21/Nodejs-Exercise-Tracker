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
      if (err) return console.log(err);
      var temp = [];
      data.forEach((value, index, array) => {
        temp.push({ username: value.username, _id: value._id, __v: value.__v });
      });
      res.json(temp);
    });
  })
  .post((req, res) => {
    let username = req.body.username;
    // if (username !== "") {
    Users.create({ username: username }, (err, user) => {
      if (err) return console.log(err.message);
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
app.post("/api/users/:_id/exercises", async (req, res) => {
  const id = req.params._id;
  const description = req.body.description;
  const duration = Number(req.body.duration);
  const dateString = req.body.date;
  let date = dateString === "" ? new Date(Date.now()) : new Date(dateString);
  // console.log(id, description, duration, date);

  Users.findById(id, async (err, user) => {
    // ? User Validation : present or not
    if (err) {
      return res.end(err.message);
      // res.end();
      // return;
    }
    console.log("at Start  :", user);
    // ? Descripton Validation
    // if (description === "") {
    //   res.end("Descriptiton is empty");
    // } else if (description.length > 20) {
    //   res.end("length is greater than 20 ");
    // }

    // ? Duration Validation
    // if (isNaN(duration)) {
    //   res.end("duration is not a number");
    // } else if (duration <= 0) {
    //   res.end("duration less than 0 ");
    // }
    // ? Creating User Exercise
    // FIXME : Count is not correct
    // FIXME : default date by mongodb
    if (user !== undefined) {
      Users.findByIdAndUpdate(
        user._id,
        {
          count: 1 + user.log.length,
          $push: {
            log: {
              duration,
              description,
              date: date.toDateString(),
            },
          },
        },
        (err) => {
          if (err) {
            res.end(err.message);
            return;
          } else {
            res.json({
              username: user.username,
              _id: user._id,
              duration,
              description,
              date: date.toDateString(),
            });
          }
          // IF complete success

          // console.log("user afterward :", newDoc);
          // res.json({ username: doc.username });
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
