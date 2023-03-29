const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//Mongoose Code
mongoose.set('useFindAndModify', false);

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String
})

const exerciseSchema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
})

const logsSchema = new Schema({
  username: String,
  count: Number,
  log: [{}]
})

const user = mongoose.model("UserModel", userSchema);
const exercise = mongoose.model("exerciseModel", exerciseSchema);
const log = mongoose.model("logModel", logsSchema);

//Express
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
//Get all Users
app.get('/api/users', function(req, res, next) {
  user.find(function(err, users) {
    if (err) return console.log(err);
    res.send(users);
  })
});

//create new user
app.post('/api/users', function(req, res, next) {
  req.username = req.body['username'];
  next();
}, (req, res, next) => {
  const userVar = new user({
    username: req.username
  })

  userVar.save(function(err, data) {
    if (err) return console.error(err);
    const logVar = new log({
      username: req.username,
      _id: data["_id"],
      count: 0,
    });
    logVar.save(function(err, data) {
      if (err) return console.error(err);
    });
    res.json({ "username": data["username"], "_id": data["_id"] })
  })
})

//Create new exercise
app.post("/api/users/:id/exercises", function(req, res, next) {

  console.log("body" + req.body["date"]);
  
  req.description = req.body['description'];
  req.duration = req.body['duration'];
  req.date = new Date(req.body['date']);
  req.test = req.params["id"];
  if (req.body["date"] === undefined) {
    console.log("date is " + undefined)
    req.date = new Date();
  }
  console.log("datum is " + req.date);
  next();
}, async function(req, res, next) {
   await user.findById(req.test, function(err, data) {
    if (err) return console.log(err);
    req.person = data;
  });
  next();
}, function(req, res, next){

  let countToSet;
  log.findById(req.test, function(err, data) {
    if (err) return console.log(err);
    countToSet = data["count"] + 1;
  })

  log.findByIdAndUpdate(req.test, {
    "$set": { count: countToSet },
    "$push": {
      "log": {
        description: req.description,
        duration: parseInt(req.duration),
        date: req.date.toDateString()
      }
    }
  }, { "new": true, "upsert": true }, function(err, data) {
    if (err) return console.log(err);
  })

  console.log(req.person);

  const exerciseVar = new exercise({
    username: req.person["username"],
    description: req.description,
    duration: parseInt(req.duration),
    date: req.date.toDateString(),
    _id: req.test
  })
  exerciseVar.save(function(err, data) {
    if (err) return console.error(err);
    res.json({
      "username": req.person["username"],
      "description": req.description,
      "duration": parseInt(req.duration),
      "date": req.date.toDateString(),
      "_id": req.test
    })
  }
  )
})

app.get()

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})