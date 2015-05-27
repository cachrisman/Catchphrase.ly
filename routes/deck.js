var express = require('express'),
    db = require("../models"),
    router = express.Router();

router.get("/", function(req, res) {
    // req.flash('info', "This is a flash message");
    res.render('decks', {
        flash: {
            info: req.flash('info')
        }
    });
});

router.get("/json", function(req, res) {
    // decks#get
    db.Deck.find({ $or:[ {_users:req.session.userId}, {isPrivate:false} ]}, null, {
            sort: {
                'name': 'asc'
            }
        },
        function(err, decks) {
            //upon completion of find, send status 200 and decks as stringified JSON data
            res.status(200).send(JSON.stringify(decks));
        });
});

router.post("/", function(req, res) {
    // decks#create
    //parse new deck from request body
    var newDeck = req.body;
    // add user id to new deck
    newDeck._users = [req.session.userId];
    console.log(newDeck);
    //create new database record
    db.Deck.create(newDeck, function(err, deck) {
        if (err) console.log(err);
        //on success, send 201 (created) and the created deck
        else {
            req.currentUser._decks = [deck];
            db.User.findByIdAndUpdate(req.currentUser.id, req.currentUser, function(err, user){if (err) console.log(err); else console.log(user);});
            res.status(201).send(deck);
        }
    });
});

router.put("/:deck_id", function(req, res) {
    // decks#update
    //parse udpated deck from request body
    var updatedDeck = req.body;
    //find deck to update by url request param _id and update with updated deck
    db.Deck.findByIdAndUpdate(req.params.deck_id, updatedDeck, function(err, deck) {
        //on success send 201 (created) and the updated deck
        res.status(201).send(deck);
    });
});

router.delete("/:deck_id", function(req, res) {
    // decks#delete
    //find deck to delete by url request param _id and delete
    db.Deck.findByIdAndRemove(req.params.deck_id,
        function(err, deck) {
            //on success send 204 (No content)
            res.sendStatus(204);
        });
});

router.get("/:deck_id/phrases", function(req, res) {
    //parse udpated deck from request body
        db.Phrase.find({_decks: req.params.deck_id}, null, {
            sort: {
                'word': 'asc'
            }
        },
        function(err, phrases) {
            //upon completion of find, send status 200 and phrases as stringified JSON data
            res.status(200).send(JSON.stringify(phrases));
        });
});

router.get("/json", function(req, res) {
    // phrases#get
    //find all records from database, sort by word ascending

});

module.exports = router;
