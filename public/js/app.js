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
  return a.word === b.word ? 0 : a.word < b.word ? -1 : 1;
}

// on page load
$(function() {
    // variable to store ajax data
    var page = new Page();
    // get and render the phrases
    page.all();
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
        // console.log("using cached template:", templateFile, "\ndata:", View.cache[templateFile]);
        template = _.template(View.cache[templateFile]);
        // input data into template and append to parent
        $("#" + parentId).html(template({
            collection: items
        }));
    } else if (templateFile.charAt(0) === '/') {
        $.get(templateFile).done(function(data) {
            View.cache[this.url] = data;
            // console.log("caching:", this.url, "\ndata:", data);
            // render a template
            template = _.template(data);
            // input data into template and append to parent
            $("#" + parentId).html(template({
                collection: items
            }));
        });
    }  else {
        // console.log("caching:", this.url, "\ndata:", data);
        template = _.template(templateFile);
        // input data into template and append to parent
        $("#" + parentId).html(template({
            collection: items
        }));
    }
};

View.init = function(page) {
    //event listener for add form
    $('#add-form').on("submit", $.proxy(page.add, page));
    //event listener for update popup form
    $('#update-form').on("submit", $.proxy(page.update, page));

    // $('#decks-ul').on("click", "button.edit", {page:page}, page.show_edit);
    // console.log('#'+page.path+'-ul');
    $('#'+page.path+'-ul').on("click", "button.edit", $.proxy(page.show_edit, page));
    $('#'+page.path+'-ul').on("click", "button.close", $.proxy(page.delete, page));
    //event listener for close button on update phrase popup form
    // $('#close').on("click", function() {
    //     $('.overlay').hide();
    // });
    //event listener for ESC key to close update phrase popup form
    // $(document).on("keyup", function(e) {
    //     if (e.keyCode == 27) {
    //         $('#myModal').modal();
    //         // $('.overlay').hide();
    //     }
    // });
    // $(document).mouseup(function(e) {
    //     var container = $("#setup");
    //     // if the target of the click isn't the container nor a descendant of the container
    //     if (!container.is(e.target) && container.has(e.target).length === 0) {
    //         $('.overlay').hide();
    //     }
    // });
};

View.reset = function() {
    //turns off event listener for add form
    $('#add-form').off();
    //turns off event listener for update popup form
    $('#update').off();
    //turns off event listener for close button on update form
    // $('#close').off();
    //turns off event listener for ESC key on update form
    // $(document).off("keyup");
};

function Page() {
    this.content = {};
    this.path = window.location.href.split('/')[3].toLowerCase().replace('#','');
}

Page.prototype.all = function() {
    //AJAX GET request
    var url = "/" + this.path + "/json";
    var that = this;
    $.get(url, function(res) {
        // parse the response
        that.content = JSON.parse(res);
        // render the results

    }).done(function(res) {
        //when GET request completes, reset View and re-init View
        View.render(that.content, that.path + "-ul", "/template/" + that.path + "-template.html");
        View.reset();
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
            View.render(that.content.phrases_in_deck, "phrases_in_deck", "/template/deck-phrases-template.html");

            that.content.available_phrases = JSON.parse(b[2].responseText);

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
    // $('.overlay').show();
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
    this.content.phrases_in_deck.forEach(function(v,i,a){
        if ($('#phrases').val()) {
            $('#phrases').val($('#phrases').val() + "," + v._id);
        } else {
            $('#phrases').val(v._id);
        }
    });

    var that = this;
    //AJAX PUT request of updated word from update word form
    $.put(url, $(event.target).serialize())
        // when PUT request is completed, update content and clear update form
        .done(function(res) {
            that.all();
            $('#update-form')[0].reset();
        });
    //hide update popup form
    $('#myModal').modal();
    // $('.overlay').hide();
};

Page.prototype.delete = function() {
    //define delete phrase url using data-id stored in each phrase div
    url = "/" + this.path + "/" + $(event.target).parent().data().id;
    //AJAX DELETE request of selected word and on success, update page
    $.delete(url, this.all());
};
