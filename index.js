// REQUIREMENTS //
var express = require("express"),
    app = express(),
    path = require("path"),
    bodyParser = require("body-parser"),
    flash = require('connect-flash'),
    session = require("express-session"),
    morgan = require('morgan'),
    //require models.js that defines database schema and models
    db = require("./models");

// CONFIG //

//set variable 'port' (process.env.PORT is heroku's port variable)
app.set('port', (process.env.PORT || 5000));

// session config
app.use(session({
    secret: "SUPER STUFF",
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

// app.use(morgan('dev'));

// serve js & css files into a public folder
app.use(express.static("bower_components"));
app.use(express.static("public"));

var loginHelpers = function(req, res, next) {

    req.login = function(user) {
        req.session.userId = user._id;
        req.user = user;
        return user;
    };

    req.logout = function() {
        req.session.userId = null;
        req.user = null;
    };

    req.currentUser = function(cb) {
        var userId = req.session.userId;
        db.User.
        findOne({
            _id: userId
        }, cb);
    };

    // careful to have this
    next(); // real important
};

app.use(loginHelpers);

// ROUTES //
var routes = require('./routes');
app.use('/',routes);

// listen on port set at top
app.listen(app.get('port'), function() {
    console.log("Server running on port:", app.get('port'));
});
