require("dotenv").config();
const PASSWORD = process.env.PASSWORD;

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
  name: String,
  photoURL:String,
  appointments: [String], // and array of appointment ID's

});

const Stylist = mongoose.model("Stylist", stylistSchema);




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
      if(foundOBJ){
        res.send(foundOBJ);
      }
    })
  })

  app.route("/stylists")
    .get(function(req, res) {
      Stylist.find({}, function(err, foundOBJ) {
        // console.log(foundOBJ);
        if(foundOBJ){
          res.send(foundOBJ);
        }
      })
    })
    .post(function(req,res){
      const stylist = new Stylist({
        name: "Avis",
        photoURL:"https://lh3.googleusercontent.com/-3biAz13t9EA/Xc2ZBrgL4XI/AAAAAAAACfw/NYsnpIKzfBcU3cryHfmDrSXt5np5OqqqQCEwYBhgLKtQDAL1OcqxlfPshAeKxbMyutm8vJ4y3nqxfPM5PCHgxyG1CjVMyj_r08Be4k5jFkk0-lPhJq9iKZba0i3S6zQIDYlTLHmZXt-02ixvkgP8MwE5XT0-c7t_s1TkSEyeuTzQBr8G0pT6XixkQmZv0ZB69bUJV6eH4pmT_u2LbUJe9duvoA8YXdxV6Ly3m9WXy7AgP_S0lfkPuTVr6thiBcfNElUyUUYJlzi1JtyRGdCFA_LSZn7UnNgYh82JuJe0pklResLBvSc7aCq42jt481KABPp8uzbkXmcK2hUGyNkw71FKuOptme3Axb_Dm9bov6Xp2WFjr-GhnZIue-Kgo5qbNM93khCkrjt58UJSFIMkaVfx67sEDZreUIQaKGF-Ms5VUwDynF3KNDjsWZThnCdW-yOcIwgg7b_NYEYJo7bnzmyhNdFW6P_Zm7hwkmD6nBQtaVX6Z1pxsvehFnCIaNBUlweDpPznYv974yXERmf3r0Jcf5fnwcQqyemtv4rENzG-lTXpgOh6kkityosOwojIeCrcvzaLoTSogVzbLq2VXp0Y8f8lw0nQklcLjSJ0BSU8BJnhlm5XTCWt7rgBhAUyaNi94jR7nIqeyJSUncqnJHKEYWVnJMK3cgoEG/w138-h140-p/2019-11-14.png",
        appointments: ["44444444aaaaa"], // and array of appointment ID's

      })

      stylist.save(function(err, savedDoc){
        if(!err){
          console.log("Successfully Saved Document");
        }
      })
    })



app.route("/")
  .get(function(req, res) {
    res.render("cover");
  });





app.listen(process.env.PORT || 3000, function() {
  console.log("Paris Hair and Beauty Studio is Live");
});


/************** functionalities *******************/
function Body(title, error, message) {
  this.title = title;
  this.error = error;
  this.message = message;
}
