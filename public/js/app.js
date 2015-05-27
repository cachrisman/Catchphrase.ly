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

// on page load
$(function() {
    // variable to store ajax data
    var content;
    // get and render the phrases
    Page.all();
});

// // // // // // //

// VIEW OBJECT
function View() {}

View.render = function(items, parentId, templateFile) {
    var template;
    // get template file
    $.get(templateFile).done(function(data) {
        // render a template
        template = _.template(data);
        // input data into template and append to parent
        $("#" + parentId).html(template({
            collection: items
        }));
    });
};

View.init = function() {
    //event listener for add form
    $('#add-form').on("submit", Page.add);
    //event listener for update popup form
    $('#update-form').on("submit", Page.update);

    //event listener for close button on update phrase popup form
    $('#close').on("click", function() {
        $('.overlay').hide();
    });
    //event listener for ESC key to close update phrase popup form
    $(document).on("keyup", function(e) {
        if (e.keyCode == 27) {
            $('.overlay').hide();
        }
    });
    $(document).mouseup(function(e) {
        var container = $("#setup");
        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            $('.overlay').hide();
        }
    });
};

View.reset = function() {
    //turns off event listener for add form
    $('#add-form').off();
    //turns off event listener for update popup form
    $('#update').off();
    //turns off event listener for close button on update form
    $('#close').off();
    //turns off event listener for ESC key on update form
    $(document).off("keyup");
};

function Page() {
    // which page did we load?
    var page = window.location.href.split('/')[3];
    return page.toLowerCase().replace('#','');
}

Page.all = function() {
    //AJAX GET request
    var url = "/" + Page() + "/json";
    $.get(url, function(res) {
        // parse the response
        content = JSON.parse(res);
        // render the results
        View.render(content, Page() + "-ul", "/template/" + Page() + "-template.html");
    }).done(function(res) {
        //when GET request completes, reset View and re-init View
        View.reset();
        View.init();
    });
};

Page.add = function(event) {
    //prevent page reload on add phrase form submission
    event.preventDefault();
    //AJAX POST of new phrase from add phrase form
    $.post("/" + Page(), $(this).serialize())
        // when POST request is completed, update Phrases and clear add phrase form
        .done(function(res) {
            Page.all();
            $('#add-form')[0].reset();
        });
};

Page.show_edit = function(item) {
    //get id of phrase that was clicked
    id = $(item).data().id;
    //find index of item in phrases array
    var idx = content.map(function(e) {
        return e._id;
    }).indexOf(id);
    //fill in update phrase popup form input fields with data from phrases
    if ($('#word')) $('#word').val(content[idx].word);
    if ($('#definition')) $('#definition').val(content[idx].definition);
    if ($('#deck-name')) $('#deck-name').val(content[idx].name);
    if ($('#isPrivate')) $('#isPrivate').prop('checked', content[idx].isPrivate);
    $('#id').data().id = id;
    // populate phrase list on deck edit form
    if (Page() === 'decks') {
        var phrases_in_deck, available_phrases;
        // template_string = '<li data-id=<%= _id %> class="word-list list-group-item"><%= word %></li>';
        // console.log(template_string);
        // var phraseTemplate = _.template(template_string);

        // $.get("/decks/" + id + "/phrases", function(res){
        //     phrases_in_deck = JSON.parse(res);

        //     _(phrases_in_deck).each(function(phrase) {
        //         var $phrase = $(phraseTemplate(phrase));
        //         $("#phrases-in-deck").append($phrase);
        //     });
        //     // input data into template and append to parent
        // });

        // $.get("/phrases/json").done(function(res){
        //     available_phrases = JSON.parse(res);
        //     _(available_phrases).each(function(phrase) {
        //         var $phrase = $(phraseTemplate(phrase));
        //         $("#available-phrases").append($phrase);
        //     });
        //     // input data into template and append to parent
        // });

        $.when($.get("/decks/" + id + "/phrases"), $.get("/phrases/json"))
        .done(function(a, b){
            phrases_in_deck = JSON.parse(a[2].responseText);

            _(phrases_in_deck).each(function(phrase) {
                var $phrase = $(phraseTemplate(phrase));
                $("#phrases-in-deck").append($phrase);
            });

            available_phrases = JSON.parse(b[2].responseText);
            // _(available_phrases).each(function(phrase) {
            //     var $phrase = $(phraseTemplate(phrase));
            //     $("#available-phrases").append($phrase);
            // });

            View.render(available_phrases, "available-phrases", "/template/deck-phrases-template.html");
            // console.log(available_phrases);
            $('#available-phrases').on("click", "li", { id: id, phrases_in_deck: phrases_in_deck, available_phrases: available_phrases} , Page.move);
            $('#phrases-in-deck').on("click", "li", { id: id, phrases_in_deck: phrases_in_deck, available_phrases: available_phrases}, Page.move);
        });

    }
    //show the update phrase popup form
    $('.overlay').show();
};

Page.move = function(event) {
    phrase_id = $(event.target).data().id;
    phrase = event.data.available_phrases.filter(function(value){return value._id == phrase_id;})[0];
    if ($(event.target).parent().attr('id') === 'available-phrases') {
        event.data.phrases_in_deck.push();
    }
    if ($(event.target).parent().attr('id') === 'phrases-in-deck') {
        console.log(event.data.phrases_in_deck);
    }
};

Page.update = function(event) {
    //prevent page reload on update phrase form submission
    event.preventDefault();
    //define post url
    url = "/" + Page() + "/" + $('#id').data().id;
    //AJAX PUT request of updated word from update word form
    $.put(url, $(this).serialize())
        // when PUT request is completed, update content and clear update form
        .done(function(res) {
            Page.all();
            $('#update-form')[0].reset();
        });
    //hide update popup form
    $('.overlay').hide();
};

Page.delete = function(item) {
    //define delete phrase url using data-id stored in each phrase div
    url = "/" + Page() + "/" + $(item).data().id;
    //AJAX DELETE request of selected word and on success, update page
    $.delete(url, Page.all);
};
