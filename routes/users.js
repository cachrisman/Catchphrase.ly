var express = require('express'),
    db = require("../models"),
    md5 = require('MD5'),
    router = express.Router();

router.use(function (req, res, next) {
    var userId = req.session.userId;
    db.User.
    findOne({
        _id: userId
    }, function(err, user) {
        res.locals.user = user;
        next();
    });
});

router.get("/signup", function(req, res) {
    res.render('signup', {
        flash: {
            danger: req.flash('error')
        }
    });
});

router.post("/users", function(req, res) {
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

router.get("/login", function(req, res) {
    res.render('login', {
        flash: {
            danger: req.flash('error')
        }
    });
});

router.post("/login", function(req, res) {
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

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

router.get("/profile", function(req, res) {
    req.currentUser(function(err, user) {
        if (user) {
            res.render('profile', {
                flash: {
                    success: req.flash('success')
                },
                user: user.email,
                userHash: md5(user.email.toLowerCase())
            });
        } else {
            req.flash('error', "Only logged in users can see their profile");
            res.redirect('/login');
        }
    });
});

module.exports = router;
