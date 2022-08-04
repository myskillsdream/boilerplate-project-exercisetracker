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
const ExerciseActivity = mongoose.model("Exercise", ExerciseSchema);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post("/api/users", (req, res) => {  
  const newUser = new User({
    username: req.body.username
  })
  newUser.save((err, data) => {
    if(err || !data){
      res.send("There was an error saving the user")
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
        date: new Date(date), 
      })
      newExercise.save((err, data) => {
        if(err || !data) {
          res.send("There was an error saving this exercise")
        }else {
          const { description, duration, date, _id} = data;
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

// app.get("/api/users/:id/logs", (req, res) => {
//   const { from, to, limit } = req.query;
//   const {id} = req.params;
//   User.findById(id, (err, userData) => {
//     if(err || !userData) {
//       res.send("Could not find user");
//     }else{
//       let dateObj = {}
//       if(from){
//         dateObj["$gte"] = new Date(from)
//       }
//       if(to){
//         dateObj["$lte"] = new Date(to)
//       }
//       let filter = {
//         userId: id
//       }
//       if(from || to ){
//         filter.date = dateObj
//       }
//       let nonNullLimit = limit ? limit : 500;
//       Exercise.find(filter).limit(+nonNullLimit).exec((err, data) => {
//         if(err || !data){
//           res.json([])
//         }else{

//             console.log(data)

//           let count = data.length
//           const rawLog = data
//           const {username, _id} = userData;
//           const log = rawLog.map((l) => ({
//             description: l.description,
//             duration: l.duration,
//             date: l.date.toDateString()
//           }))
//           res.json({username, count, _id, log})
//         }
//       })
//     } 
//   })
// })

app.get("/api/users/:id/logs", (req, res) => {
  // get user id from params and check that it won't break the DB query
  const { _id } = req.params;
  if (_id.length !== 24) {
    return res.json({ error: "User ID needs to be 24 hex characters" });
  }

  // find the user
  getUserByIdAnd(_id, (userObject) => {
    if (userObject === null) res.json({ error: "User not found" });
    else {
      const limit = req.query.limit ? req.query.limit : 0;

      // /!\ NOTE `limit` is being applied here BEFORE `from` and `to`
      let promise = ExerciseActivity.find({ user_id: _id }).limit(limit).exec();
      assert.ok(promise instanceof Promise);
      promise.then((exerciseObjects) => {
        // /!\ NOTE `limit` has already been applied at this point, so only
        // the truncated array of exercises will be filtered by `from` and `to`
        if (req.query.from) {
          const from = new Date(req.query.from);
          exerciseObjects = exerciseObjects.filter(
            (e) => new Date(e.date).getTime() >= from.getTime()
          );
        }
        if (req.query.to) {
          const to = new Date(req.query.to);
          exerciseObjects = exerciseObjects.filter(
            (e) => new Date(e.date).getTime() <= to.getTime()
          );
        }
        exerciseObjects = exerciseObjects.map((e) => ({
          ...e,
          date: new Date(e.date).toDateString(),
        }));

        res.json({
          _id: userObject._id,
          username: userObject.username,
          count: exerciseObjects.length,
          log: exerciseObjects,
        });
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



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
