// on page load
$(function() {
    // get and render the phrases
    Phrases.all();
    //set event listeners
    View.init();
});

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
    // $('.close').on("click")
};

View.reset = function() {
  $('#phrases-form').off();
};
// Phrases OBJECT
function Phrases() {}

Phrases.all = function() {
    $.get("/phrases", function(res) {
        // parse the response
        var phrases = JSON.parse(res);
        // render the results
        View.render(phrases, "phrases-ul", "phrases-template");
    }).done(function(res){
      View.reset();
      View.init();
    });
};

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
