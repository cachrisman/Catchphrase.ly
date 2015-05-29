function compare(a, b) {
    return a.word.toLowerCase() === b.word.toLowerCase() ? 0 : a.word.toLowerCase() < b.word.toLowerCase() ? -1 : 1;
}

// on page load
$(function() {
    // variable to store ajax data
    var quiz = new Quiz();
    // get and render the phrases
    quiz.list();

    View.init(quiz);
});

// // // // // // //

// VIEW OBJECT
function View() {}

View.cache = {};

View.render = function(items, parentId, templateFile) {
    var template;
    // get template file
    if (View.cache[templateFile]) {
        // render a template
        template = _.template(View.cache[templateFile]);
        // input data into template and append to parent
        $("#" + parentId).html(template({
            collection: items
        }));
    } else {
        $.get(templateFile).done(function(data) {
            View.cache[this.url] = data;
            // render a template
            template = _.template(data);
            // input data into template and append to parent
            $("#" + parentId).html(template({
                collection: items
            }));
        });
    }
};

View.init = function(quiz) {
    //event listener for add form
    $('#quiz-form').on("submit", $.proxy(quiz.run, quiz));
    $('#deck-list').on("click", "li.deck-list a", $.proxy(quiz.deck.getPhrases, quiz.deck));
    $('#modal').on('hide.bs.modal', function(e) {
        console.log("modal closed", quiz);
        View.reset(quiz);
    });
};

View.reset = function(quiz) {
    quiz.reset();
    $('#quiz-form').off();
    $('#deck-list').off();

    $('#currentIndex').text("");
    $('#word').text("");
    $('#definition').text("");

    $('#quiz-form').on("submit", $.proxy(quiz.run, quiz));
    $('#deck-list').on("click", "li.deck-list a", $.proxy(quiz.deck.getPhrases, quiz.deck));
};

View.toggle = function(element) {
    if ($(element).attr('disabled') === "disabled") {
        $(element).removeAttr('disabled');
    } else {
        $(element).attr('disabled', 'disabled');
    }
};

function Quiz() {
    this.deck = new Deck();
    this.decks = {};
    this.repeat = false;
    this.type = "review";
}

Quiz.prototype.list = function() {
    //AJAX GET request
    var that = this;
    $.get("/decks/json", function(res) {
        // parse the response
        that.decks = [];
        that.decks = JSON.parse(res);
        // render the results
    }).done(function(res) {
        //when GET request completes, reset View and re-init View
        View.render(that.decks, "deck-list", "/template/deck-list-template.html");
        // View.reset(that);
        // View.init(that);
    });
};

Quiz.prototype.run = function(event) {
    event.preventDefault();
    var quizOptions = $('#quiz-form').serializeArray();
    this.repeat = quizOptions.filter(function(v) {
        return v.name === 'repeat';
    })[0].value;
    this.repeat = this.repeat === 'yes' ? true : false;
    this.type = quizOptions.filter(function(v) {
        return v.name === 'type';
    })[0].value;
    $('#quiz-title').html(this.type);
    $('#total').text(this.deck.length());
    $('#modal').modal();

    if (this.type === "review") {
        // run the review quiz
        console.log("review quiz");
        this.deck.unviewed = this.deck.phrases.slice();
        this.deck.updateCard(null, true);
        $('#next').on("click", $.proxy(this.deck.updateCard, this.deck));
        $('#previous').on("click", $.proxy(this.deck.updateCard, this.deck));
        $('#review-buttons').show();
    } else if (this.type === "self-graded") {
        // run the self-graded quiz
        console.log("self-graded quiz");
        this.deck.unviewed = this.deck.phrases.slice();
        this.deck.updateCard(null, true);
        $('#incorrect').on("click", $.proxy(this.deck.updateCard, this.deck));
        $('#correct').on("click", $.proxy(this.deck.updateCard, this.deck));
        $('#self-graded').show();
    } else if (this.type === "multiple-choice") {
        // run the multiple choice quiz
    }
};

Quiz.prototype.reset = function() {
    $('#next').off();
    $('#previous').off();
    this.deck = new Deck();
    this.decks = {};
    this.repeat = false;
    this.type = "review";
};

function Deck() {
    this.id = "";
    this.phrases = [];
    this.unviewed = [];
    this.viewed = [];
    this.correct = [];
    this.incorrect = [];
    this.index = 0;
}

//return number of cards in deck
Deck.prototype.length = function() {
    return this.phrases.length;
};


//update index to next card
Deck.prototype.next = function(isInitial) {
    var card;
    if (isInitial) {
        card = this.pickCard();
        $('#word').text(card.word);
        $('#definition').text(card.definition);
        this.viewed.push(card);
        console.log(this.index, "initial", card.word, card.definition);
    } else if (this.index !== this.length - 1) {
        this.index++;
        var isNewCard = this.index === this.viewed.length;
        card = (isNewCard) ? this.pickCard() : this.viewed[this.index];
        $('#word').text(card.word);
        $('#definition').text(card.definition);
        if (isNewCard) this.viewed.push(card);
        if (this.index === 1) View.toggle('#previous');
        if (this.index === this.length() - 1) View.toggle('#next');
        console.log(this.index, this.length(), "next", card.word, card.definition);
    } else {}
};

//update index to previous card
Deck.prototype.prev = function() {
    var card;
    if (this.index > 0) {
        if (this.index === this.length() - 1) View.toggle('#next');
        this.index--;
        card = this.viewed[this.index];
        $('#word').text(card.word);
        $('#definition').text(card.definition);
        console.log(this.index, this.length(), "previous", card.word, card.definition);
        if (this.index === 0) View.toggle('#previous');
    }
};

Deck.prototype._correct = function() {
    console.log('correct');
    $('#self-graded').hide();
    $('#correct-buttons').show();
    var score;
    that = this;
    $('#correct-buttons').one("click", function(e){
        score = e.target.dataset.score;
        console.log(score);
        $('#correct-buttons').hide();
        $('#self-graded').show();
        that.index++;
        card = that.pickCard();
        $('#word').text(card.word);
        $('#definition').text(card.definition);
        that.correct.push(card);
    });
};

Deck.prototype._incorrect = function() {
    console.log('incorrect');
    $('#self-graded').hide();
    $('#incorrect-buttons').show();
    var score;
    that = this;
    $('#incorrect-buttons').one("click", function(e){
        score = e.target.dataset.score;
        console.log(score);
        $('#incorrect-buttons').hide();
        $('#self-graded').show();
        that.index++;
        card = that.pickCard();
        $('#word').text(card.word);
        $('#definition').text(card.definition);
        that.incorrect.push(card);
    });

};

Deck.prototype.pickCard = function() {
    var length = this.unviewed.length;
    var index = Math.random() * length | 0;
    return this.unviewed.splice(index, 1)[0];
};

Deck.prototype.updateCard = function(event, isInitial) {
    var action = isInitial ? "next" : event.target.id;
    if (action === "next") this.next(isInitial);
    else if (action === "previous") this.prev();
    else if (action === "correct") this._correct();
    else if (action === "incorrect") this._incorrect();
    console.log(action, this.viewed.length);
    $('#currentIndex').text(this.index + 1);
};

Deck.prototype.getPhrases = function(event, deck_id) {
    //AJAX GET request
    var url;
    $(event.target).parents(".btn-group").find('.btn').html($(event.target).text() + '<span class="pull-right caret" style="margin-top: 8px;"></span>');
    this.id = event.target.parentElement.dataset.id;
    if (this.id) url = "/decks/" + this.id;
    else url = "/phrases/json";
    var that = this;
    $.get(url, function(res) {
        // parse the response
        if (url === '/phrases/json') {
            that.phrases = JSON.parse(res);
            that.name = "All Phrases";
        } else {
            tempdeck = JSON.parse(res);
            // console.log(tempdeck);
            that.phrases = tempdeck._phrases;
            that.name = tempdeck.name;
        }
        // render the results
    }).done(function(res) {
        //when GET request completes, reset View and re-init View
        // console.log(that.deck);
        $('#deckname').text(that.name);
        $('#number-of-cards').text(that.phrases.length);
        $('#deck_id').val(that._id);
    });
};

// Deck.prototype.reset = function() {
//     this.id = "";
//     this.name = "";
//     this.phrases = [];
//     this.unviewed = [];
//     this.viewed = [];
//     this.index = 0;
// };
