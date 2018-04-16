var express = require("express"),
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

app.use('/css', express.static(path.join(__dirname, "views", "css")));
app.use('/js', express.static(path.join(__dirname, "views", "js")));
app.use('/img', express.static(path.join(__dirname, "views", "img")));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function (req, res) {
    res.render("login");
});

app.get("/dashboard", authenticated, function (req, res) {
    res.render("dashboard");
});

// Auth Routes

app.get("/register", function (req, res) {
    res.render("register");
});
//handling user sign up
app.post("/register", function (req, res) {
    User.register(new User({ username: req.body.username, email: req.body.email }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render('register');
        } //user stragety
        passport.authenticate("local")(req, res, function () {
            res.redirect("/dashboard");
        });
    });
});

// Login Routes

app.get("/login", function (req, res) {
    res.render("login");
})

// middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login"
}), function (req, res) {
    res.send("User is " + req.user.id);
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});


function authenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(process.env.PORT || config.port, process.env.IP || config.IP, function () {
    console.log("BungeeCP Running.");
});