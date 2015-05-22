// REQUIREMENTS //
var express = require("express"),
    app = express(),
    path = require("path"),
    bodyParser = require("body-parser"),
    flash = require('connect-flash'),
    session = require("express-session"),
    views = path.join(__dirname, "views"),
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

// root path
app.get("/", function(req, res) {
    req.flash('info', "This is a flash message");
    res.render('home', {
        flash: {
            info: req.flash('info')
        }
    });
});

app.get("/signup", function(req, res) {
    res.render('signup', {
        flash: {
            danger: req.flash('error')
        }
    });
});

app.post("/users", function(req, res) {
    var newUser = req.body.user;
    db.User.
    createSecure(newUser, function(err, user) {
        if (user) {
            req.login(user);
            req.flash('success', "User " + user.email + " successfully registered");
            res.redirect("/profile"); // redirect to user profile
        } else {
            req.flash('error', err);
            res.redirect('/signup');
        }
    });
});

app.get("/login", function(req, res) {
    res.render('login', {
        flash: {
            danger: req.flash('error')
        }
    });
});

app.post("/login", function(req, res) {
    var user = req.body.user;

    db.User.authenticate(user,
        function(err, user) {
            if (!err) {
                req.login(user);
                req.flash('success', "User " + user.email + " successfully logged in");
                res.redirect("/profile"); // redirect to user profile
            } else {
                req.flash('error', err);
                res.redirect('/login');
            }
        });
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.get("/phrases", function(req, res) {
    // req.flash('info', "This is a flash message");
    res.render('phrases', {
        flash: {
            info: req.flash('info')
        }
    });
});

app.get("/phrases.json", function(req, res) {
    // phrases#get
    //find all records from database, sort by word ascending
    db.Phrases.find({}, null, {
            sort: {
                'word': 'asc'
            }
        },
        function(err, phrases) {
            //upon completion of find, send status 200 and phrases as stringified JSON data
            res.status(200).send(JSON.stringify(phrases));
        });
});

app.post("/phrases", function(req, res) {
    // phrases#create
    //parse new phrase from request body
    var newPhrase = req.body;
    //create new database record
    db.Phrases.create(newPhrase, function(err, phrase) {
        //on success, send 201 (created) and the created phrase
        res.status(201).send(phrase);
    });
});

app.post("/phrases/:_id", function(req, res) {
    // phrases#update
    //parse udpated phrase from request body
    var updatedPhrase = req.body;
    //find phrase to update by url request param _id and update with updated phrase
    db.Phrases.findByIdAndUpdate(req.params._id, updatedPhrase, function(err, phrase) {
        //on success send 201 (created) and the updated phrase
        res.status(201).send(phrase);
    });
});

app.delete("/phrases/:_id", function(req, res) {
    // phrases#delete
    //find phrase to delete by url request param _id and delete
    db.Phrases.findByIdAndRemove(req.params._id,
        function(err, phrase) {
            //on success send 204 (No content)
            res.sendStatus(204);
        });
});

// listen on port set at top
app.listen(app.get('port'), function() {});
