var mongoose = require("mongoose");
//define database connection uristring for use with heroku
var uristring = process.env.PROD_MONGODB || 'mongodb://localhost/catchphrasely_app';
mongoose.connect(uristring);

//pass Phrases to export so index.js can access
module.exports.Phrases = require("./phrase");
module.exports.Deck = require("./deck");
module.exports.User = require("./user");
