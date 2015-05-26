var express = require('express'),
    router = express.Router();

router.use('/', require('./users'));
router.use('/decks', require('./decks'));
router.use('/phrases', require('./phrases'));

router.get("/", function(req, res) {
    // req.flash('info', "This is a flash message");
    res.render('home', {
        flash: {
            info: req.flash('info')
        }
    });
});

router.get('/about', function(req, res) {
    res.send('Learn about us');
});

module.exports = router;
