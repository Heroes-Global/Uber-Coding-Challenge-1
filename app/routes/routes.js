var async = require('async');
var Movie = require('../models/movie');
var MovieLocations = require('../models/movieLocation');
var Director = require('../models/director');

module.exports = function (app, redisClient, env) {
	var dataSetUrl = env.SF_DATASET_URL || "https://data.sfgov.org/resource/wwmu-gmzc.json";

	app.get('/', function(req, res){
		res.render('index');
	});

	app.get('/autocomplete', function(req, res){
		var term = req.query.q.toLowerCase();
		var setName = env.REDIS_AUTOCOMPLETE_SET + req.query.tab + ":" + term;
		var query = "^" + term;
		var numResults = 10;

		// Check if query is in redis
		redisClient.zrevrange(setName, 0, numResults-1, function(err, response){
			if(err){
				console.log("Error with query: ", req.query.q);
				console.log("Error: ", err);
				throw err;
			}else if(response.length > 0){
				var result = response.map(function(d){ return JSON.parse(d); });
				res.json(result);
				return;
			}else{
				// Case insensitive regex
				var reg = new RegExp(query, 'i');

				// Search DB for movie or director given the query tab
				if(req.query.tab == "title"){
					Movie
						.find({title: reg})
						.limit(numResults)
						.exec(function (err, movies) {
							res.json(movies);
						});
				}else{
					Director
						.find({name: reg})
						.limit(numResults)
						.exec(function (err, directors) {
							res.json(directors);
						});
				}
			}
		});
	});

	app.get('/search', function(req, res){
		var id = req.query.id;
		var query = (req.query.tab == "title") ? {_id: id} : {director: id};
		Movie
		.findOne(query)
		.populate('director')
		.exec(function(err, movie){
			if(!movie){
				res.json([]);
			}else{
				MovieLocations.find({ movie_id: movie._id }, function(err, results){
					// Formats movie data to be rendered in mapinfo template
					var formatResult = function(d, callback) {
						d = d.toObject();
						var context = {
							title: movie.title,
							picture: movie.picture,
							location: d.location,
							release_year: movie.release_year,
							director: movie.director.name,
							layout: false
						};

						// Render template with formatted data
						app.render('templates/mapinfo', context, function(err, html){
							// Store rendered HTML and lat,lng points
							var output = {
								latitude: parseFloat(d.latitude),
								longitude: parseFloat(d.longitude),
								html: html
							};
							callback(null, output);
						});
					};

					results = async.map(results, formatResult, function(err, results){
						res.json(results);
					});
				});
			}
		});
	});
};