var mongoose = require("mongoose"),
    bcrypt = require("bcrypt");

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        required: true,
        index: {
            unique: true
        }
    },
    passwordDigest: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        default: ""
    },
    last_name: {
        type: String,
        default: ""
    },
    _deck_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deck'
    }]
});

var confirm = function(pswrd, pswrdCon) {
    return pswrd === pswrdCon;
};

userSchema.statics.createSecure = function(params, cb) {
    var isConfirmed;
    isConfirmed = confirm(params.password, params.password_confirmation);

    if (!isConfirmed) {
        return cb("Passwords Should Match", null);
    }

    var that = this;

    bcrypt.hash(params.password, 12, function(err, hash) {
        params.passwordDigest = hash;
        console.log(params);
        that.create(params, function(err, user) {
            if (user) cb(null, user);
            else {
                // console.log(err);
                cb("Signup failed", null);
            }
        });
    });
};

userSchema.statics.authenticate = function(params, cb) {
    this.findOne({
            email: params.email
        },
        function(err, user) {
            if (user) user.checkPswrd(params.password, cb);
            else cb("Login failed - no user found");
        });
};

userSchema.methods.checkPswrd = function(password, cb) {
    var user = this;
    bcrypt.compare(password,
        this.passwordDigest,
        function(err, isMatch) {
            if (isMatch) {
                cb(null, user);
            } else {
                cb("Login failed - password incorrect", null);
            }
        });
};


var User = mongoose.model("User", userSchema);

module.exports = User;
