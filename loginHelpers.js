db = require("./models");

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

module.exports = loginHelpers;
