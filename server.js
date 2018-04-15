﻿var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    User = require("./models/mongodb"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")
    mongodserver = require('mongod');
    config = require("./config.json")
    path = require("path");

var app = express();

process.title = "BungeeCP";

(function () {
    var childProcess = require("child_process");
    var oldSpawn = childProcess.spawn;
    function mySpawn() {
        console.log('spawn called');
        console.log(arguments);
        var result = oldSpawn.apply(this, arguments);
        return result;
    }
    childProcess.spawn = mySpawn;
})();

const mongod = new mongodserver({
    port: config.dbport,
    bin: config.mongodb,
    dbpath: path.join(__dirname, "/database")
});

mongod.open((err) => {
    if (err === null) {
        mongoose.connect("mongodb://"+config.IP+":"+config.dbport+"/"+config.dbname, { useMongoClient: true });
    }
});



app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: config.secret,
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');
//
app.use(passport.initialize());
app.use(passport.session());
// 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function (req, res) {
    res.render("home");
});

app.get("/secret", isLoggedIn, function (req, res) {
    res.render("secret");
});

// Auth Routes

app.get("/register", function (req, res) {
    res.render("register");
});
//handling user sign up
app.post("/register", function (req, res) {
    User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render('register');
        } //user stragety
        passport.authenticate("local")(req, res, function () {
            res.redirect("/secret"); //once the user sign up
        });
    });
});

// Login Routes

app.get("/login", function (req, res) {
    res.render("login");
})

// middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function (req, res) {
    res.send("User is " + req.user.id);
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(process.env.PORT || config.port, process.env.IP || config.IP, function () {
    console.log("BungeeCP Running.");
});