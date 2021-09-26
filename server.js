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
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  console.log(req.method, req.path, req.params, req.body, req.query);
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
        return res.end(message.substring(message.lastIndexOf(":") + 1));
      }
      res.status(200).json({ username: user.username, _id: user._id });
    });
  });

app.post("/api/users/:_id/exercises", (req, res) => {
  const id = req.params._id;
  const description = req.body.description;
  const duration = Number(req.body.duration);
  let date;
  try {
    date = req.body.date === "" ? new Date() : new Date(req.body.date);
  } catch (err) {
    console.log("Date formate error  Watch this  :", err.message);
  }

  Users.findById(id, async (err, user) => {
    if (err) {
      return res.end(err.message);
    }
    if (user !== undefined && user._id !== null) {
      Users.findOneAndUpdate(
        { _id: user._id },
        {
          $push: {
            log: {
              duration,
              description,
              date: date,
            },
          },
        },
        { runValidators: true },
        (err) => {
          if (err) {
            return res.end(err.message);
          } else {
            res.json({
              _id: user._id,
              username: user.username,
              date: date.toDateString(),
              duration,
              description,
            });
          }
        }
      );
    }
  });
});

app.get("/api/users/:_id/logs?", (req, res) => {
  const id = req.params._id;
  Users.findById(id, (err, userdoc) => {
    if (err) {
      return res.end(err.message);
    } else {
      let log = userdoc.log.map((value) => {
        return {
          description: value.description,
          duration: value.duration,
          date: Date(value.date).toDateString(),
        };
      });

      res.json({
        username: userdoc.username,
        count: log.length,
        _id: userdoc._id,
        log: log,
      });
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

//free :user1 : 615068f681a96b054b04cdb2
//my : user1 :  615079fa22e5ee8b9ce6ea85
