$(document).ready(function(){

	// Starting location is San Francisco
	var startingLocation = {lat: 37.773972, lng: -122.431297};

	/** Map Module **/
	var Map = (function (initialLocation) {
		var module = {};

		// Default starting location is San Francisco
		var startingLocation = initialLocation || {lat: 37.773972, lng: -122.431297};

		// Markers
		var markers = [];

		// One info window for the map
		var infoWindow = new google.maps.InfoWindow();

		// Google Map
		var map = new google.maps.Map(document.getElementById('map'), {
			center: startingLocation,
			zoom: 13
		});

		// Geocoder
		var geocoder = new google.maps.Geocoder();

		/** Private Functions **/
		var formatDataToMovieContent = function(movie){
			var contentString = '<div id="content">'+
			'<h3>' + movie.title + '</h3>'+
			'<div id="bodyContent">'+
			'<div>Location: ' + movie.locations + '</div>' + 
			'<div>Directed by: ' + movie.director + '</div>' + 
			'<div>Written by: ' + movie.writer + '</div>' + 
			'</div>'+
			'</div>';
			return contentString;
		};

		var addInfoWindow = function(marker, data){
			var contentString = formatDataToMovieContent(data);

			// Add a listener to the marker to open up an info window
			marker.addListener('click', function() {
				infoWindow.setContent(contentString);
				infoWindow.open(map, marker);
			});
		};

		/** Public Functions **/
		module.addMarker = function(location, data){
			// Create and add marker to the map		
			var marker = new google.maps.Marker({
				position: location,
				map: map
			});

			// Push marker to markers array
			markers.push(marker);

			// Add info window
			addInfoWindow(marker, data);
		};

		module.clearMarkers = function(){
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
			markers = [];
		};

		module.geocodeAddress = function(movie){
			// Clear the map
	  	Map.clearMarkers();

			// Modifiy the passed in address so that results are more likely to appear in San Francisco
			var modifiedAddress = movie.locations + 'San Francisco, CA';
			// Geocode the address
			geocoder.geocode({'address': modifiedAddress}, function(results, status) {
				if(status === google.maps.GeocoderStatus.OK){
					// Add all results to the map
	  			for(var i=0; i<results.length; i++){
	  				// Add marker to map
	  				Map.addMarker(results[i].geometry.location, movie);
	  			}		
	  		}else{
					console.log('Geocode was not successful for the following reason: ' + status);
				}
			});
		};

		return module;
	}(startingLocation));
	/** Map Module **/

	$("#search_button").click(function(){
		var text = $("#search_input").val();
		var tab = $('.nav-pills .active').attr("value");

		// Get all movie locations by title then geocode their addresses to place on map
		getLocations(text, tab, false);
	});

	/** Autocomplete **/
	$("#search_input").autocomplete({
		delay: 300, 	// Delay between keystrokes and fetch request
    minLength: 1, // Minimum length of input for autocomplete
    source: function(request, response) {
    	var tab = $('.nav-pills .active').attr("value");
    	var url = formatMoviesUrl(request.term,tab, true);

      // Make call to server to get autocomplete results
      $.getJSON(url, function(data, status, xhr){
      	var mappedResults = data.map(function(d){
        // Reformat the results to match the accepted signature of JQuery Autocomplete's Source
        d.label = d.director || d.title;
        d.value = d.director || d.title;
        return d;
      });
      	response(mappedResults);
      });
    },
    select: function(event, ui) {
    	var tab = $('.nav-pills .active').attr("value");
    	// Geocodes addresses of movies and then places it on map
    	var geocodeAddresses = function(data){
    		for (var i=0; i<data.length; i++){
    			Map.geocodeAddress(data[i]);
    		};
    	};
     	// Get all movie locations by title then geocode their addresses to place on map
     	getLocations(ui.item.value, tab, false);
   	}
 	});

	/** Helpers **/

	var getLocations = function(query, tab, autocomplete){
		// Geocodes addresses of movies and then places it on map
     var geocodeAddresses = function(data){
     	for (var i=0; i<data.length; i++){
     		Map.geocodeAddress(data[i]);
     	};
     };
     // Get all movie locations by title then geocode their addresses to place on map
     getMovieLocations(query, tab, autocomplete, geocodeAddresses);
	};

	/**
 	 * Formats the url given the current tab and query.
 	 * param {string} query - Text input
 	 * param {string} tab - Current tab the search is under (ie. Title or Director)
 	 * param {boolean} autocomplete - True if want autocomplete results, false otherwise
 	 * return {string} formatted url
 	 */
	var formatMoviesUrl = function(query, tab, autocomplete){
		return "/movies?tab=" + tab + "&autocomplete=" + autocomplete +  "&q=" + query;
	};

	var getMovieLocations = function(query, tab, autocomplete, callback){
		var url = formatMoviesUrl(query, tab, autocomplete, callback);
		$.getJSON(url, function(data){
			callback(data);
		});
	};
});