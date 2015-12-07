var request = require('request');

module.exports = function (app, env) {
	var dataSetUrl = env.SF_DATASET_URL || "https://data.sfgov.org/resource/wwmu-gmzc.json";

	app.get('/', function(req, res){
		res.render('index');
	});

	app.get('/movies', function(req, res){
		var url = setResultUrl(req.query.q, req.query.tab, req.query.autocomplete=='true');
		// Send request to online dataset
		getJSON(url, function(data){
			res.json(data);
		});
	});

	/** Helpers **/

	// Gets JSON response from request
	var getJSON = function(url, callback){
		request(url, function (error, response, body) {
			if(!error && response.statusCode == 200){
				callback(JSON.parse(body));
			}else{
				console.log("Got an error: ", error, ", status code: ", response.statusCode);
			}
		});
	};

	/**
	 * Format the url based on the query tab
	 * param {string} query - query
	 * param {string} tab - Query tab (i.e. director or title)
	 * param {boolean} isAutoComplete - Changes result url based on if querying only for autocomplete results
	 * return {string} resultUrl - resulting url to be queried
	 */
	var setResultUrl = function(query, tab, isAutoComplete){
		var resultUrl = "";
		if(tab == "title"){
			resultUrl = isAutoComplete ? formatAutoCompleteTitleUrl(query) : formatTitleUrl(query);
		}else{
			resultUrl = isAutoComplete ? formatAutoCompleteDirectorUrl(query) : formatDirectorUrl(query);
		}
		return resultUrl;
	};

	var formatAutoCompleteTitleUrl = function(query){
		var startUrl = "?$select=title&$where=LOWER(title) like LOWER('";
		var endUrl = "%25')&$limit=10&$group=title";
		var resultUrl = dataSetUrl + startUrl + query + endUrl;
		return resultUrl;
	};

	var formatAutoCompleteDirectorUrl = function(query){
		var startUrl = "?$select=director&$where=LOWER(director) like LOWER('";
		var endUrl = "%25')&$limit=10&$group=director";
		var resultUrl = dataSetUrl + startUrl + query + endUrl;
		return resultUrl;
	};

	var formatTitleUrl = function(query){
		var startUrl = "?$select=*&$where=LOWER(title)=LOWER('";
		var endUrl = "')";
		return dataSetUrl + startUrl + query + endUrl;
	};

	var formatDirectorUrl = function(query){
		var startUrl = "?$select=*&$where=LOWER(director)=LOWER('";
		var endUrl = "')";
		return dataSetUrl + startUrl + query + endUrl;
	};
};