function compare(a,b) {
  return a.word.toLowerCase() === b.word.toLowerCase() ? 0 : a.word.toLowerCase() < b.word.toLowerCase() ? -1 : 1;
}

// on page load
$(function() {
    // variable to store ajax data
    var quiz = new Quiz();
    // get and render the phrases
    View.init();
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
    } else if (templateFile.charAt(0) === '/') {
        $.get(templateFile).done(function(data) {
            View.cache[this.url] = data;
            // render a template
            template = _.template(data);
            // input data into template and append to parent
            $("#" + parentId).html(template({
                collection: items
            }));
        });
    }  else {
        template = _.template(templateFile);
        // input data into template and append to parent
        $("#" + parentId).html(template({
            collection: items
        }));
    }
};

View.init = function(page) {
    //event listener for add form
    $('#quiz-form').on("submit", $.proxy(quiz.start, page));
};

View.reset = function(page) {
    //turns off event listener for update popup form
    $('#update-form').off();
    $('#'+page.path+'-ul').off();
};

function Quiz() {
    this.content = {};
    this.path = window.location.href.split('/')[3].toLowerCase().replace('#','');
}

function Phrases() {}

Phrases.prototype.all = function() {
    //AJAX GET request
    var url = "/phrases/json";
    var that = this;
    $.get(url, function(res) {
        // parse the response
        that.content = JSON.parse(res);
        // render the results
    }).done(function(res) {
        //when GET request completes, reset View and re-init View
        View.render(that.content, that.path + "-ul", "/template/" + that.path + "-template.html");
        View.reset(that);
        View.init(that);
    });

};


function Deck() {}

Deck.prototype.list = function(deck_id) {
    //AJAX GET request
    var url = "/decks/" + deck_id;
    var that = this;
    $.get(url).done(function(res) {
        //when GET request completes, reset View and re-init View
        View.render(JSON.parse(res), "deck-list", "/template/deck-list-template.html");
        View.reset(that);
        View.init(that);
    });

};

Page.prototype.add = function(event) {
    //prevent page reload on add phrase form submission
    event.preventDefault();
    //AJAX POST of new phrase from add phrase form
    var that = this;
    $.post("/" + this.path, $(event.target).serialize())
        // when POST request is completed, update Phrases and clear add phrase form
        .done(function(res) {
            that.all();
            $('#add-form')[0].reset();
        });
};

Page.prototype.show_edit = function(event) {
    console.log("show_edit");
    //get id of phrase that was clicked
    id = $(event.target).parent().data().id;
    //find index of item in phrases array
    var idx = this.content.map(function(e) {
        return e._id;
    }).indexOf(id);
    //fill in update phrase popup form input fields with data from phrases
    if ($('#word').length) $('#word').val(this.content[idx].word);
    if ($('#definition').length) $('#definition').val(this.content[idx].definition);
    if ($('#deck-name').length) $('#deck-name').val(this.content[idx].name);
    if ($('#isPrivate').length) $('#isPrivate').prop('checked', this.content[idx].isPrivate);
    $('#id').data().id = id;
    // populate phrase list on deck edit form
    if (this.path === 'decks') {
        var that = this;
        $.when($.get("/decks/" + id + "/phrases"), $.get("/phrases/json"))
        .done(function(a, b){
            that.content.phrases_in_deck = JSON.parse(a[2].responseText);
            that.content.phrases_in_deck.sort(compare);
            View.render(that.content.phrases_in_deck, "phrases_in_deck", "/template/deck-phrases-template.html");

            that.content.available_phrases = JSON.parse(b[2].responseText);
            that.content.available_phrases.sort(compare);

            for (var i = 0, len = that.content.phrases_in_deck.length; i < len; i++) {
                for (var j = 0, len2 = that.content.available_phrases.length; j < len2; j++) {
                    if (that.content.phrases_in_deck[i]._id === that.content.available_phrases[j]._id) {
                        that.content.available_phrases.splice(j, 1);
                        len2=that.content.available_phrases.length;
                    }
                }
            }
            View.render(that.content.available_phrases, "available_phrases", "/template/deck-phrases-template.html");

            $('#available_phrases').on("click", "li", $.proxy(that.move, that));
            $('#phrases_in_deck').on("click", "li", $.proxy(that.move, that));
        });

    }
    //show the update phrase popup form
    $('#myModal').modal();
};

Page.prototype.move = function() {
    var phrase, index;
    var phrase_id = $(event.target).data().id;
    if ($(event.target).parent().attr('id') === 'available_phrases') {
        phrase = this.content.available_phrases.filter(function(value){return value._id == phrase_id;})[0];
        index = this.content.available_phrases.indexOf(phrase);
        this.content.phrases_in_deck.push(phrase);
        this.content.available_phrases.splice(index,1);
    } else if ($(event.target).parent().attr('id') === 'phrases_in_deck') {
        phrase = this.content.phrases_in_deck.filter(function(value){return value._id == phrase_id;})[0];
        index = this.content.phrases_in_deck.indexOf(phrase);
        this.content.available_phrases.push(phrase);
        this.content.phrases_in_deck.splice(index,1);
    }
    this.content.phrases_in_deck.sort(compare);
    this.content.available_phrases.sort(compare);
    $('#phrases_in_deck').html("");
    $('#available_phrases').html("");
    View.render(this.content.phrases_in_deck, "phrases_in_deck", "/template/deck-phrases-template.html");
    View.render(this.content.available_phrases, "available_phrases", "/template/deck-phrases-template.html");
};

Page.prototype.update = function(event) {
    //prevent page reload on update phrase form submission
    event.preventDefault();
    //define post url
    url = "/" + this.path + "/" + $('#id').data().id;
    if (this.path === 'decks') {
        this.content.phrases_in_deck.forEach(function(v,i,a){
            if ($('#phrases').val()) {
                $('#phrases').val($('#phrases').val() + "," + v._id);
                console.log(i,$('#phrases').val());
            } else {
                $('#phrases').val(v._id);
                console.log(i,$('#phrases').val());
            }
        });
    }
    if (this.path === "decks") console.log($('#phrases').val().split(",").length);
    var that = this;
    //AJAX PUT request of updated word from update word form
    $.put(url, $(event.target).serialize())
        // when PUT request is completed, update content and clear update form
        .done(function(res) {
            that.all();
            $('#update-form')[0].reset();
        });
    //hide update popup form
    $('#myModal').modal('hide');
};

