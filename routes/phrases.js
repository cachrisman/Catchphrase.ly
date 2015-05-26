var express = require('express'),
    db = require("../models"),
    router = express.Router();

router.get("/", function(req, res) {
    // req.flash('info', "This is a flash message");
    res.render('phrases', {
        flash: {
            info: req.flash('info')
        }
    });
});

router.get("/json", function(req, res) {
    // phrases#get
    //find all records from database, sort by word ascending
    db.Phrases.find({}, null, {
            sort: {
                'word': 'asc'
            }
        },
        function(err, phrases) {
            //upon completion of find, send status 200 and phrases as stringified JSON data
            res.status(200).send(JSON.stringify(phrases));
        });
});

router.post("/", function(req, res) {
    // phrases#create
    //parse new phrase from request body
    var newPhrase = req.body;
    //create new database record
    db.Phrases.create(newPhrase, function(err, phrase) {
        //on success, send 201 (created) and the created phrase
        res.status(201).send(phrase);
    });
});

router.post("/:phrase_id", function(req, res) {
    // phrases#update
    //parse udpated phrase from request body
    var updatedPhrase = req.body;
    //find phrase to update by url request param _id and update with updated phrase
    db.Phrases.findByIdAndUpdate(req.params.phrase_id, updatedPhrase, function(err, phrase) {
        //on success send 201 (created) and the updated phrase
        res.status(201).send(phrase);
    });
});

router.delete("/:phrase_id", function(req, res) {
    // phrases#delete
    //find phrase to delete by url request param _id and delete
    db.Phrases.findByIdAndRemove(req.params.phrase_id,
        function(err, phrase) {
            //on success send 204 (No content)
            res.sendStatus(204);
        });
});

module.exports = router;
