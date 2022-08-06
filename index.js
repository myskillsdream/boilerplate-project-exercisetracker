require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

const mongoose = require("mongoose");
const bodyParser = require("body-parser")


mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const { Schema } = mongoose;

const ExerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
});
const UserSchema = new Schema({
  username: String,
});
const User = mongoose.model("User", UserSchema);
const Exercise = mongoose.model("Exercise", ExerciseSchema);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// app.post("/api/users", (req, res) => {  
//   const newUser = new User({
//     username: req.body.username
//   })
//   newUser.save((err, data) => {
//     if(err || !data){
//       res.send("There was an error saving the user")
//     }else{
//       res.json(data)
//     }
//   })
// })

app.post("/api/users", (req, res) => {
  User.findOne({ username: req.body.username }, (err, foundUser) => {
    if (err) return;
    if (foundUser) {
      res.send("Username Taken");
    } else {
      const newUser = new User({
        username: req.body.username
      });
      newUser.save();
      res.json({
        username: req.body.username,
        _id: newUser.id
      });
    }
  });
});

app.get("/api/users", (req, res) => {
  User.find({}, (err, data) => {
    if(!data){
      res.send("No users")
    }else{
      res.json(data)
    }
  })
})

app.post("/api/users/:id/exercises", (req, res) => {
  const id = req.params.id
  const {description, duration, date} = req.body
  User.findById(id, (err, userData) => {
    if(err || !userData) {
      res.send("Could not find user");
    }else{
      const newExercise = new Exercise({
        userId: id, 
        description,
        duration,
        date: new Date(date).toDateString(), 
      })
      newExercise.save((err, data) => {
        if(err || !data) {
          res.send("There was an error saving this exercise")
        }else {
          const { description, duration, date } = data;
          res.json({
            username: userData.username,
            description,
            duration,
            date: date.toDateString(),
            _id: userData.id
          })
        }
      })
    }
  })
})

app.get("/api/users/:id/logs", (req, res) => {
  const { from, to, limit } = req.query;
  const {id} = req.params;
  User.findById(id, (err, userData) => {
    if(err || !userData) {
      res.send("Could not find user");
    }else{
      let dateObj = {}
      if(from){
        dateObj["$gte"] = new Date(from)
      }
      if(to){
        dateObj["$lte"] = new Date(to)
      }
      let filter = {
        userId: id
      }
      if(from || to ){
        filter.date = dateObj
      }
      // let nonNullLimit = limit ? limit : 500;
      let limitPage = (limit !== '' ? parseInt(limit) : 500);

      Exercise.find(filter).limit(limitPage).exec((err, data) => {
        if(err || !data){
          res.json([])
        }else{

          let count = data.length

          const rawLog = data
          const {username, _id} = userData;
          const log = rawLog.map((l) => ({
            description: l.description,
            duration: l.duration,
            date: l.date.toDateString()
          }))
          res.json({username, count, _id, log})

          console.log(count)
        }
      })
    } 
  })
})


// app.get('/api/users/:id/logs', async function(req, res) {
// const { id } = req.params;
// let { from, to, limit } = req.query;

// console.log('/api/users/:id/logs', id, from, to, limit)

// try {
// let findConditions = { uid: id };

// if ((from !== undefined && from !== '') || (to !== undefined && to !== '')) {
//   findConditions.date = {};

//   if (from !== undefined && from !== '') {
//     findConditions.date.$gte = new Date(Date.parse(from));
//   }

//   if (to !== undefined && to !== '') {
//     findConditions.date.$lte = new Date(Date.parse(to));
//   }
// }


// let limitPage = (limit !== '' ? parseInt(limit) : 0);

// const data = await Exercise
//   .find(findConditions)
//   .limit(limitPage)
//   .exec();

// const response = {
//   username: data[0].username,
//   count: data.length,
//   id: data[0].userId,
//   log: data.map((item) => ({
//     description: item.description,
//     duration: item.duration,
//     date: item.date.toDateString()
//   }))
  
// }

// console.log('/api/users/:id/logs', response)

// return res.status(200).json(response)
// } catch (err) {
// res.status(500).json({
// message: err
// });
// }

// });


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
