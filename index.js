const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose=require('mongoose')
mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//Mongoose Code
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username:String
})

const exerciseSchema = new Schema({
  username:String,
  description:String,
  duration:Number,
  date:Date,
})

const user = mongoose.model("UserModel", userSchema);
const exercise = mongoose.model("exerciseModel", exerciseSchema);

//Express
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//create new user
app.post('/api/users', function(req,res,next){
    req.username = req.body['username'];
    next();
},(req,res,next)=>{
    const userVar = new user({
      username: req.username
    })
    userVar.save(function(err,data){
        if(err) return console.error(err);    
  res.json({"username":data["username"],"_id":data["_id"]})
    })
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
