// require('dotenv').config()
// const express = require('express')
// const app = express()
// const cors = require('cors')

// const mongoose = require("mongoose");
// const bodyParser = require("body-parser")


// mongoose.connect(process.env.MONGO_URI, {
//   useUnifiedTopology: true,
//   useNewUrlParser: true,
// });

// const { Schema } = mongoose;

// const ExerciseSchema = new Schema({
//   userId: { type: String, required: true },
//   description: String,
//   duration: Number,
//   date: Date,
// });
// const UserSchema = new Schema({
//   username: String,
// });
// const User = mongoose.model("User", UserSchema);
// const Exercise = mongoose.model("Exercise", ExerciseSchema);


// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(cors())
// app.use(express.static('public'))
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/views/index.html')
// });


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

// // app.post("/api/users", (req, res) => {
// //   User.findOne({ username: req.body.username }, (err, foundUser) => {
// //     if (err) return;
// //     if (foundUser) {
// //       res.send("Username Taken");
// //     } else {
// //       const newUser = new User({
// //         username: req.body.username
// //       });
// //       newUser.save();
// //       res.json({
// //         username: req.body.username,
// //         _id: newUser.id
// //       });
// //     }
// //   });
// // });

// app.get("/api/users", (req, res) => {
//   User.find({}, (err, data) => {
//     if(!data){
//       res.send("No users")
//     }else{
//       res.json(data)
//     }
//   })
// })

// app.post("/api/users/:id/exercises", (req, res) => {
//   const id = req.params.id
//   const {description, duration, date} = req.body
//   User.findById(id, (err, userData) => {
//     if(err || !userData) {
//       res.send("Could not find user");
//     }else{
//       const newExercise = new Exercise({
//         userId: id, 
//         description,
//         duration,
//         date: new Date(date).toDateString(), 
//       })
//       newExercise.save((err, data) => {
//         if(err || !data) {
//           res.send("There was an error saving this exercise")
//         }else {
//           const { description, duration, date } = data;
//           res.json({
//             username: userData.username,
//             description,
//             duration,
//             date: date.toDateString(),
//             _id: userData.id
//           })
//         }
//       })
//     }
//   })
// })


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
//       // let nonNullLimit = limit ? limit : 500;
//       let limitPage = (limit !== '' ? parseInt(limit) : 500);

//       Exercise.find(filter).limit(limitPage).exec((err, data) => {
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


// // app.get('/api/users/:id/logs', async function(req, res) {
// // const { id } = req.params;
// // let { from, to, limit } = req.query;

// // console.log('/api/users/:id/logs', id, from, to, limit)

// // try {
// // let findConditions = { uid: id };

// // if ((from !== undefined && from !== '') || (to !== undefined && to !== '')) {
// //   findConditions.date = {};

// //   if (from !== undefined && from !== '') {
// //     findConditions.date.$gte = new Date(Date.parse(from));
// //   }

// //   if (to !== undefined && to !== '') {
// //     findConditions.date.$lte = new Date(Date.parse(to));
// //   }
// // }


// // let limitPage = (limit !== '' ? parseInt(limit) : 0);

// // const data = await Exercise
// //   .find(findConditions)
// //   .limit(limitPage)
// //   .exec();

// // const response = {
// //   username: data[0].username,
// //   count: data.length,
// //   id: data[0].userId,
// //   log: data.map((item) => ({
// //     description: item.description,
// //     duration: item.duration,
// //     date: item.date.toDateString()
// //   }))
  
// // }

// // console.log('/api/users/:id/logs', response)

// // return res.status(200).json(response)
// // } catch (err) {
// // res.status(500).json({
// // message: err
// // });
// // }

// // });


// const listener = app.listen(process.env.PORT || 3000, () => {
//   console.log('Your app is listening on port ' + listener.address().port)
// })


const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const {Schema} = mongoose;
const moment = require('moment');
require('dotenv').config()

app.use(bodyParser.urlencoded({extended:false}));
app.use(cors())
app.use(express.static('public'))
app.use(({ method, url, query, params, body }, res, next) => {
  console.log('>>> ', method, url);
  console.log(' QUERY:', query);
  console.log(' PRAMS:', params);
  console.log('  BODY:', body);
  const _json = res.json;
  res.json = function (data) {
    console.log(' RESLT:', JSON.stringify(data, null, 2));
    return _json.call(this, data);
  };
  console.log(' ----------------------------');
  next();
});
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//Mongoose Config
mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new Schema({
  username:{
    type:String,
    required:true
  },
  exercise:[{
    description: String,
    duration: Number,
    date: String,
  }]
});
const User = mongoose.model('User',userSchema);


//URI handling
app.post('/api/users',function(req,res){
  if(req.body.username != undefined){
    let username = req.body.username;
    let user = new User({username});
    user.save(function(err,data){
      if(err)res.json({error:"Mongo error"})
      else{
        const {username,_id} = data;
        res.json({username,_id});
      }
    });
  }else{
    res.json({error:"invalid data"})
  }
});

app.get('/api/users',function(req,res){
    User.find({}).exec(function(err,data){
      if(err)res.json({error:"Mongo error"})
      else{
        res.json(data);
      }
    });
});

app.post('/api/users/:_id/exercises',function(req,res){
  if(req.body.description!=undefined && req.body.duration!=undefined && req.params._id!=undefined){
    let {description,duration,date} = req.body;
    const {_id} = req.params;

    if(date===undefined || date == "")
      date = new Date().toDateString();
    else
      date = new Date(date).toDateString();
      
    // console.log({description,duration,date});
    User.findByIdAndUpdate(_id,{$push:{exercise:{description,duration,date}}},{new:true},function(err,data){
      if(err)res.json({error:"Mongo Error"});
      else{
        User.find({_id:_id}).slice('exercise', -1).exec(function(err,data){
          if(err)res.json({error:"Mongo Error"});
          else{
            let {username,_id,exercise:[{description,duration,date}]} = data[0];
            res.json({username,_id,description,duration,date});
          }
        });
      }
    })
  }else{
    res.json({error:"invalid data"})
  }
});


app.get('/api/users/:_id/logs',function(req,res){
  if(req.params._id!=undefined){
    const {_id} = req.params;
    const {from,to,limit} = req.query;
    User.findById(_id,'username _id exercise.description exercise.duration exercise.date',function(err,data){
      if(err)res.json({error:"Mongo Error"});
      else{
        let {username,_id,exercise:log} = data;

        if(from!=undefined && to!=undefined){
          log = log.filter((ele)=>{
            let eleDate = (new Date(ele.date)).getTime();
            let fromDate = (new Date(from+" 00:00:00")).getTime();
            let toDate = (new Date(to+" 00:00:00")).getTime();

            return eleDate >= fromDate && eleDate <= toDate;
          })
        }
        if(limit!=undefined){
          log = log.slice(0,limit);
        }
        
        log = log.map((ele)=>{
          return {description:ele.description,duration:ele.duration,date:new Date(ele.date).toDateString()};
        })

        let count = 0;
        if(log!=undefined)
          count = log.length
        res.json({username,_id,log,count});
      }
    });
  }else{
    res.json({error:"invalid data"})
  }
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})