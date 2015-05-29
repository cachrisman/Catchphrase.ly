var mongoose = require("mongoose");
//define database connection uristring for use with heroku
var uristring = process.env.PROD_MONGODB || process.env.DEV_MONGODB;
mongoose.connect(uristring);

//pass Phrases to export so index.js can access
module.exports.mongoose = mongoose;
module.exports.Phrase = require("./phrase");
module.exports.Deck = require("./deck");
module.exports.User = require("./user");
