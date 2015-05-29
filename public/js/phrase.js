// extend jquery's ajax to make $.put and $.delete functions
jQuery.each(["put", "delete"], function(i, method) {
    jQuery[method] = function(url, data, callback, type) {
        if (jQuery.isFunction(data)) {
            type = type || callback;
            callback = data;
            data = undefined;
        }
        return jQuery.ajax({
            url: url,
            type: method,
            dataType: type,
            data: data,
            success: callback
        });
    };
});

function compare(a,b) {
  return a.word.toLowerCase() === b.word.toLowerCase() ? 0 : a.word.toLowerCase() < b.word.toLowerCase() ? -1 : 1;
}

function Phrases() {
    this.phrases_in_deck = [];
    this.available_phrases = [];
}

Phrases.prototype.get = function(event, deck_id) {
    //AJAX GET request
    var url = deck_id ? "/decks/" + deck_id + "/phrases" : "/phrases/json";
    var that = this;
    $.get(url).done(function(res) {
        that.phrases_in_deck = JSON.parse(res);
    });
};

Phrases.prototype.add = function(event) {
    //prevent page reload on add phrase form submission
    event.preventDefault();
    //AJAX POST of new phrase from add phrase form
    var that = this;
    $.post("/phrases" , $(event.target).serialize())
        // when POST request is completed, update Phrases and clear add phrase form
        .done(function(res) {
            that.all();
            $('#add-form')[0].reset();
        });
};

Phrases.prototype.show_edit = function(event) {
    //get id of phrase that was clicked
    id = $(event.target).parent().data().id;
    //find index of item in phrases array
    var idx = this.phrases_in_deck.map(function(e) {
        return e._id;
    }).indexOf(id);
    //fill in update phrase popup form input fields with data from phrases
    if ($('#word').length) $('#word').val(this.phrases_in_deck[idx].word);
    if ($('#definition').length) $('#definition').val(this.phrases_in_deck[idx].definition);
    $('#id').data().id = id;
    //show the update phrase popup form
    $('#myModal').modal();
};

Phrases.prototype.move = function() {
    var phrase, index;
    var phrase_id = $(event.target).data().id;
    if ($(event.target).parent().attr('id') === 'available_phrases') {
        phrase = this.available_phrases.filter(function(value){return value._id == phrase_id;})[0];
        index = this.available_phrases.indexOf(phrase);
        this.phrases_in_deck.push(phrase);
        this.available_phrases.splice(index,1);
    } else if ($(event.target).parent().attr('id') === 'phrases_in_deck') {
        phrase = this.phrases_in_deck.filter(function(value){return value._id == phrase_id;})[0];
        index = this.phrases_in_deck.indexOf(phrase);
        this.available_phrases.push(phrase);
        this.phrases_in_deck.splice(index,1);
    }
    this.phrases_in_deck.sort(compare);
    this.available_phrases.sort(compare);
    $('#phrases_in_deck').html("");
    $('#available_phrases').html("");
    View.render(this.phrases_in_deck, "phrases_in_deck", "/template/deck-phrases-template.html");
    View.render(this.available_phrases, "available_phrases", "/template/deck-phrases-template.html");
};

Phrases.prototype.update = function(event) {
    //prevent page reload on update phrase form submission
    event.preventDefault();
    //define post url
    url = "/phrases/" + $('#id').data().id;
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

Phrases.prototype.delete = function() {
    //define delete phrase url using data-id stored in each phrase div
    url = "/phrases/" + $(event.target).parent().data().id;
    //AJAX DELETE request of selected word and on success, update page
    $.delete(url, this.all());
};
