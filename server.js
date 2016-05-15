var unirest = require('unirest');
var express = require('express');
var events = require('events');

var getFromApi = function(endpoint, args) {
	var emitter = new events.EventEmitter();
	unirest.get('https://api.spotify.com/v1/' + endpoint)
				 .qs(args)
				 .end(function(response) {
					 	if (response.ok) {
					 		emitter.emit('end', response.body);
					 	} else {
					 		emitter.emit('error', response.code);
					 	}
				 });
	return emitter;
};
var getRelatedFromApi = function(id, args) {
	var emitterRel = new events.EventEmitter();
	unirest.get('https://api.spotify.com/v1/' + id + '/related-artists')
				 .qs(args)
				 .end(function(response) {
					 	if (response.ok) {
					 		emitterRel.emit('end', response.body);
					 	} else {
					 		emitterRel.emit('error', response.code);
					 	}
				 });
	return emitterRel;
};

var app = express();
app.use(express.static('public'));

app.get('/search/:name', function(req, res) {
	var id = null;
	var searchReq = getFromApi('search', {
		q: req.params.name,
		limit: 1,
		type: 'artist'
	});
	searchReq.on('end', function(item) {
		var artist = item.artists.items[0];
		id = item.artists.items[0].id;
		res.json(artist);
	});
	var searchRel = getRelatedFromApi('id', {
		q: req.params.id,
		limit: 5,
		type: 'artist'
	});
	searchReq.on('error', function(code) {
		res.sendStatus(code);
	});
});

app.listen(8080);