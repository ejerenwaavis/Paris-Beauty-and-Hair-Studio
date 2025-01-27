const SERVER = !(process.execPath.includes("C:"));//process.env.PORT;
if (!SERVER){
  // console.error(SERVER);
  require("dotenv").config();
}


/*********Handling Server / Local Enviromnemnt sensitive variables************/
const APP_DIRECTORY = !(SERVER) ? "" : ((process.env.APP_DIRECTORY) ? (process.env.APP_DIRECTORY) : "");
const PUBLIC_FOLDER = (SERVER) ? "./" : "../";
const path = require("path");

const PORT = process.env.PORT || 4000;

/**************** SYSTEM VAIRAIBLES ******************/
const MONGOPASSWORD = process.env.MONGOPASSWORD;
const MONGOUSER = process.env.MONGOUSER;
const MONGOURI2 = process.env.MONGOURI2;

const OPENTIME = {hrs:Number(process.env.OPENTIMEHRS), mins: Number(process.env.OPENTIMEMINS)};
const CLOSETIME = {hrs:Number(process.env.CLOSETIMEHRS), mins: Number(process.env.CLOSETIMEMINS)};
const DEPOSITPERCENT = process.env.DEPOSITPERCENT;
const SERVICE = process.env.SERVICE;
const USER = process.env.MAILERUSER;
const PASS = process.env.MAILERPASS;
const MAILER = process.env.MAILER;
const STRIPEAPI = process.env.STRIPEAPI;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRETE = process.env.CLIENT_SECRETE;
const SECRETE = process.env.SECRETE;
const SALTROUNDS = Number(process.env.SALTROUNDS);
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET


/************* Module Invocations *********************/
const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const stripe = require("stripe")(STRIPEAPI);
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');




/**************** Authentication Constants **************/
const session = require("express-session");
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;



// Configure app to user EJS abd bodyParser
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// app.use(express.static(path.join(__dirname, ".")));


//Authentication & Session Management Config
app.use(session({
  secret: SECRETE,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());



// Mongoose Configuration and Setup
const uri = "mongodb+srv://"+MONGOUSER+":" + MONGOPASSWORD + MONGOURI2;
// console.log(uri);
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
  photoURL: { type: String, default: "" },
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
  _id: String,
  username: String,
  phone: String,
  firstName: String,
  lastName: String,
  // DoB: Date,
  password: {type:String,default:""},
  photoURL: String,
  userHasPassword: {
    type: Boolean,
    default:false
  },
  verified: { type: Boolean, default: false },
  isAdmin:{ type: Boolean, default: false },
  isStylist:{ type: Boolean, default: false }
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


//telling passprt to use local Strategy
passport.use(new LocalStrategy(
  function(username, password, done) {
    // console.log("Finding user");
    User.findOne({ _id: username }, function (err, user) {
      // console.log("dons searching for user");
      if (err) { console.log(err); return done(err); }
      if (!user) {
        console.log("incorrect User name");
        return done(null, false, { message: 'Incorrect username.' });
      }

      bcrypt.compare(password, user.password, function(err, result) {
        if(!err){
          if(!result){
            console.log("incorrect password");
            return done(null, false, { message: 'Incorrect password.' });
          }else{
            return done(null, user);
          }
        }else{
          // console.log("********some other error *************");
          console.log(err);
        }
      });
    });
  }
));

//telling passport to use Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: (SERVER)?"https://parisbeautyandhairstudio.herokuapp.com/facebookLoggedin":"/facebookLoggedin",
    enableProof: true,
    profileFields: ["birthday", "email", "first_name", 'picture.type(large)', "last_name"]
  },
  function(accessToken, refreshToken, profile, cb) {
    let userProfile = profile._json;
    // console.log("************ FB Profile *******");
    // console.log(userProfile.picture.data.url);
    User.findOne({ _id: userProfile.email }, function (err, user) {
      if(!err){
        if(user){
          console.log("Logged in as ----> "+user._id);
          return cb(err, user);
        }else{
          let newUser = new User({
            _id: userProfile.email,
            username: userProfile.email,
            firstName: userProfile.first_name,
            lastName: userProfile.last_name,
            photoURL: userProfile.picture.data.url,
            verified: false
          });

          Stylist.exists({username:newUser.username}, function(err,exists){
            if(!err){
              if(exists){
                console.log("new user is a stylist");
                newUser.isStylist = true;
              }else{
                console.log("user is not a stylist");
              }
              newUser.save()
                .then(function() {
                  return cb(null,user);
                })
                .catch(function(err) {
                  console.log("failed to create user");
                  console.log(err);
                  return cb(new Error(err));
                });
              }else{
                newUser.save()
                  .then(function() {
                    return cb(null,user);
                  })
                  .catch(function(err) {
                    console.log("failed to create user");
                    console.log(err);
                    return cb(new Error(err));
                  });
              }
          })



        }
      }else{
          console.log("***********Internal error*************");
          console.log(err);
          return cb(new Error(err));
      }
    });
  }
));

//telling passport to use GoogleStrategy
passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRETE,
    callbackURL: (SERVER)?"https://parisbeautyandhairstudio.com/googleLoggedin":"/googleLoggedin",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    let userProfile = profile._json;
    // console.log(userProfile);
    User.findOne({
      _id: userProfile.email
    }, function(err, user) {
      if (!err) {
        // console.log("logged in");
        if (user) {
            console.log("Logged in as ----> "+user._id);
            return cb(null, user)
        } else {
          console.log("user not found - creating new user");
          let newUser = new User({
            _id: userProfile.email,
            username: userProfile.email,
            firstName: userProfile.given_name,
            lastName: userProfile.family_name,
            photoURL: userProfile.picture,
            verified: false
          });

          Stylist.exists({username:newUser.username}, function(err,exists){
            if(!err){
              if(exists){
                console.log("new user is a stylist");
                newUser.isStylist = true;
              }else{
                console.log("user is not a stylist");
              }
              newUser.save()
                .then(function() {
                  return cb(null,user);
                })
                .catch(function(err) {
                  console.log("failed to create user");
                  console.log(err);
                  return cb(new Error(err));
                });
              }else{
                newUser.save()
                  .then(function() {
                    return cb(null,user);
                  })
                  .catch(function(err) {
                    console.log("failed to create user");
                    console.log(err);
                    return cb(new Error(err));
                  });
              }
          })


        }
      } else {
        console.log("***********Internal error*************");
        console.log(err);
        return cb(new Error(err));
      }
    });
  }
));


app.route(APP_DIRECTORY+"/")
  .get(function(req, res) {
    res.render("cover");
  });

app.route(APP_DIRECTORY+"/home")
  .get(function(req, res) {
    if(req.isAuthenticated()){
      res.render("home", {
        body: new Body("Home", "", ""),
        purchase:initialPurchase(),
        user:req.user,
      });
    }else{
      res.render("home", {
        body: new Body("Home", "", ""),
        purchase:initialPurchase(),
        user:req.user,
      });
    }
  });

app.route(APP_DIRECTORY+"/account")
  .get(function(req, res) {
    if(req.user){
      // console.log("finding appts for --> "+ req.user.username);
      Appointment.find({clientUsername:req.user.username}, function(err,foundAppts){

        let activeAppts = [];
        let inactiveAppts = [];
        let unconfirmedAppts = [];
        let today = new Date();
        for(appt of foundAppts){
          if(appt.date.getTime() > today.getTime()){
            if(appt.confirmed){
              activeAppts.push(appt);
            }else{
              unconfirmedAppts.push(appt);
            }
          }else{
            inactiveAppts.push(appt);
          }
        }
        // console.log(activeAppts);
        res.render("account", {
          body: new Body("Account", "", ""),
          purchase: initialPurchase(),
          activeAppts:activeAppts,
          inactiveAppts:inactiveAppts,
          unconfirmedAppts:unconfirmedAppts,
          user:req.user,
        });
      });

    }else{
      res.render("login", {
        body: new Body("Login", "You are not Logged In, Please sign in to see your account", ""),
        purchase: initialPurchase(),
        login:null,
        user:req.user,
      });
    }
  })
  .post(function(req,res){
    // let strdateOfBirth = (req.body.DoB).replace(/-/g,",");
    let update = {
      firstName : req.body.firstName,
      lastName : req.body.lastName,
      username : req.user.username,
      phone : req.body.phone,
      // bday : new Date(strdateOfBirth).toLocaleString(),
    }
    // console.log(update);

    User.updateOne({_id:update.username},{
      firstName:(update.firstName)?update.firstName:"",
      lastName:(update.lastName)?update.lastName:"",
      phone:(update.phone)?update.phone:null,
      // DoB:(update.bday)?update.bday:null,
    },function(e,r){
      if(!e){
        if(r.n > 0){
          console.log("Account Updated");
          res.redirect("/account");
        }else{
          console.log("failed to update");
          res.render("account", {
            body: new Body("Account","Account Update Failed: Internal Server ERror",""),
            purchase: initialPurchase(),
            user:req.user,
          })
        }
      }else{
        console.log(e);
        res.render("account", {
          body: new Body("Account","Account Update Failed: Internal Server ERror",""),
          purchase: initialPurchase(),
          user:req.user,
        })
      }
    });
  })

app.route(APP_DIRECTORY+"/myAppointments")
  .get(function(req,res){
    if(req.user){
      // console.log("finding appts for --> "+ req.user.username);
      Appointment.find({clientUsername:req.user.username}, function(err,foundAppts){

        let activeAppts = [];
        let inactiveAppts = [];
        let unconfirmedAppts = [];
        let today = new Date();
        for(appt of foundAppts){
          if(appt.date.getTime() > today.getTime()){
            if(appt.confirmed){
              activeAppts.push(appt);
            }else{
              unconfirmedAppts.push(appt);
            }
          }else{
            inactiveAppts.push(appt);
          }
        }
        activeAppts.sort(compareApptsSevere);
        inactiveAppts.sort(compareApptsSevere);
        unconfirmedAppts.sort(compareApptsSevere);
        res.render("myAppointments", {
          body: new Body("My Appointments", "", ""),
          purchase: initialPurchase(),
          activeAppts:activeAppts,
          inactiveAppts:inactiveAppts,
          unconfirmedAppts:unconfirmedAppts,
          user:req.user,
        });
      });

    }else{
      res.render("login", {
        body: new Body("Login", "You are not Logged In, Please sign in to see your account", ""),
        purchase: initialPurchase(),
        login:null,
        user:req.user,
      });
    }
  });


  app.route(APP_DIRECTORY+"/mySchedule")
    .get(function(req,res){
      if(req.user && req.user.isStylist){

        Stylist.findOne({username:req.user.username}, function(err,stylist){
          if(!err){
            if(stylist){
              Appointment.find({stylist:stylist.name}, function(err,foundAppts){
                let activeAppts = [];
                let inactiveAppts = [];
                let today = new Date();
                for(appt of foundAppts){
                  if(appt.date.getTime() > today.getTime()){
                    if(appt.confirmed){
                      activeAppts.push(appt);
                    }
                  }else{
                    inactiveAppts.push(appt);
                  }
                }
                // console.log(activeAppts);
                activeAppts.sort(compareApptsSevere);
                inactiveAppts.sort(compareApptsSevere);
                res.render("mySchedule", {
                  body: new Body("My Schedule", "", ""),
                  purchase: initialPurchase(),
                  activeAppts:activeAppts,
                  inactiveAppts:inactiveAppts,
                  user:req.user,
                });
              });
            }
          }else{
            console.log("Could not find Stylist");
            //render scedule page with error
            res.render("mySchedule", {
              body: new Body("My Schedule", "Could not fetch your appointments for you", ""),
              purchase: initialPurchase(),
              activeAppts:activeAppts,
              inactiveAppts:inactiveAppts,
              user:req.user,
            });
          }
        })


      }else{
        res.render("login", {
          body: new Body("Login", "You are not Logged In, Please sign in to see your account", ""),
          purchase: initialPurchase(),
          login:null,
          user:req.user,
        });
      }
    });


app.get(APP_DIRECTORY+"/getStyles", async (req, res) => {
  try {
    const foundOBJ = await Style.find({});
    // console.log(foundOBJ);
    res.send(foundOBJ);
  } catch (err) {
    // console.error(err);
    res.status(500).send("Error fetching styles");
  }
});



app.route(APP_DIRECTORY+"/appt")
  .get(function(req, res) {
    Appointment.find(function(err, foundOBJ) {
      res.send(foundOBJ);
    })
  })
  .post(function(req, res) {
    let apptDate = new Date(req.body.date);
    let time = req.body.time;
    let email = req.body.clientEmail;
    let name = req.body.clientName;
    let apptID = req.body.stylist + new Date().getTime();
    const appt = new Appointment({
      _id: apptID,
      clientUsername: email,
      clientName: name,
      style: {
        baseStyle: req.body.style.baseStyle,
        option: req.body.style.option //"Small Waist length"
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

  })
  .delete(function(req,res){
    const apptID = req.body.apptID;
    Appointment.deleteOne({_id:apptID}, function(err,deleted){
      if(!err){
        if(deleted.n>0){
          console.log();
          res.send(true);
        }else{
          res.send(false);
        }
      }else{
        console.log("Error Occured\n");
        console.log(err);
        res.send(false);
      }
    })
  })

app.route(APP_DIRECTORY+"/confirmAppointment")
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

app.route(APP_DIRECTORY+"/days/:stylist/:year/:dateMonth/:duration")
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

app.route(APP_DIRECTORY+"/officialHours")
  .get(function(req,res){
    res.send({start:OPENTIME, stop:CLOSETIME});
  });



  // unused routes
  /*
  app.route(APP_DIRECTORY+"/book")
    .get(function(req, res) {
      res.render("booking", {
        body: new Body("Book", "", ""),
        purchase: initialPurchase(),
        user: req.user
      });
    });
    app.route(APP_DIRECTORY+"/cart")
      .get(function(req, res) {
        res.render("cart", {
          body: new Body("Bag", "", ""),
          purchase: initialPurchase(),
          user:req.user,
        });
      });
    app.route(APP_DIRECTORY+"/shop")
      .get(function(req, res) {
        res.render("products", {
          body: new Body("Shop", "", ""),
          purchase: initialPurchase(),
          user: req.user,
        });
      });
    app.route(APP_DIRECTORY+"/email")
      .get(function(req,res){
        const transporter = nodemailer.createTransport({
          service: SERVICE,
          auth: {
            user: USER,
            pass: PASS,
          }
        });

        let content = 'BEGIN:VCALENDAR\r\nPRODID:-//ACME/DesktopCalendar//EN\r\nMETHOD:REQUEST\r\n...';

        let message = {
            from: MAILER,
            to: 'planetavis@yahoo.com',
            subject: 'Appointment iCal',
            text: 'Please see the attached appointment',
            icalEvent: {
                filename: 'invitation.ics',
                method: 'request',
                content: content
            }
        };

        transporter.sendMail(message, function(error, info){
          if (error) {
            console.log(error);
            res.send(error)
          } else {
            console.log('Email sent: ' + info.response);
            res.send("Success")
          }
        });
          // res.render("email");
      });

  */

/********* ADMIN ACTIONS **************/
app.route(APP_DIRECTORY+"/addStyle")
  .get(function(req, res) {
      res.redirect("/adminComsole")
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
            res.render("adminConsole", {
              body: new Body("Console", "", savedDoc.baseStyle+" Style saved Succesfully"),
              user: req.user,
            });
          }

        } else {
          res.render("adminConsole", {
            body: new Body("Console", err, "")
          });
        }
      });
  })

app.route(APP_DIRECTORY+"/stylists")
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
      username: req.body.username,
      name: req.body.fUllName,
    })

    if(stylist.username && stylist.name){
      stylist.save(function(err, savedDoc) {
        if (!err) {
          User.exists({_id:stylist.username}, function(err,exists){
            if(exists){
              User.updateOne({_id:stylist.username},{isStylist:true}, function(err,status){
                if(!err){
                    if(status.n>0){
                      console.log("User updated");
                      res.render("adminConsole",{
                          body: new Body("Console","","Stylist "+ savedDoc.name +" was Added Successfully")
                      });
                    }else{
                      res.render("adminConsole",{
                          body: new Body("Console","","Could Not Update User")
                      });
                    }
                  }else{
                    res.render("adminConsole",{
                        body: new Body("Console","Stylist saved with errors - Error occured while updating user","")
                    });
                  }
                });
              }else{
                res.render("adminConsole",{
                    body: new Body("Console","Stylist saved with warning - User Not registered Yet","")
                });
              }
          });
        }else{
          res.render("adminConsole",{
              body: new Body("Console","Failed to create Stylist","")
          });
        }
      });
    }else{
      res.render("adminConsole",{
          body: new Body("Console","Nothing Was submited","")
      });
    }
  })

app.route(APP_DIRECTORY+"/adminConsole")
  .get(function(req,res){
    if(req.user){
      if(req.user.isAdmin){
        res.render("adminConsole", {
          body: new Body("Console", "",""),
          user: req.user,
        })
      }else{
        res.render("home", {
          body:new Body("Home","Admin Privilage is Required for Access",""),
          purchase: initialPurchase(),
          user: req.user
        })
      }
    }else{
      res.render("home", {
        body:new Body("Home","Unknown User",""),
        purchase: initialPurchase(),
        user: req.user
      })
    }
  })

app.route(APP_DIRECTORY+"/admin")
.post(function(req,res){
  if(req.user){
    if(req.user.isAdmin){
      let username = req.body.username;
      User.find({username:username},function(err,item){
    let user = item[0];

    User.updateOne({username:username},{isAdmin:true},function(e,r){
      if(!e){
        if(r.n > 0){
          res.render("adminConsole",{
              body: new Body("Console","","Successfully made " +username+ " an admin."),
              user:req.user,
          });
        }else{
          res.render("adminConsole",{
              body: new Body("Console","Role assignment failed",""),
              user:req.user,
          });
        }
      }else{
        console.log(e);
        res.render("adminConsole",{
            body: new Body("Console", e.message,""),
            user:req.user,
        });
      }
    });
  });
    }else{
      let err = new Error("Admin Privilages Required for this action");
      console.log(err);
      res.send(err.message);
    }
  }else{
    let err = new Error("Anonymous User");
    console.log(err);
    res.send(err.message);
  }

})




/************ Stripe Payment **************/
app.route(APP_DIRECTORY+"/payment")
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

app.post("/create-payment-intent", async function (req, res){
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

app.route(APP_DIRECTORY+"/orderPricings")
  .post(function (req,res){
  // console.log("Geting Pricings");
  // console.log(req.body);
  Style.findOne({baseStyle:req.body.style.baseStyle}, function(err,style){
    if(!err){
      if(style){
        for(option of style.options){
          if(option.name === req.body.style.option){
            // console.log(option);

            // console.log(dbPrice);
            // console.log(req.body);
            let deposit = (option.price * DEPOSITPERCENT) * 100;
            let t = tax(deposit);
            let total = t + deposit;
            res.send({deposit:deposit, tax:t, total:total});
            break;
          }
        }
      }else{
        res.send("Error: Could Not Find Seleced Style");
      }
    }else{
      res.send("Error: "+err);
    }
  });

})




/****************** Authentication *******************/
app.route(APP_DIRECTORY+"/login")
  .get(function(req, res) {
    if(req.isAuthenticated()){
      // console.log("Authenticated Request");
      res.redirect("/home")
    } else {
      // console.log("Unauthorized Access, Please Login");
      res.render("login", {
        body: new Body("Login", "", ""),
        login: null,
        user: req.user,
      });
    }
  })
  .post(function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    console.log(user);
    // console.log(info);
    if (err) { return next(err); }
    // Redirect if it fails
    if (!user) { return res.render('login',{body:new Body("Login",info.message,""), login:req.body.username }); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      // Redirect if it succeeds
      return res.redirect('/home');
    });
  })(req, res, next);
});

// app.get('/auth/google', passport.authenticate('google', {
//   // scope: ['profile']
//   scope: [
//         'https://www.googleapis.com/auth/userinfo.profile',
//         'https://www.googleapis.com/auth/userinfo.email'
//     ]
// }));


app.get('/auth/google', (req, res, next) => {
  // Detect host/protocol (for example, behind a proxy we might use x-forwarded-proto)
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host') + APP_DIRECTORY; // e.g. "localhost:3000" or "example.com"

  // Construct the callback URL dynamically:
  const callbackURL = `${protocol}://${host}/googleLoggedin`;
  console.log("Dynamic Call Back URL --> ", callbackURL);
  
  passport.authenticate('google', {
    scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ],
    callbackURL, // pass the dynamically built callback
  })(req, res, next);
});



app.get('/auth/facebook', (req, res, next) => {
  // Detect host/protocol (similar to your Google code).
  // If you're behind a proxy, consider x-forwarded-proto.
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host') + APP_DIRECTORY; // e.g. "example.com/myapp"

  // Construct the callback URL dynamically:
  const callbackURL = `${protocol}://${host}/facebookLoggedin`;
  console.log("Dynamic Call Back URL --> ", callbackURL);

  passport.authenticate('facebook', {
    scope: ['email'],
    callbackURL  // pass the dynamically built callback to Facebook
  })(req, res, next);
});


app.get('/facebookLoggedin', (req, res, next) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host') + APP_DIRECTORY;
  const callbackURL = `${protocol}://${host}/facebookLoggedin`;
  console.log("Handling Facebook callback at --> ", callbackURL);

  passport.authenticate('facebook', {
    callbackURL  // again, so Passport sets the redirect_uri parameter
  }, (err, user, info) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    if (!user) {
      console.log("No user returned");
      return res.redirect('/login');
    }
    // Log the user in
    req.logIn(user, function(loginErr) {
      if (loginErr) {
        return next(loginErr);
      }
      // Redirect if it succeeds
      return res.redirect('/home');
    });
  })(req, res, next);
});

app.route(APP_DIRECTORY+"/googleLoggedin")
    .get(function(req, res, next) {
      passport.authenticate('google', function(err, user, info) {
        if (err) { return next(err); }
        // Redirect if it fails
        if (!user) { return res.render('login', {
          body: new Body("Login", "", "Account Created successfully, Please log in again to continue"),
          login: null,
          user: req.user,
        } ); }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          // Redirect if it succeeds
          return res.redirect('/home');
        });
      })(req, res, next);
    });

app.route(APP_DIRECTORY+"/logout")
  .get(function(req, res) {
    req.logout();
    console.log("Logged Out");
    // res.redirect("/");
    res.render("home", {
      body: new Body("Home", "", ""),
      purchase:initialPurchase(),
      user:null,
    });
  });

app.route(APP_DIRECTORY+"/register")
  .get(function(req, res) {
    if(req.isAuthenticated()){
      // console.log("Authenticated Request");
      res.redirect("/home")
    } else {
      // console.log("Unauthorized Access, Please Login");
      res.render("register", {
        body: new Body("Register", "", ""),
        purchase: initialPurchase(),
        user: null,
      });
    }
  })
  .post(function(req,res){
    const user = new User({
      _id: req.body.username,
      username: req.body.username,
      phone: req.body.phone,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
      // DoB: new Date(req.body.DoB).toLocaleString(),
      photoURL: "",
      userHasPassword:true,
      verified:false,
    })
    let hahsPassword;
    bcrypt.hash(req.body.password, SALTROUNDS, function(err, hash) {
        if(!err){
          user.password = hash;
          // console.log(user);
          User.exists({_id:user._id},function(err,exists){
            if(exists){
              res.render("/register",{
                body:new Body("Register","User email aready exists",""),
                purchase: initialPurchase(),
                user: user,
              });
            }else{
              user.save(function(err,savedObj){
                // console.log(err);
                if(!err){
                  // console.log(savedObj);
                  res.redirect("/login");
                }else{

                }
              })
            }
          });
        }else{
          // console.log(user);
          // console.log(err);
          res.render("register",{
            body:new Body("Register","Unable to complete registration (error: e-PWD)",""),
            purchase: initialPurchase(),
            user: user,
          });
        }
    });

  })

app.route(APP_DIRECTORY+"/usernameExist")
    .post(function(req,res){
      // console.log("username to search ---> "+req.body.username);
      User.exists({_id:req.body.username}, function(err,exists){
        res.send(exists);
      })
    })

app.route(APP_DIRECTORY+"/deleteAccess")
  .get(function(req,res){
    let provider = req.params.provider;
    if(provider === provider){
      res.render("accessDeletion",{body:new Body("Delete Access","",""), user:req.user});
    }
  })
  .post(function(req,res){
    User.deleteOne({_id:req.user.username},function(err,deleted){
      console.log(err);
      console.log(deleted);
      res.redirect("/logout")
    })
  })




app.use((req, res, next) => {
  // If you're behind a proxy like Heroku or Nginx,
  // you may want to use x-forwarded-proto and trust proxy:
  // app.set('trust proxy', true);
  // const protocol = req.headers['x-forwarded-proto'] || req.protocol;

  const protocol = req.protocol;
  const host = req.get('host');       // e.g. "localhost:3000" or "example.com"
  const url = req.originalUrl;        // e.g. "/some/nonexistent/path"

  // Construct a troubleshooting message
  const debugMessage = `
    <h1>404 - Not Found</h1>
    <p>Sorry, we couldn't find the resource you requested.</p>
    <p><strong>Requested URL:</strong> ${protocol}://${host}${url}</p>
    <p><strong>Host (Domain):</strong> ${host}</p>
    <p><strong>Protocol:</strong> ${protocol}</p>
  `;

  // Respond with status 404 and the debug info
  res.status(404).send(debugMessage);
});




app.listen(PORT, function() {  
  console.log("Paris Hair and Beauty Studio is Live");
  console.log("PORT: "+ PORT);
});











/************** helper functions *******************/
function Body(title, error, message) {
  this.title = title;
  this.error = error;
  this.message = message;
  this.domain =  APP_DIRECTORY
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
function addExpiration(mins){
  let date = new Date();
  date.setMinutes(date.getMinutes() + mins);
  return date;
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
function compareAppts(a,b){
  let comparison = 0;
  if (a.date > b.date) {
    comparison = 1;
  } else if (a.date < b.date) {
    comparison = -1;
  }
  return comparison;
}
function compareApptsSevere(a,b){
  let comparison = 0;
  if (a.date.getTime() > b.date.getTime()) {
    comparison = 1;
  } else if (a.date.getTime() < b.date.getTime()) {
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
  let stopHrs;
  let stopMins;
  if(duration < 60){
    stopMins = Number(appt.startTime.mins) + duration;
    if(stopMins > 59){
      stopHrs =  Number(appt.startTime.hrs) + Math.floor(stopMins/60);
      stopMins = stopMins%60;
    }
    return {hrs:stopHrs, mins:stopMins}
  }else{
    stopHrs = Number(apptStartTime.hrs) + Math.floor((duration/60));
    stopMins = Number(apptStartTime.mins) + (duration%60);
    if(stopMins > 59){
      stopHrs =+ Math.floor(stopMins/60);
      stopMins = stopMins%60;
    }
    return {hrs:stopHrs, mins:stopMins}
  }
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
  from: MAILER,
  to: appt.clientUsername,
  subject: 'Booking Details for '+ new Date(appt.date).toLocaleDateString(),
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
