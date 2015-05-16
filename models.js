var mongoose = require("mongoose");
//define database connection uristring for use with heroku
var uristring = process.env.PROD_MONGODB || 'mongodb://localhost/catchphrasely_app';
mongoose.connect(uristring);

//define database phrase schema
var phraseSchema = new mongoose.Schema({
  word: {
    type: String,
    default: ""
  },
  definition: {
    type: String,
    default: ""
  }
});
//define Phrases as a mongoose model using phrase schema
var Phrases = mongoose.model("Phrases", phraseSchema);
//pass Phrases to export so index.js can access
module.exports.Phrases = Phrases;
