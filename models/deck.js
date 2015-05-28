var mongoose = require("mongoose");

var deckSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    _users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    _phrases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Phrase'
    }]
});
//define Phrases as a mongoose model using deck schema
var Deck = mongoose.model("Deck", deckSchema);

module.exports = Deck;
