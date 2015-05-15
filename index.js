// REQUIREMENTS //
var express = require("express"),
    app = express(),
    path = require("path"),
    bodyParser = require("body-parser"),
    db = require("./models");
// fs = require('fs');

// CONFIG //

// serve js & css files into a public folder
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// body parser config
app.use(bodyParser.urlencoded({
    extended: true
}));

// DATA //

// pre-seeded phrases data
// var jsonFile = __dirname + '/public/js/words.json';
// var phrases = JSON.parse(
//     fs.readFileSync(
//         path.join(jsonFile),
//         'utf8')
// );

// ROUTES //

// root path
app.get("/", function(req, res) {
    // render index.html
    res.sendFile(path.join(__dirname + '/public/views/index.html'));
});

// phrases index path
app.get("/phrases", function(req, res) {
    // render phrases index as JSON
    // res.send(JSON.stringify(phrases));
    db.Phrases.find({}, null, {sort: {'word': 'asc'}},
        function(err, phrases) {
            // console.log(todos);
            res.send(JSON.stringify(phrases));
        });
});

app.post("/phrases", function(req, res) {
    // phrases#create
    // console.log("phrases#create route is being hit");
    // console.log(req.body);
    var newPhrase = req.body;
    // newPhrase.id = phrases[phrases.length - 1].id + 1;
    // phrases.push(newPhrase);
    // // console.log(JSON.stringify(phrases, null, 4));
    // fs.writeFile(path.join(jsonFile), JSON.stringify(phrases, null, 4));
    // res.send(newPhrase);
    db.Phrases.create(newPhrase, function(err, phrase) {
        // console.log("phrase#create", phrase);
        res.send(phrase);
    });
});

app.post("/phrases/:_id", function(req, res) {
    var updatedPhrase = req.body;
    // updatedPhrase._id = req.params._id;
    // updatedPhrase.id = parseInt(req.params.id);
    // var idx = phrases.map(function(e) {
    //     return e.id;
    // }).indexOf(parseInt(req.params.id));
    // console.log(updatedPhrase);
    // console.log(phrases[idx]);
    // phrases[idx] = updatedPhrase;
    // fs.writeFile(path.join(jsonFile), JSON.stringify(phrases, null, 4));
    // res.send(updatedPhrase);
    db.Phrases.findByIdAndUpdate(req.params._id, updatedPhrase, function(err, phrase) {
        // console.log("phrase#update", phrase);
        res.send(phrase);
    });
});

app.delete("/phrases/:_id", function(req, res) {
    // phrases#delete
    // console.log(phrases[req.params.id]);
    // console.log("phrases#delete", req.params._id);
    // var idx = phrases.map(function(e) {
    //     // console.log(e.id);
    //     return e.id;
    // }).indexOf(parseInt(req.params.id));
    // // console.log(id_arr);
    // // console.log(typeof req.params.id);
    // // idx = id_arr.indexOf(parseInt(req.params.id));
    // // console.log(idx);;
    // // phrases.splice(idx, 1);
    // var deleted_word = phrases.splice(idx, 1);
    // fs.writeFile(path.join(jsonFile), JSON.stringify(phrases, null, 4));
    // res.send(deleted_word);
    db.Phrases.findByIdAndRemove(req.params._id,
        function(err, phrase) {
            // console.log("phrases#delete: ", phrase);
            res.sendStatus(204);
        });
});

// listen on port 3000
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
