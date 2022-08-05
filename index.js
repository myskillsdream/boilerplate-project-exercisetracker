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
//       Exercise.find(filter).limit(nonNullLimit).exec((err, data) => {
//         if(err || !data){
//           res.json([])
//         }else{

//           let count = data.length

//           const rawLog = data
//           const {username, _id} = userData;
//           const log = rawLog.map((l) => ({
//             description: l.description,
//             duration: l.duration,
//             date: l.date.toDateString()
//           }))
//           res.json({username, count, _id, log})

//           console.log(count)
//         }
//       })
//     } 
//   })
// })

app.get("/api/users/:_id/logs", (req, res) => {
  User.findById(req.params._id, (error, result) => {
    if (!error) {
      let resObj = result;

      if (req.query.from || req.query.to) {
        let fromDate = new Date(0);
        let toDate = new Date();

        if (req.query.from) {
          fromDate = new Date(req.query.from);
        }

        if (req.query.to) {
          toDate = new Date(req.query.to);
        }

        fromDate = fromDate.getTime();
        toDate = toDate.getTime();

        resObj.log = resObj.log.filter(session => {
          let sessionDate = new Date(session.date).getTime();

          return sessionDate >= fromDate && sessionDate <= toDate;
        });
      }

      if (req.query.limit) {
        resObj.log = resObj.log.slice(0, req.query.limit);
      }

      resObj = resObj.toJSON();
      resObj["count"] = result.log.length;
      res.json(resObj);
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


// const express = require("express");
// const app = express();
// const cors = require("cors");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const shortId = require("shortid");

// /*Connect to database*/
// mongoose.connect(process.env.URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// if (mongoose.connection.readyState) {
//   console.log("Holy Crap! It Connected");
// } else if (!mongoose.connection.readyState) {
//   console.log("WHACHA DO!!!");
// }

// app.use(cors());

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// app.use(express.static("public"));
// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/views/index.html");
// });

// /*Model*/
// const userSchema = new mongoose.Schema({
//   _id: { type: String, required: true, default: shortId.generate },
//   username: { type: String, required: true },
//   count: { type: Number, default: 0 },
//   log: [
//     {
//       description: { type: String },
//       duration: { type: Number },
//       date: { type: Date }
//     }
//   ]
// });

// const User = mongoose.model("User", userSchema);

/*Test 1: You can POST to /api/users with form data username to create a new user.
    The returned response will be an object with username and _id properties.*/
//PASSED

// app.post("/api/users", (req, res) => {
//   const username = req.body.username;
//   User.findOne({ username: username }, (err, found) => {
//     if (err) return;
//     if (found) {
//       res.send("Username Taken");
//     } else {
//       const newUser = new User({
//         username: username
//       });
//       newUser.save((err, save) => {
//         if (err) return;
//         res.json({
//           username: username,
//           _id: save._id
//         });
//       });
//     }
//   });
// });

/*Test 2: You can make a GET request to /api/users to get an array of all users.
    Each element in the array is an object containing a user's username and _id.*/
//PASSED

// app.get("/api/users", (req, res) => {
//   User.find({}, "username _id", (err, users) => {
//     let arr = [];
//     users.map(user => {
//       arr.push(user);
//     });
//     res.json(arr);
//   });
// });

/*Test 3: You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date.
    If no date is supplied, the current date will be used.
        The response returned will be the user object with the exercise fields added.*/
//PASSED

// app.post("/api/users/:_id/exercises", async (req, res) => {
//   let { description, duration, date } = req.body;
//   let id = req.params._id;
//   if (!date) {
//     date = new Date().toDateString();
//   } else {
//     date = new Date(date).toDateString();
//   }

//   try {
//     let findOne = await User.findOne({
//       _id: id
//     });
    
//     if (findOne) {
//       console.log("Retrieving Stored User");
//       findOne.count++;
//       findOne.log.push({
//         description: description,
//         duration: parseInt(duration),
//         date: date
//       });
//       findOne.save();

//       res.json({
//         username: findOne.username,
//         description: description,
//         duration: parseInt(duration),
//         _id: id,
//         date: date
//       });
//     }
    
//   } catch (err) {
//     console.error(err);
//   }
// });

/*Test 4: You can make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.
    The returned response will be the user object with a log array of all the exercises added.
        Each log item has the description, duration, and date properties.*/
//PASSED

/*Test 5: A request to a user's log (/api/users/:_id/logs) returns an object with a count
    property representing the number of exercises returned.*/
//PASSED

/*Test 6: You can add from, to and limit parameters to a /api/users/:_id/logs request to retrieve part
    of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many 
      logs to send back.*/
//PASSED

// app.get("/api/users/:_id/logs", (req, res) => {
//   User.findById(req.params._id, (error, result) => {
//     if (!error) {
//       let resObj = result;

//       if (req.query.from || req.query.to) {
//         let fromDate = new Date(0);
//         let toDate = new Date();

//         if (req.query.from) {
//           fromDate = new Date(req.query.from);
//         }

//         if (req.query.to) {
//           toDate = new Date(req.query.to);
//         }

//         fromDate = fromDate.getTime();
//         toDate = toDate.getTime();

//         resObj.log = resObj.log.filter(session => {
//           let sessionDate = new Date(session.date).getTime();

//           return sessionDate >= fromDate && sessionDate <= toDate;
//         });
//       }

//       if (req.query.limit) {
//         resObj.log = resObj.log.slice(0, req.query.limit);
//       }

//       resObj = resObj.toJSON();
//       resObj["count"] = result.log.length;
//       res.json(resObj);
//     }
//   });
// });

// app.post("/api/users/view", (req, res) => {
//   console.log(req.body);
//   User.findById(req.body._id, (error, result) => {
//     if (!error) {
//       let resObj = result;

//       if (req.body.from || req.body.to) {
//         let fromDate = new Date(0);
//         let toDate = new Date();

//         if (req.body.from) {
//           fromDate = new Date(req.body.from);
//         }

//         if (req.body.to) {
//           toDate = new Date(req.body.to);
//         }

//         fromDate = fromDate.getTime();
//         toDate = toDate.getTime();

//         resObj.log = resObj.log.filter(session => {
//           let sessionDate = new Date(session.date).getTime();

//           return sessionDate >= fromDate && sessionDate <= toDate;
//         });
//       }

//       if (req.body.limit) {
//         resObj.log = resObj.log.slice(0, req.body.limit);
//       }

//       resObj = resObj.toJSON();
//       resObj["count"] = result.log.length;
//       res.json(resObj);
//     }
//   });
// });

// const listener = app.listen(process.env.PORT || 3000, () => {
//   console.log('Your app is listening on port ' + listener.address().port)
// })