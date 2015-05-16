// REQUIREMENTS //
var express = require("express"),
    app = express(),
    path = require("path"),
    bodyParser = require("body-parser"),
    //require models.js that defines database schema and models
    db = require("./models");

// CONFIG //

//set variable 'port' (process.env.PORT is heroku's port variable)
app.set('port', (process.env.PORT || 5000));

// serve js & css files into a public folder
app.use(express.static(__dirname + '/public'));

// body parser config
app.use(bodyParser.urlencoded({
    extended: true
}));

// ROUTES //

// root path
app.get("/", function(req, res) {
    // render index.html
    res.sendFile(path.join(__dirname + '/public/views/index.html'));
});

app.get("/phrases", function(req, res) {
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

app.post("/phrases", function(req, res) {
    // phrases#create
    //parse new phrase from request body
    var newPhrase = req.body;
    //create new database record
    db.Phrases.create(newPhrase, function(err, phrase) {
        //on success, send 201 (created) and the created phrase
        res.status(201).send(phrase);
    });
});

app.post("/phrases/:_id", function(req, res) {
    // phrases#update
    //parse udpated phrase from request body
    var updatedPhrase = req.body;
    //find phrase to update by url request param _id and update with updated phrase
    db.Phrases.findByIdAndUpdate(req.params._id, updatedPhrase, function(err, phrase) {
        //on success send 201 (created) and the updated phrase
        res.status(201).send(phrase);
    });
});

app.delete("/phrases/:_id", function(req, res) {
    // phrases#delete
    //find phrase to delete by url request param _id and delete
    db.Phrases.findByIdAndRemove(req.params._id,
        function(err, phrase) {
            //on success send 204 (No content)
            res.sendStatus(204);
        });
});

// listen on port set at top
app.listen(app.get('port'), function() {});
