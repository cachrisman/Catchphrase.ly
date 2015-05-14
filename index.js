// REQUIREMENTS //
var express = require("express"),
    app = express(),
    path = require("path"),
    _ = require("underscore"),
    bodyParser = require("body-parser"),
    fs = require('fs');

// CONFIG //

// serve js & css files into a public folder
app.use(express.static(__dirname + '/public'));

// body parser config
app.use(bodyParser.urlencoded({
    extended: true
}));

// DATA //

// pre-seeded phrases data
var phrases = JSON.parse(
    fs.readFileSync(
        path.join(__dirname + '/public/js/words.json'),
         'utf8')
    );

// ROUTES //

// root path
app.get("/", function(req, res) {
    // render index.html
    res.sendFile(path.join(__dirname + '/public/views/index.html'));
    // res.sendFile('/views/index.html');
});

// phrases index path
app.get("/phrases", function(req, res) {
    // render phrases index as JSON
    res.send(JSON.stringify(phrases));
});

app.post("/phrases", function(req, res) {
    // phrases#create
    // console.log("phrases#create route is being hit");
    // console.log(req.body);
    var newPhrase = req.body;
    newPhrase.id = phrases[phrases.length - 1].id + 1;
    phrases.push(newPhrase);
    // console.log(JSON.stringify(phrases, null, 4));
    fs.writeFile(path.join(__dirname + '/public/js/words.json'), JSON.stringify(phrases,null,4));
    res.send(newPhrase);
});

app.delete("/phrases/:id", function(req, res) {
    // phrases#delete
    // console.log(phrases[req.params.id]);
    // console.log(req.params.id);
    pos = phrases.map(function(e) {
      // console.log(e.id);
        return e.id;
    }).indexOf(parseInt(req.params.id));
    // console.log(id_arr);
    // console.log(typeof req.params.id);
    // pos = id_arr.indexOf(parseInt(req.params.id));
    // console.log(pos);
    // phrases.splice(pos, 1);
    var deleted_word = phrases.splice(pos, 1);
    fs.writeFile(path.join(__dirname + '/public/js/words.json'), JSON.stringify(phrases,null,4));
    res.send(deleted_word);
});

// listen on port 3000
app.listen(3000, function() {
    console.log("listening on port 3000!!!");
});
