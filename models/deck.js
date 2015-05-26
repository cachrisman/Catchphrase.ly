var mongoose = require("mongoose");

var deckSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    _user_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});
//define Phrases as a mongoose model using phrase schema
var Deck = mongoose.model("Deck", deckSchema);

module.exports = Deck;
