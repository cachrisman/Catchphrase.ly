// REQUIREMENTS //
var express = require("express"),
    app = express(),
    path = require("path"),
    bodyParser = require("body-parser"),
    flash = require('connect-flash'),
    session = require("express-session"),
    MongoStore = require('connect-mongo')(session),
    morgan = require('morgan'),
    //require models.js that defines database schema and models
    db = require("./models");

// CONFIG //

// session config
app.use(session({
    secret: process.env.SECRET,
    store: new MongoStore({mongooseConnection:db.mongoose.connection}),
    resave: false,
    saveUninitialized: true
}));

// body parser config
app.use(bodyParser.urlencoded({
    extended: true
}));

// connect-flash config
app.use(flash());

// set view engine to ejs
app.set('view engine', 'ejs');

// this enables logging of requests to console
app.use(morgan('dev'));

// serve js & css files into a public folder
app.use(express.static("bower_components"));
app.use(express.static("public"));

// encapsulate loginHelpers in external file
app.use(require('./loginHelpers'));
// app.use(db.User.loginHelpers);

// ROUTES //
app.use('/', require('./routes'));

// listen on port set at top
app.listen((process.env.PORT || 5000), function() {
    console.log("Server running on port:", (process.env.PORT || 5000));
});
