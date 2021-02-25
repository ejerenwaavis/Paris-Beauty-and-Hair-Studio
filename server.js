require("dotenv").config();
const PASSWORD = process.env.PASSWORD;
const OPENTIME = {hrs:Number(process.env.OPENTIMEHRS), mins: Number(process.env.OPENTIMEMINS)};
const CLOSETIME = {hrs:Number(process.env.CLOSETIMEHRS), mins: Number(process.env.CLOSETIMEMINS)};
const DEPOSITPERCENT = process.env.DEPOSITPERCENT;
const SERVICE = process.env.SERVICE;
const USER = process.env.MAILERUSER;
const PASS = process.env.MAILERPASS;
const STRIPEAPI = process.env.STRIPEAPI;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRETE = process.env.CLIENT_SECRETE;
const SECRETE = process.env.SECRETE;



const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const stripe = require("stripe")(STRIPEAPI);
const nodemailer = require('nodemailer');

/**************** Authentication Constants **************/
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;



// Configure app to user EJS abd bodyParser
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(express.static("."));
app.use(express.json());

//Authentication & Session Management Config
app.use(session({
  secret: SECRETE,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());



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
  confirmed: {
        type: Boolean,
        default: false
    },
    // expireAt: {
    //    type: Date,
    //    default: addExpiration(6),
    //    // expires: ,
    //  },
});
const Appointment = mongoose.model("Appointment", appointmentSchema);


const userSchema = new mongoose.Schema({
  username: String,
  _id: String,
  verified: { type: Boolean, default: false }
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);


/********* Configure Passport **************/
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});


//telling passport to use GoogleStrategy
passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRETE,
    // callbackURL: "https://auto-g-codes.herokuapp.com/loggedIn",
    callbackURL: "/loggedin",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    let userProfile = profile._json;

    User.findOne({
      _id: userProfile.sub
    }, function(err, user) {
      console.log(err);
      if (!err) {
        console.log("userFOund---->:");
        console.log(user);
        if (user) {
            return cb(null, user)
        } else {
          console.log("user not found - creating new user");
          let newUser = new User({
            username: userProfile.name,
            _id: userProfile.sub,
            verified: false
          })
          newUser.save()
            .then(function() {
              console.log("User Created Successfully");
              return cb(null,user);
            })
            .catch(function(err) {
              console.log("failed to create user");
              console.log(err);
            });
        }
      } else {
        console.log("Internal error");
        return cb(new Error(err))
      }
    });
  }
));



app.route("/home")
  .get(function(req, res) {
    res.render("home", {
      body: new Body("Home", "", ""),
      purchase:initialPurchase(),
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
    let apptDate = new Date(req.body.date);
    let time = req.body.time;
    let apptID = req.body.stylist + new Date().getTime();
    const appt = new Appointment({
      _id: apptID,
      clientUsername: "planetavis@yahoo.com",
      clientName: "bill",
      style: {
        baseStyle: req.body.baseStyle,
        option: req.body.styleOption //"Small Waist length"
      },
      price: {
        total: (req.body.price),
        deposit: req.body.price * DEPOSITPERCENT,
        balance: req.body.price - (req.body.price * DEPOSITPERCENT)
      },
      startTime: time, // time of appointment start in hrs //{h:Number, m:Number},
      duration: req.body.duration, //In minutes
      date: new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate(), time.hrs, time.mins), //date of appointment
      stopTime: getApptStopTime(time, req.body.duration),
      stylist: req.body.stylist,

    })

    appt.save(function(err, savedDoc) {
      if (!err) {
        // console.log(savedDoc._id);
        apptSelfDestruct(savedDoc._id);
        res.send({status:"success", id:savedDoc._id});
      }else{
        res.send({status:"failed", message:"Unable to reserve booking, please try another appointment time or date"});
      }
    })

  });

app.route("/email")
  .get(function(req,res){
      res.render("email");
  });

app.route("/confirmAppointment")
.post(function(req,res){
  let id = req.body.id;
  let expireyDate = null;
  // console.log(id);
  // console.log("In the POST Method");
  Appointment.find({_id:id},function(err,item){
    let appt = item[0];
    let date = new Date(appt.date);
    date.setDate(date.getDate()+2);
    expireyDate = date;

    Appointment.updateOne({_id:id},{confirmed:true},function(e,r){
      if(!e){
        if(r.n > 0){
          // console.log(r);
          // send email here
          sendBookingDetails(appt);
          res.send("success");
        }else{
          console.log(r);
          res.send("Could Not Secure Appointment, Please try again " +  r)
        }
      }else{
        console.log(e);
        res.send("Error completing booking, please contact our support team.");
      }
    });
  });
})

app.route("/days/:stylist/:year/:dateMonth/:duration")
  .get(function(req, res) {
    const stylist = req.params.stylist;
    const dateMonth = req.params.dateMonth;
    const year = req.params.year;
    const duration = req.params.duration;
    Appointment.find({
      stylist: stylist
    }, function(err, foundAppts) {

      if (!err) {
        if(foundAppts){
          let days = [];
          let today = new Date(year,dateMonth);
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
          }
          res.send(days);
        }else{
          res.send(days);
        }
      }else{
        console.log(err);
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



/************ Stripe Payment **************/
app.route("/payment")
  .get(function(req,res){
    res.render("payment");
  })
  .post(function(req,res){
    let purchase = JSON.parse(req.body.purchase);
    let price = Number(purchase.price) * 100;
    // console.log(purchase);

    purchase.deposit = (price * DEPOSITPERCENT);
    purchase.tax = tax(purchase.deposit);
    purchase.total = (purchase.deposit + purchase.tax);

    console.log(purchase);
    // console.log(Number(purchase.tax));
    // console.log(purchase.deposit + purchase.tax);

    res.send("Payment OBJS Recieved");
    // res.render("payment", {body: new Body("Home", "", ""), purchase: purchase});
  })

app.post("/create-payment-intent", async (req, res) => {
  // console.log("Creating Intent!! ");
  const  pricings  = req.body.body;
  // Create a PaymentIntent with the order amount and currency
  // console.log(calculateOrderAmount(body));
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(pricings),
    currency: "usd"
  });
  res.send({
    clientSecret: paymentIntent.client_secret
  });
});

app.route("/orderPricings")
.post(function (req,res){
  // console.log("Geting Pricings");
  // console.log(req.body.price);
  let deposit = (Number(req.body.price) * DEPOSITPERCENT) * 100;
  let t = tax(deposit);
  let total = t + deposit;
  res.send({deposit:deposit, tax:t, total:total});
})




/****************** Authentication *******************/
app.route("/login")
  .get(function(req, res) {
    res.render("login", {
      body: new Body("Login", "", ""),
      purchase: initialPurchase(),
    });
  })

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile']
}));

app.route("/loggedin")
  .get(passport.authenticate('google', {
      failureRedirect: '/login'
    }),
    function(req, res) {
      // Successful authentication, redirect user page.
      // console.log("Logged IN");
      // console.log(user);
      // res.redirect("/");
      res.render('home', {
        body: new Body("Home", "", "Google Authentication Successful"),
        purchase: initialPurchase(),
      });
    })


app.route("/logout")
  .get(function(req, res) {
    req.logout();
    console.log("Logged Out");
    // res.redirect("/");
    res.render("home", {
      body: new Body("Home", "", ""),
      purchase:initialPurchase(),
    });
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
function initialPurchase(){
  return {
    baseStyle:"PlaceHolder",
    styleOption:"PlaceHolder",
    deposit:0,
    tax:0,
    total:0
  }
}
function compareDates(t,d){
  let comparison = 0;
  if (t.getFullYear() > d.getFullYear()) {
    comparison = 1;
  } else if (t.getFullYear() < d.getFullYear()) {
    comparison = -1;
  }else if(t.getFullYear() === d.getFullYear()){
    if (t.getMonth() > d.getMonth()) {
      comparison = 1;
    } else if (t.getMonth() < d.getMonth()) {
      comparison = -1;
    }else if(t.getMonth() == d.getMonth()){
      if (t.getDay() > d.getDay()) {
        comparison = 1;
      } else if (t.getDay() < d.getDay()) {
        comparison = -1;
      }
    }
  }
  return comparison;
}
function addExpiration(mins){
  let date = new Date();
  date.setMinutes(date.getMinutes() + mins);
  return date;
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
  let stopHrs = Number(apptStartTime.hrs) + Math.floor((duration/60));
  let stopMins = Number(apptStartTime.mins) + (duration%60);
  if(stopMins > 59){
    stopHrs =+ Math.floor(stopMins/60)
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
function calculateOrderAmount(item){

  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  // console.log(item.total);
  let total = Number(item.total);
  // console.log(total);
  return (total);
};
function tax(amt){
  let amount = Number(amt);
  let tax = (amount * 0.029) + 30 + (amount * 0.03);

  // console.log(tax);
  return Math.round(tax);
}

function apptSelfDestruct(apptID){
  // console.log("Appointment ID is: " +apptID);
  setTimeout(function(){
    Appointment.deleteOne({_id:apptID, confirmed:false}, function(err,status){
      // console.log(apptID);
      // console.log(err);
      console.log(status.n);
      if(!err){
          if(status.n>0){
            // console.log("deleted: "+apptID+" ");
          }else{
            console.log("Unable to delete id" + apptID);
          }
      }else{
        console.log(err);
      }
    });
  },(1000 * 60 * 5));
}

function sendBookingDetails(appt){
  console.log("Sending email to: "+ appt.clientUsername);
  const transporter = nodemailer.createTransport({
  service: SERVICE,
  auth: {
    user: USER,
    pass: PASS,
  }
});

  var mailOptions = {
  from: USER,
  to: appt.clientUsername,
  subject: 'Sending Email using Node.js',
  html: '<table style="background:#F8F9FA; border:1px solid #e4e4e4;margin-left:auto;margin-right:auto; height:100%; width:100%;text-align:center;">'
    +'<tr ><td style="padding:0.7rem 0 0 0;"> <a href="https://www.parisbeautyandhairstudio.com/home"><img class="img-logo" src="https://parisbeautyandhairstudio.herokuapp.com/img/logo/paris-primary-sm.png" alt=""></a> </td></tr>'
    +'<tr><td> <h1 style="padding:1rem;">Thanks For Booking us!</h1> </td></tr>'
    +'<tr><td><table style="border:1px solid #e4e4e4; margin-left:auto;margin-right:auto; width:70%;text-align:center;"><tr>'
    +'<td colspan="2" style="color:#fff; background:#cb2975;padding:10px 0 10px 0;">Appointment Details</td></tr>'
    +'<tr style="border-bottom:1px solid #e4e4e4"> <td colspan="2" style="padding:1rem 0 10px 0;"> <h5 style="margin-bottom:0.5rem"><b>Style</b></h5>  '+appt.style.baseStyle +' | <small>'+ appt.style.option+'</small> </td></tr> <tr>'
    +'<td style="padding:1rem 0 10px 0; width:50%; border-right:#e4e4e4 1px solid"> <h5 style="margin-bottom:0.5rem"><b>Date</b></h5>  '+new Date(appt.date).toDateString()+' </td>'
    +'<td style="padding:1rem 0 10px 0;width:50%"> <h5 style="margin-bottom:0.5rem"><b>Time</b></h5>  '+timeString(appt.startTime)+' </td></tr>'
    +'<tr style="border-top:1px solid #e4e4e4"> <td colspan="2" style="padding:1rem 0 10px 0;"> <h5 style="margin-bottom:0.5rem"><b>Stylist</b></h5>  '+appt.stylist+' </td></tr>'
    // +'<tr style="background:#e4e4e4"> <td colspan="2" style="border-top:1px solid #e4e4e4; padding:2rem 2rem;"> <button style="padding:0.5rem 5rem; border-radius:20px; background:transparent; border:1px solid #cb2975;" type="button" name="button">Add To Calendar</button></td></tr>'
    +'</table></td></tr>'
    +'<tr><td style=" padding: 1.5rem 1rem; width:20px">We look forward to taking good care of your hair,<br> untill then stay safe!.</td></tr></table>'
  };

  transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
}
function timeString(time){
  if(time){

    if(time.hrs>11){
      return ""+((time.hrs-12 === 0)? 12 : ((time.hrs-12) > 9)?(time.hrs-12):"0"+(time.hrs-12))+":"+((time.mins < 10)? "0"+time.mins:time.mins) + "pm";
    }else{
      return ""+((time.hrs > 9)?time.hrs:"0"+time.hrs)+":"+((time.mins < 10)? "0"+time.mins:time.mins) + "am";
    }
  }else{
    console.log("undefined time");
  }
}
