require("dotenv").config();
const PASSWORD = process.env.PASSWORD;
const OPENTIME = {hrs:Number(process.env.OPENTIMEHRS), mins: Number(process.env.OPENTIMEMINS)};
const CLOSETIME = {hrs:Number(process.env.CLOSETIMEHRS), mins: Number(process.env.CLOSETIMEMINS)};

const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const https = require("https");




// Configure app to user EJS abd bodyParser
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));




// Mongoose Configuration and Setup
const uri = "mongodb+srv://Admin-Avis:" + PASSWORD + "@db1.s2pl8.mongodb.net/parisStudio";
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);


// Mongoose Schemas
const styleSchema = new mongoose.Schema({
  baseStyle: String,
  options: [{
    name: String,
    price: Number, // price in dollars
    duration: Number, //duration in minutes
  }]
});
const Style = mongoose.model("Style", styleSchema);


const stylistSchema = new mongoose.Schema({
  username: String,
  name: String,
  photoURL: String,
});
const Stylist = mongoose.model("Stylist", stylistSchema);


const appointmentSchema = new mongoose.Schema({
  _id: String,
  clientUsername: String,
  clientName: String,
  style: {
    baseStyle: String,
    option: String
  },
  price: {
    deposit: Number,
    balance: Number,
    total: Number
  },
  startTime: {hrs:Number,mins:Number}, //{h:Number, m:Number}, // time of ap[pointment start
  duration: Number, //in minutes
  date: Date, //date of appointment
  stopTime: {hrs:Number,mins:Number},
  stylist: String,
});

const Appointment = mongoose.model("Appointment", appointmentSchema);




app.route("/home")
  .get(function(req, res) {
    res.render("home", {
      body: new Body("Home", "", "")
    });
  });

app.route("/cart")
  .get(function(req, res) {
    res.render("cart", {
      body: new Body("Bag", "", "")
    });
  });

app.route("/shop")
  .get(function(req, res) {
    res.render("products", {
      body: new Body("Shop", "", "")
    });
  });


app.route("/account")
  .get(function(req, res) {
    res.render("account", {
      body: new Body("Account", "", "")
    });
  });

app.route("/book")
  .get(function(req, res) {
    res.render("booking", {
      body: new Body("Book", "", "")
    });
  });


app.route("/addStyle")
  .get(function(req, res) {
    res.render("addStyle", {
      body: new Body("Add Style", "", "")
    });
  })
  .post(function(req, res) {
    var baseStyle = req.body.baseStyleName;
    var options = JSON.parse(req.body.options);

    const style = new Style({
      baseStyle: baseStyle,
      options: options
    });

    style.save(function(err, savedDoc) {
      if (!err) {
        if (savedDoc) {
          console.log(savedDoc);
          res.render("addStyle", {
            body: new Body("Add Style", "", "Saved Style Succesfully")
          });
        }

      } else {
        res.render("addStyle", {
          body: new Body("Add Style", err, "")
        });
      }
    })
  })


app.route("/getStyles")
  .get(function(req, res) {
    Style.find({}, function(err, foundOBJ) {
      // console.log(foundOBJ);
      if (foundOBJ) {
        res.send(foundOBJ);
      }
    })
  })

app.route("/stylists")
  .get(function(req, res) {
    Stylist.find({}, function(err, foundOBJ) {
      // console.log(foundOBJ);
      if (foundOBJ) {
        res.send(foundOBJ);
      }
    })
  })
  .post(function(req, res) {
    const stylist = new Stylist({
      username: new Date().getTime() + "susan@gmail.com",
      name: "Susan",
      photoURL: "https://lh3.googleusercontent.com/-3biAz13t9EA/Xc2ZBrgL4XI/AAAAAAAACfw/NYsnpIKzfBcU3cryHfmDrSXt5np5OqqqQCEwYBhgLKtQDAL1OcqxlfPshAeKxbMyutm8vJ4y3nqxfPM5PCHgxyG1CjVMyj_r08Be4k5jFkk0-lPhJq9iKZba0i3S6zQIDYlTLHmZXt-02ixvkgP8MwE5XT0-c7t_s1TkSEyeuTzQBr8G0pT6XixkQmZv0ZB69bUJV6eH4pmT_u2LbUJe9duvoA8YXdxV6Ly3m9WXy7AgP_S0lfkPuTVr6thiBcfNElUyUUYJlzi1JtyRGdCFA_LSZn7UnNgYh82JuJe0pklResLBvSc7aCq42jt481KABPp8uzbkXmcK2hUGyNkw71FKuOptme3Axb_Dm9bov6Xp2WFjr-GhnZIue-Kgo5qbNM93khCkrjt58UJSFIMkaVfx67sEDZreUIQaKGF-Ms5VUwDynF3KNDjsWZThnCdW-yOcIwgg7b_NYEYJo7bnzmyhNdFW6P_Zm7hwkmD6nBQtaVX6Z1pxsvehFnCIaNBUlweDpPznYv974yXERmf3r0Jcf5fnwcQqyemtv4rENzG-lTXpgOh6kkityosOwojIeCrcvzaLoTSogVzbLq2VXp0Y8f8lw0nQklcLjSJ0BSU8BJnhlm5XTCWt7rgBhAUyaNi94jR7nIqeyJSUncqnJHKEYWVnJMK3cgoEG/w138-h140-p/2019-11-14.png",
    })

    stylist.save(function(err, savedDoc) {
      if (!err) {
        res.send(savedDoc);
      }
    })
  })

app.route("/appt")
  .get(function(req, res) {
    Appointment.find(function(err, foundOBJ) {
      res.send(foundOBJ);
    })
  })
  .post(function(req, res) {
    const appt = new Appointment({
      _id: "Susan" + new Date().getTime(),
      clientUsername: "bill@gmail.com",
      clientName: "bill",
      style: {
        baseStyle: "Box Braids/Goddess Box braids",
        option: "Small Waist length"
      },
      price: {
        deposit: 100,
        balance: 120,
        total: 220
      },
      startTime: {hrs:11,mins:30}, // time of appointment start in hrs //{h:Number, m:Number},
      duration: 60, //In minutes
      date: new Date(2021, 01, 18, 11, 30), //date of appointment
      stopTime: getApptStopTime({hrs:11,mins:30}, 60),
      stylist: "Susan",
    })

    appt.save(function(err, savedDoc) {
      if (!err) {
        res.send(savedDoc);
      }
    })
  })

app.route("/days/:stylist/:dateMonth/:duration")
  .get(function(req, res) {
    const stylist = req.params.stylist;
    const dateMonth = req.params.dateMonth;
    const duration = req.params.duration;
    Appointment.find({
      stylist: stylist
    }, function(err, foundAppts) {

      if (!err) {
        let days = [];
        let today = new Date(2021,dateMonth);
        let daysInMonth = new Date(today.getFullYear(), (today.getMonth() + 1), 0).getDate(); //Zero Based

        let match = 0;

        // console.log(daysInMonth);
        for (var i = 1; i < daysInMonth + 1; i++) {
          var tempDate = new Date(today.getFullYear(), today.getMonth(), i);

          let todaysAppts = []
          for (appt of foundAppts) {
            if (appt.date.getFullYear() === tempDate.getFullYear() && appt.date.getMonth() === tempDate.getMonth() && appt.date.getDate() === tempDate.getDate()) {
              match++;
              todaysAppts.push(appt);
            }
          }
          if(todaysAppts.length > 0){
            todaysAppts.sort(compareAppts)
            // console.log(todaysAppts);
            let day = {
              date: tempDate,
              availableTimes:getAvailableTimes(todaysAppts,duration),
            }
            days.push(day);
          }else{

            let availableTime = {start:OPENTIME, stop:CLOSETIME};
            if(duration < getAvaialbleTimeDuration(availableTime)){
              let day = {
                date: tempDate,
                availableTimes:[availableTime],
              }
              days.push(day);
            }else{
              let day = {
                date: tempDate,
                availableTimes:[],
              }
              days.push(day);
            }

          }
          // console.log(i);
        }
        // days.push(match);
        res.send(days);
      }
    })
  });

app.route("/officialHours")
  .get(function(req,res){
    res.send({start:OPENTIME, stop:CLOSETIME});
  });


app.route("/")
  .get(function(req, res) {
    res.render("cover");
  });





app.listen(process.env.PORT || 3000, function() {
  console.log("Paris Hair and Beauty Studio is Live");
});





/************** helper functions *******************/
function Body(title, error, message) {
  this.title = title;
  this.error = error;
  this.message = message;
}

function compareAppts(a,b){
  let comparison = 0;
  if (a.date > b.date) {
    comparison = 1;
  } else if (a.date < b.date) {
    comparison = -1;
  }
  return comparison;
}

function compareTimes(a,b){
  let comparison = 0;
  if (a.hrs > b.hrs) {
    comparison = 1;
  } else if (a.hrs < b.hrs) {
    comparison = -1;
  } else if (a.hrs === b.hrs ){
    if (a.mins > b.mins) {
      comparison = 1;
    } else if (a.mins < b.mins) {
      comparison = -1;
    }
  }
  return comparison;
}

function getAvailableTimes(todaysAppts,duration){
  let availableTimes = [];
    if (todaysAppts.length > 1){
      for(var i=0; i<todaysAppts.length;i++){
      let appt = todaysAppts[i];
      if(i === 0){
        // console.log("firstAppt == > " + appt.style + " @ "+appt.startTime.hrs +":"+appt.startTime.mins);
        let comparison = compareTimes(appt.startTime, OPENTIME);
        switch (comparison) {
          case 1:
            if(compareTimes(OPENTIME, appt.startTime) !== 0){
              let availableTime = {start:OPENTIME, stop:appt.startTime};
              if(duration < getAvaialbleTimeDuration(availableTime)){
                availableTimes.push(availableTime);
              }
            }
            break;
          default:
            if(compareTimes(appt.stopTime, todaysAppts[i+1].startTime) !== 0){
              let availableTime = {start:appt.stopTime, stop:todaysAppts[i+1].startTime};
              if(duration < getAvaialbleTimeDuration(availableTime)){
                availableTimes.push(availableTime);
              }
            }
        }
      }else if(i > 0 && i < todaysAppts.length-1){
        // console.log("APPT # "+ (i+1) + " ==> " + appt.style + " @ "+appt.startTime.hrs +":"+appt.startTime.mins);
        let comparison = compareTimes(appt.startTime, todaysAppts[i-1].stopTime);
        switch (comparison) {
          case 1:
            if(compareTimes(todaysAppts[i-1].stopTime, appt.startTime) !== 0){
              let availableTime = {start:todaysAppts[i-1].stopTime, stop:appt.startTime};
              if(duration < getAvaialbleTimeDuration(availableTime)){
                availableTimes.push(availableTime);
              }
            }
            break;
          default:
            if(compareTimes(appt.stopTime, todaysAppts[i+1].startTime) !== 0){
              let availableTime = {start:appt.stopTime, stop:todaysAppts[i+1].startTime};
              if(duration < getAvaialbleTimeDuration(availableTime)){
                availableTimes.push(availableTime);
              }
            }
        }
      }else {
        // console.log("Last Appt. ==> " + appt.style + " @ "+appt.startTime.hrs +":"+appt.startTime.mins +" - "+appt.stopTime.hrs+":" + appt.stopTime.mins);
        let comparison = compareTimes(appt.startTime, todaysAppts[i-1].stopTime);
        switch (comparison) {
          case 1:
            if(compareTimes(appt.stopTime, CLOSETIME) !== 0){
              let availableTime = {start:appt.stopTime, stop:CLOSETIME};
              if(duration < getAvaialbleTimeDuration(availableTime)){
                availableTimes.push(availableTime);
              }
            }
            break;
          default:
          if(compareTimes(todaysAppts[i-1].stopTime, appt.startTime) !== 0){
            let availableTime = {start:todaysAppts[i-1].stopTime, stop:appt.startTime};
            if(duration < getAvaialbleTimeDuration(availableTime)){
              availableTimes.push(availableTime);
            }
          }
        }
      }
    }
    }else{
      let appt = todaysAppts[0];
      let comparison = compareTimes(appt.startTime, OPENTIME);
      switch (comparison) {
        case 1:
            let firstAvailableTime = {start:OPENTIME, stop:appt.startTime};
            if(duration < getAvaialbleTimeDuration(firstAvailableTime)){
              availableTimes.push(firstAvailableTime);
            }

            if(compareTimes(appt.stopTime,CLOSETIME) === -1){
              let secondAvailableTime = {start:appt.stopTime, stop:CLOSETIME};
              if(duration < getAvaialbleTimeDuration(secondAvailableTime)){
                availableTimes.push(secondAvailableTime);
              }
            }
          break;
        default:
        let availableTime = {start:todaysAppts[0].stopTime, stop:CLOSETIME};
        if(duration < getAvaialbleTimeDuration(availableTime)){
          availableTimes.push(availableTime);
        }
      }
    }
    return availableTimes;
}

function getApptStopTime(apptStartTime, duration){
  let stopHrs = apptStartTime.hrs + Math.floor((duration/60));
  let stopMins = apptStartTime.mins + (duration%60);
  if(stopMins > 59){
    stopHrs += Math.floor(stopMins/60)
    stopMins = stopMins%60;
  }
  return {hrs:stopHrs, mins:stopMins}
}
function getApptDuration(appt){
  let start = (appt.startTime.hrs * 60) + appt.startTime.mins;
  let stop = (appt.stopTime.hrs * 60) + appt.stopTime.mins;
  return (stop-start);
}
function getAvaialbleTimeDuration(avaialbleTime){
  let start = (avaialbleTime.start.hrs * 60) + avaialbleTime.start.mins;
  let stop = (avaialbleTime.stop.hrs * 60) + avaialbleTime.stop.mins;
  return (stop-start);
}
