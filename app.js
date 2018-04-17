require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors')
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

var index = require('./routes/index');
var api = require('./routes/api');

var app = express();

var Users = require('./models/users');

mongoose.connect(process.env.MONGO_URL, {useMongoClient: true});
mongoose.Promise = global.Promise;

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'https://nightlife-serpa.herokuapp.com/api/login'
}, function (token, tokenSecret, profile, cb) {
  Users
    .findOrCreate({
      githubId: profile.id
    }, function (err, user) {
      return cb(err, user);
    });
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  cb(null, user);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('express-session')({secret: process.env.SECRET, resave: true, saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', api);

app.use(express.static(path.join(__dirname, 'public')));

app.use('*', function (req, res) {
  res.sendfile('./public/index.html');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req
    .app
    .get('env') === 'development'
    ? err
    : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
