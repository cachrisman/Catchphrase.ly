var mongoose = require("mongoose");
var uristring = process.env.PROD_MONGODB || 'mongodb://localhost/catchphrasely_app';
console.log(uristring);
mongoose.connect(uristring);

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

var Phrases = mongoose.model("Phrases", phraseSchema);

module.exports.Phrases = Phrases;
