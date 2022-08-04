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
//         date: new Date(date), 
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


//Excercise Schema


const ExerciseSchema = new Schema({
  description:{
    type:String,
    required:true
  },
  duration:{
    type:Number,
    required:true
  },
  date:String
})
//User Schema
const userSchema=new Schema({
  username:{
    type:String,
    required:true
  },
  log:[ExerciseSchema]
})
const User=mongoose.model("User",userSchema)
const Exercise = mongoose.model("Excercise", ExerciseSchema)

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


//Endpoind Of user
// app.route("/api/users").post(async(req,res)=>{
//   const{username}=req.body
//   const user=await User.create({username:username})
//   res.json(user)
// }).get(async(req,res)=>{

// const user=await User.find()

// res.json(user)
// })

//Excercise Endpoint

app.post("/api/users/:_id/exercises",async(req,res)=>{
  const{description,duration,date}=req.body
  const{_id}=req.params
  let excercise=await Exercise.create({description,duration:parseInt(duration),date})
  if(excercise.date===""){
    excercise.date=new Date(Date.now()).toISOString().substr(0,10)
  }
  await User.findByIdAndUpdate(_id,{$push:{log:excercise} },{new:true},(err,user)=>{
    let responseObj={}
    responseObj["_id"]=user._id
    responseObj["username"]=user.username
    responseObj["date"]=new Date(excercise.date).toDateString(),
    responseObj["description"]=excercise.description,
    responseObj["duration"]=excercise.duration

    res.json(responseObj)
  })

  res.json({})

})

//Logs Endpoint
app.get("/api/users/:_id/logs",async(req,res)=>{
  if(req.params._id){
    await User.findById(req.params._id,(err,result)=>{
    if(!err){
      let responseObj={}
      responseObj["_id"]=result._id
      responseObj["username"]=result.username
      responseObj["count"]=result.log.length
      
      if(req.query.limit){
        responseObj["log"]=result.log.slice(0,req.query.limit)
      }else{
        responseObj["log"]=result.log.map(log=>({
        description:log.description,
        duration:log.duration,
        date:new Date(log.date).toDateString()
      }))
      }
      if(req.query.from||req.query.to){
        let fromDate=new Date(0)
        let toDate=new Date()
        if(req.query.from){
          fromDate=new Date(req.query.from)
        }
        if(req.query.to){
          toDate=new Date(req.query.to)
        }
        fromDate=fromDate.getTime()
        toDate=toDate.getTime()
        responseObj["log"]=result.log.filter((session)=>{
          let sessionDate=new Date(session.date).getTime()

          return sessionDate>=fromDate&&sessionDate<=toDate
        })
      }
      res.json(responseObj)
    }else{
      res.json({err:err})
    }
  })
  }else{
    res.json({user:"user not found with this id"})
  }
})


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
