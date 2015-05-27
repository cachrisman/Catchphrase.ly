var mongoose = require("mongoose");

var phraseSchema = new mongoose.Schema({
    word: {
        type: String,
        default: ""
    },
    weights: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deck',
        weight: Number
    }],
    definition: {
        type: String,
        default: ""
    },
    _decks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deck'
    }]
});
//define Phrases as a mongoose model using phrase schema
var Phrase = mongoose.model("Phrase", phraseSchema);

module.exports = Phrase;
