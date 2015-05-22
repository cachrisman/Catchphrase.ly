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

View.render = function(items, parentId, templateFile) {
    var template;
    // get template file
    $.get("/template/" + templateFile).done(function(data){
        // render a template
        template = _.template(data);
        // input data into template and append to parent
        $("#" + parentId).html(template({
            collection: items
        }));
    });
};

View.init = function() {
    //event listener for add phrase form
    $('#phrases-form').on("submit", Phrases.add);
    //event listener for update phrase popup form
    $('#update').on("submit", Phrases.update);

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
};

View.reset = function() {
    //turns off event listener for add phrase form
    $('#phrases-form').off();
    //turns off event listener for update phrase popup form
    $('#update').off();
    //turns off event listener for close button on update phrase form
    $('#close').off();
    //turns off event listener for ESC key on update phrase form
    $(document).off("keyup");
};
// Phrases OBJECT
function Phrases() {}

Phrases.all = function() {
    //AJAX GET request
    $.get("/phrases.json", function(res) {
        // parse the response
        phrases = JSON.parse(res);
        // render the results
        View.render(phrases, "phrases-ul", "phrases-template.html");
    }).done(function(res) {
        //when GET request completes, reset View and re-init View
        View.reset();
        View.init();
    });
};

Phrases.add = function(event) {
    //prevent page reload on add phrase form submission
    event.preventDefault();
    //AJAX POST of new phrase from add phrase form
    $.post("/phrases", $(this).serialize())
        // when POST request is completed, update Phrases and clear add phrase form
        .done(function(res) {
            Phrases.all();
            $('#phrases-form')[0].reset();
        });
};

Phrases.show_edit = function(item) {
    //get id of phrase that was clicked
    id = $(item).data().id;
    //find index of item in phrases array
    var idx = phrases.map(function(e) {
        return e._id;
    }).indexOf(id);
    //fill in update phrase popup form input fields with data from phrases
    $('#word').val(phrases[idx].word);
    $('#definition').val(phrases[idx].definition);
    $('#id').data().id = id;
    //show the update phrase popup form
    $('.overlay').show();
};

Phrases.update = function(event) {
    //prevent page reload on update phrase form submission
    event.preventDefault();
    //define post url
    url = "/phrases/" + $('#id').data().id;
    //AJAX POST request of updated word from update word form
    $.post(url, $(this).serialize())
    // when POST request is completed, update Phrases and clear add phrase form
        .done(function(res) {
            Phrases.all();
            $('#update')[0].reset();
        });
    //hide update phrase popup form
    $('.overlay').hide();
};

Phrases.delete = function(item) {
    //define delete phrase url using data-id stored in each phrase div
    url = "/phrases/" + $(item).data().id;
    //AJAX DELETE request of selected word
    $.ajax({
        url: url,
        type: 'DELETE',
        //on success, refresh phrases list
        success: function(response) {
            Phrases.all();
        }
    });
};
