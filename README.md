# Uber Coding Challenge - San Francisco Food Trucks

### Challenge Link: [prompt]
See it live here: [app]


Back-end
--------
**Node - Express - Handlebars - Heroku** 

I used a simple stack without any frameworks (ie. Angular, React, Backbone, etc) mostly because there was no real need for them. Given the constraints of the problem and the time constraints, I thought it would be best to keep it simple so I can spend less time learning learning the framework and spend more time focusing on the core application.

In addition, I used Heroku to deploy the app. I normally use Heroku to deploy basic web apps mainly because it is simple/fast to deploy, and because the app restarts every so often (easy mechanism to handle crashes).

#### Challenges

The main challenge I faced was using the [Sorcata SODA API]. I chose to use this, instead of loading the data into my own database due to data synchronization issues. Meaning that my application would automatically get the latest version of the dataset if it ever changed. Though looking back at this decision, it may have not been the best design choice because it means my site is now dependent on the stability of Sorcata website. And it just so happened that their site crashed as I was nearing the end of this coding challenge. (>__>). 

But the main reason, why I think I should have created my own database was because of the use case of my application. To place points on Google Maps you need lat/lng coordinates which was not on the dataset (it stored movie locations by 'vague addesses' (i.e. City Hall, Coit Tower, etc). The way the application currently works, is that it uses Google's Geocoder service to evaluate the address to a lat/lng point. So one TODO given more time, would be to preprocess all the data so that each movie has a lat/lng already attached to it. 

Front-end
--------
**JQuery - Google Maps - Boostrap** 

The bulk off the application comes from doing manipulations with Google maps. In [map.js] there is a map module (which should be exported to another file) that is used to add/remove markers (movie locations) using geocoded addresses. There are some bootstrap elements, but they are mainly used for styling and to save time for the core feature of the front-end -- the autocomplete. 

#### Challenges

The main challenges of the front-end was figuring out how to approach autocomplete. I chose JQuery's autocomplete widget as it had all the basic functionality that I wanted: populating suggestions under the search box, but mainly because it already contained a 'request delay' that prevents too many requests from being sent. I.e. if it is set to 300ms, then it waits 300ms after the final keystroke to send the request to the server, or if another key has been pressed within that time, it tries to wait another 300ms.

To get the results, I used the SODA API's SoQL feature to query the database. It borrows 'LIKE %s' from SQL, and I then build off of that by grouping duplicate movie titles, and limiting the resulting suggestions. There are two features to the autcomplete and search:

1. Title - This feature searches for movies by their title. It uses one query for autocomplete (we just need movie names to fill out the suggestions box), and it uses another query to actually get all the movie locations with the name that was chosen (these locations will get placed on the map).
2. Director - This feature is similiar to title, in the sense that it searches on director names for autocomplete. After a name has been selected it makes a query to grab all the movies that the director has directed and places them on the Map.

TODO
--------
* Put dataset in to Database, have a nightly script that gets new data from the dataset
* Testing
* If there was more time I would really love to add a feature that shows what other people have recently searched for (movies, directors, etc). I would use Socket.io to do this, and just keep a small list (3-5 searches) that get displayed to everyone using the app, and gets updated in real-time whenever somebody makes a new search.

### Installation

Clone the repo, and 'npm install'. Optionally you can add an environment variable SF_DATASET_URL to specify where you want the movie location data to come from.

   [prompt]: <https://github.com/uber/coding-challenge-tools/blob/master/coding_challenge.md>
   [app]: <https://uber-coding-challenge.herokuapp.com>
   [map.js]: <https://github.com/aaandrew/Uber-Coding-Challenge/blob/master/public/js/map.js>
   [Sorcata SODA API]: <https://dev.socrata.com/docs/queries/>