var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

//
app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// bodyparser to pass form data
app.use(bodyParser.urlencoded({ extended: true }));

// serve static files.. maybe should extend to use ngnx
app.use("/public", express.static(__dirname + '/public'));

MongoClient.connect('mongodb://localhost:27017/video', function(err, db) {

    assert.equal(null, err);
    console.log("Successfully connected to MongoDB.");

    // Handler for internal server errors
    function errorHandler(err, req, res, next) {
        console.error(err.message);
        console.error(err.stack);
        res.status(500).render('error_template', { error: err });
    }

    app.get('/', function(req, res, next) {
        res.render('entryForm');
    });

    app.post('/store_entry', function(req, res, next) {
        var movieTitle = req.body.title,
            movieYear = req.body.year,
            movieImdb = req.body.imdb;

            console.log(movieYear);

        if (typeof movieTitle == 'undefined' || movieTitle == '') {
            next('Please enter a title!');
        }
        else {
            //store the data in movies collection
            db.collection('movies').insertOne({"title": movieTitle, "year": movieYear, "imdb": movieImdb});
            // Route to the results page that lists all movies.
            res.redirect('/results');
        }
    });

    app.get('/results', function(req, res, next) {
        db.collection('movies').find({}).toArray(function(err, docs) {
            // Render names from db with view/results template
            res.render('results', { 'movies': docs } );
        });
    });

    app.use(errorHandler);

    app.use(function(req, res){
        res.sendStatus(404);
    });

    var server = app.listen(3000, function() {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    });

});
