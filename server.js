const unirest = require('unirest');
const express = require('express');
const events = require('events');

const app = express();
app.use(express.static('public'));

app.get('/search/:name', function(req, res) {
	var complete = 0;
	var searchReq = getFromApi('search', {
		q: req.params.name,
		limit: 1,
		type: 'artist'
	});
	searchReq.on('end', findArtist);
	
	searchReq.on('error', errorHandling);

	function findArtist(item) {
		var artist = item.artists.items[0];
		var id = item.artists.items[0].id;

		var searchRel = getRelatedFromApi(id);
		searchRel.on('end', findRelated);

		searchRel.on('error', errorHandling);

		function findRelated(item) {
			artist.related = item.artists;
			artist.related.forEach(findArtistTrack);
			function findArtistTrack(artist) {
				var searchTrack = getTopTracksFromApi(artist, {
					country: 'US'
				});
				searchTrack.on('end', findTrack);
				searchTrack.on('error', errorHandling);
				function findTrack(item) {
					artist.tracks = item.tracks;
					complete += 1;
					checkComplete();
				}
			}
		}

		function checkComplete() {
			if (complete === artist.related.length) {
				res.json(artist);
			}
		}
	}
	
	function errorHandling(code) {
		res.sendStatus(code);
	}
});

app.listen(8080);

function getFromApi(endpoint, args) {
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
function getRelatedFromApi(id) {
	var emitterRel = new events.EventEmitter();
	unirest.get('https://api.spotify.com/v1/artists/' + id + '/related-artists')
				 .end(function(response) {
					 	if (response.ok) {
					 		emitterRel.emit('end', response.body);
					 	} else {
					 		emitterRel.emit('error', response.code);
					 	}
				 });
	return emitterRel;
};
function getTopTracksFromApi(artist, args) {
	var emitterTrack = new events.EventEmitter();
	var id = artist.id;
	unirest.get('https://api.spotify.com/v1/artists/' + id + '/top-tracks')
				 .qs(args)
				 .end(function(response) {
				 		if (response.ok) {
				 			emitterTrack.emit('end', response.body);
				 		} else {
				 			emitterTrack.emit('error', response.body);
				 		}
				 });
	return emitterTrack;
};
