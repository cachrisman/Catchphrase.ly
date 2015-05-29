function compare(a,b) {
  return a.word.toLowerCase() === b.word.toLowerCase() ? 0 : a.word.toLowerCase() < b.word.toLowerCase() ? -1 : 1;
}

function Deck(id) {
    this.id = id;
    this.phrases = new Phrases();
    this.unviewed = [];
    this.viewed = [];
    this.index = 0;
}

Deck.prototype.length = function  () {
    return this.phrases.length;
};

Deck.prototype.next = function () {
    this.index +=1;
    if (this.index >= this.length()) {
      this.index = 0;
    }
};

Deck.prototype.prev = function () {
    this.index -= 1;
    if (this.index < 0) {
      this.index = this.length() - 1;
    }
};

Deck.prototype.add = function(event) {
    //prevent page reload on add phrase form submission
    event.preventDefault();
    //AJAX POST of new phrase from add phrase form
    var that = this;
    $.post("/decks", $(event.target).serialize())
        // when POST request is completed, update Phrases and clear add phrase form
        .done(function(res) {
            that.all();
            $('#add-form')[0].reset();
        });
};

Deck.prototype.getPhrases = function(event) {
    //AJAX GET request
    $(event.target).parents(".btn-group").find('.btn').html($(event.target).text() + '<span class="pull-right caret" style="margin-top: 8px;"></span>');
    this.id = this.id || event.target.parentElement.dataset.id;
    var url = this.id ? "/decks/" + this.id + "/phrases" : "/phrases/json";
    this.phrases.get(this.id);
    this.name = (this.id) ? "All Phrases" : $(event.target).text();
    // console.log(that.deck);
    $('#deckname').text(that.deck.name);
    $('#number-of-cards').text(that.deck.phrases.length);
    $('#deck_id').val(that.deck._id);
};

Deck.prototype.pickCard = function() {
    var length = this.unviewed.length;
    console.log("picked card", length);
    var index = Math.random() * length | 0;
    return this.unviewed.splice(index,1)[0];
};

Deck.prototype.updateCard = function(event) {
    var card;
    action = !event ? "next" : event.target.id;
    $('#previous').attr("disabled",this.index === 0? "disabled":"");
    if (action === "next"){
        if (this.unviewed.length) {
            card = (this.index === this.viewed.length) ? this.pickCard() : this.viewed[this.index];
            $('#word').text(card.word);
            $('#definition').text(card.definition);
            if (this.index === this.viewed.length) this.viewed.push(card);
            $('#previous').attr("disabled",this.unviewed.length === 0? "disabled":"");
            this.index++;
        }  else {

        }
    } else if (action === "previous") {
        if (this.viewed.length) {
            this.index--;
            card = this.viewed[this.index];
            $('#word').text(card.word);
            $('#definition').text(card.definition);
            $('#previous').attr("disabled",this.index === 0? "disabled":"");
        }
    }
};

Deck.prototype.move = function() {
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

Deck.prototype.update = function(event) {
    //prevent page reload on update phrase form submission
    event.preventDefault();
    //define post url
    url = "/" + this.path + "/" + $('#id').data().id;
    if (this.path === 'decks') {
        this.content.phrases_in_deck.forEach(function(v,i,a){
            if ($('#phrases').val()) {
                $('#phrases').val($('#phrases').val() + "," + v._id);
                // console.log(i,$('#phrases').val());
            } else {
                $('#phrases').val(v._id);
                // console.log(i,$('#phrases').val());
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

Deck.prototype.delete = function() {
    //define delete phrase url using data-id stored in each phrase div
    url = "/decks/" + $(event.target).parent().data().id;
    //AJAX DELETE request of selected word and on success, update page
    $.delete(url, this.all());
};

function Decks() {
    this.list = [];


}

Decks.prototype.get = function() {
    //AJAX GET request
    var that = this;
    $.get("/decks/json", function(res) {
        // parse the response
        that.list = JSON.parse(res);
        // render the results
    }).done(function(res) {
        //when GET request completes, reset View and re-init View
        // View.render(that.decks, "deck-list", "/template/deck-list-template.html");
        // View.reset(that);
        // View.init(that);
    });
};

Decks.prototype.show_edit = function(event) {
    //get id of phrase that was clicked
    id = $(event.target).parent().data().id;
    //find index of item in phrases array
    var index = this.list.map(function(e) {
        return e._id;
    }).indexOf(id);
    //fill in update phrase popup form input fields with data from phrases
    $('#deck-name').val(this.list[index].name);
    $('#isPrivate').prop('checked', this.list[index].isPrivate);
    $('#id').data().id = id;
    // populate phrase list on deck edit form

    var that = this;
    this.phrases_in_deck = new Deck(id);
    this.phrases_in_deck.getPhrases();

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

    //show the update phrase popup form
    $('#myModal').modal();
};
