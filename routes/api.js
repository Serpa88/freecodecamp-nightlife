var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
const yelp = require('yelp-fusion');
const client = yelp.client(process.env.YELP_SECRET);
var router = express.Router();
var Users = require('../models/users');
var Places = require('../models/places');

/* GET home page. */
router.get('/places/:location', CORS, function (req, res, next) {
    req.session.lastRequest = req.params.location;
    client
        .search({term: '', location: req.params.location})
        .then(response => {
            const businesses = response.jsonBody.businesses;
            // res.json(businesses);
            Places.find({
                'placeId': { $in: businesses.map(business => business.id)}
            }, function(err, docs){
                 if (err) return next(err);
                 businesses.map(business => business.numAttending = 0);
                 docs.forEach(doc => {
                    let place = businesses.find(business => business.id === doc.placeId);
                    place.numAttending = doc.people.length;
                 });
                 res.json(businesses);
            });
        });
});

router.get('/attending/:placeId', CORS, isLoggedIn, function (req, res) {
    Places
        .findOrCreate({
            placeId: req.params.placeId
        }, {
            people: []
        }, function (err, place) {
            var perIndex = place
                .people
                .indexOf(req.user._id.toString());
            if (perIndex > -1) {
                place
                    .people
                    .splice(perIndex, 1);
            } else {
                place
                    .people
                    .push(req.user._id.toString());
            }
            place.save();
            res.json(place);
        });
});

router.post('/place/:placeId', CORS, function (req, res) {
    Places
        .findOne({
            placeId: req.params.placeId
        }, function (err, place) {
            if (place) {
                res.json(place);
            } else {
                res.json({notFound: true});
            }
        });
});

router.get('/login', passport.authenticate('github', {failureRedirect: '/login'}), function (req, res) {
    const url = '/' + req.session.lastRequest;
    console.log(url);
    res.redirect(url);
});

router.get('/logins', function (req, res, next) {
    req.session.redirectURL = '/' + req.query.redirect;
    next();
}, passport.authenticate('twitter', {failureRedirect: '/login'}), function (req, res) {
    res.redirect('localhost:3000/' + req.session.redirectURL);
});

function isLoggedIn(req, res, next) {
    if (req.user) {
        console.log('logged in!');
        next();
    } else {
        console.log('not logged in!')
        res.json({notLogged: true});
    }
}

function CORS(req, res, next) {
    console.log('CORS check')
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    next();
}

module.exports = router;