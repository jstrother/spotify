var Spotify = function() {
    this.searchButton = $('button');
    this.searchButton.click(this.onSearchClicked.bind(this));
    this.searchForm = $('form');
    this.searchForm.submit(this.onSearchSubmitted.bind(this));
    this.searchBox = $('input');
    this.result = $('#result');
    this.artistTemplate = Handlebars.compile($("#artist-template").html());
};
Spotify.prototype.onSearchClicked = function() {
    var name = this.searchBox.val();
    this.search(name);
    this.result.toggleClass('transparent');
};
Spotify.prototype.onSearchSubmitted = function(event) {
    event.preventDefault();
    this.searchButton.trigger('click');
};
Spotify.prototype.search = function(name) {
    var ajax = $.ajax('/search/' + name, {
        type: 'GET',
        dataType: 'json'
    });
    ajax.done(this.onSearchDone.bind(this));
};
Spotify.prototype.onSearchDone = function(artist) {
    var result = $(this.artistTemplate(artist));
    this.result.empty().append(result);
    this.result.toggleClass('transparent');
};
$(document).ready(function() {
    var app = new Spotify();
});