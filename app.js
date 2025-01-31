const SERVER = !(process.execPath.includes("C:"));//process.env.PORT;
if (!SERVER){
  // console.error(SERVER);
  require("dotenv").config();
}


/*********Handling Server / Local Enviromnemnt sensitive variables************/
const APP_DIRECTORY = !(SERVER) ? "" : ((process.env.APP_DIRECTORY) ? (process.env.APP_DIRECTORY) : "");
const PUBLIC_FOLDER = (SERVER) ? "./" : "../";

const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
// const https = require("https");
// const mongoose = require("mongoose");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.route("/home")
  .get(function(req, res) {
    res.render("home", {
      body: new Body("Home", "", "")
    });
  });

app.route("/cart")
  .get(function(req, res) {
    res.render("cart", {
      body: new Body("Cart", "", "")
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
      body: new Body("Bookt", "", "")
    });
  });

app.route("/")
  .get(function(req, res) {
    res.render("cover");
  });





app.listen(process.env.PORT || 4000, function() {
  console.log("Paris Hair and Beauty Studio is Live");
});


/************** functionalities *******************/
function Body(title, error, message) {
  this.title = title;
  this.error = error;
  this.message = message;
}
