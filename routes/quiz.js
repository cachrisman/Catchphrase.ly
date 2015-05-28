var express = require('express'),
    db = require("../models"),
    router = express.Router();

router.get("/", function(req, res) {
    // req.flash('info', "This is a flash message");
    res.render('quiz', {
        flash: {
            info: req.flash('info')
        }
    });
});

module.exports = router;
