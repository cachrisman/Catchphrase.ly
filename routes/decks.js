var express = require('express'),
    db = require("../models"),
    router = express.Router();

router.get("/", function(req, res) {
    res.render('decks', {
        flash: {
            info: req.flash('info')
        }
    });
});

router.get("/json", function(req, res) {
    // decks#get
    db.Decks.find({}, null, {
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
    //create new database record
    db.Decks.create(newDeck, function(err, deck) {
        //on success, send 201 (created) and the created deck
        res.status(201).send(deck);
    });
});

router.post("/:deck_id", function(req, res) {
    // decks#update
    //parse udpated deck from request body
    var updatedDeck = req.body;
    //find deck to update by url request param _id and update with updated deck
    db.Decks.findByIdAndUpdate(req.params.deck_id, updatedDeck, function(err, deck) {
        //on success send 201 (created) and the updated deck
        res.status(201).send(deck);
    });
});

router.delete("/:deck_id", function(req, res) {
    // decks#delete
    //find deck to delete by url request param _id and delete
    db.Decks.findByIdAndRemove(req.params.deck_id,
        function(err, deck) {
            //on success send 204 (No content)
            res.sendStatus(204);
        });
});

module.exports = router;
