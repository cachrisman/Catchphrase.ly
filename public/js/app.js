// on page load
$(function() {
    // get and render the phrases
    Phrases.all();
    //set event listeners
    View.init();
});

var phrases;
// // // // // // //

// VIEW OBJECT
function View() {}

View.render = function(items, parentId, templateId) {
    // render a template
    var template = _.template($("#" + templateId).html());
    // input data into template and append to parent
    $("#" + parentId).html(template({
        collection: items
    }));
};

View.init = function() {
    $('#phrases-form').on("submit", function(event) {
        event.preventDefault();
        // console.log($(this).serialize());
        $.post("/phrases", $(this).serialize())
            .done(function(res) {
                Phrases.all();
                $('#phrases-form')[0].reset();
            });
    });
    $('#close').on("click", function() {
        $('.overlay').hide();
    });
    $('#update').on("submit", function(event) {
        event.preventDefault();
        // console.log($(this).serialize());
        url = "/phrases/" + $('#id').data().id;
        // console.log(url);
        $.post(url, $(this).serialize())
            .done(function(res) {
                Phrases.all();
                $('#update')[0].reset();
            });
        $('.overlay').hide();
    });
    $(document).on("keyup", function(e) {if (e.keyCode == 27) { $('.overlay').hide();}});
    // $('#update').on("click", Phrases.show_edit);
    // $('.list-group-item').on("click", Phrases.edit);
};

View.reset = function() {
    $('#phrases-form').off();
    $('#close').off();
    $('#update').off();
    $(document).off("keyup");
};
// Phrases OBJECT
function Phrases() {}

Phrases.all = function() {
    $.get("/phrases", function(res) {
        // parse the response
        phrases = JSON.parse(res);
        // render the results
        View.render(phrases, "phrases-ul", "phrases-template");
    }).done(function(res) {
        View.reset();
        View.init();
    });
};

Phrases.show_edit = function(item) {
    id = $(item).data().id;
    var idx = phrases.map(function(e) {
        return e.id;
    }).indexOf(parseInt(id));
    $('#word').val(phrases[idx].word);
    $('#definition').val(phrases[idx].definition);
    $('#id').data().id = id;
    $('.overlay').show();
}

Phrases.delete = function(item) {
    // console.log(item);
    // url = "/phrases/:" + $(item).attr("data-id");
    url = "/phrases/" + $(item).data().id;
    // console.log(url);
    $.ajax({
        url: url,
        type: 'DELETE',
        success: function(response) {
            console.log(response);
            Phrases.all();
        }
    });
};
