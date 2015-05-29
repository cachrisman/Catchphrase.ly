function Quiz() {
    this.deck = new Deck();
    this.decks = {};
    this.repeat = false;
    this.type = "review";
}

Quiz.prototype.run = function(event) {
    event.preventDefault();
    var quizOptions = $('#quiz-form').serializeArray();
    this.repeat = quizOptions.filter(function(v){return v.name==='repeat';})[0].value;
    this.repeat = this.repeat === 'yes' ? true : false;
    this.type = quizOptions.filter(function(v){return v.name==='type';})[0].value;
    $('#quiz-title').html(this.type);
    $('#modal').modal();

    if (this.type === "review") {
        // run the review quiz
        console.log("review quiz");
        this.deck.unviewed = this.deck.phrases;
        this.deck.updateCard();
        $('#next').on("click", $.proxy(this.deck.updateCard, this.deck));
        $('#previous').on("click", $.proxy(this.deck.updateCard, this.deck));
    } else if (this.type === "self-graded") {
        // run the self-graded quiz
    } else if (this.type === "multiple-choice") {
        // run the multiple choice quiz
    }
};

