var express = require('express');
var app = express();

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('./config');

var googleProfile = {};

passport.serializeUser(function (user, done) {
    done(null, user);
  });

passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });

passport.use(new GoogleStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.CALLBACK_URL,
      },
      function (accessToken, refreshToken, profile, cb) {
        googleProfile = {
            id: profile.id,
            displayName: profile.displayName,
          };
        cb(null, profile);
      }
));

app.set('view engine', 'pug');
app.set('views', './views');

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('assets'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//app routes

app.get('/',
  function (req, res) {
    res.render('index', { user: req.user });
  });

app.get('/logged',
  function (req, res) {
    res.render('logged', { user: googleProfile });

    //  { user: googleProfile }
    // { user: req.user }
  });

app.get('/logout',
  function (req, res) {
    req.logout();
    res.redirect('/');
  });

//Passport routes

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }));

app.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/logged',
      failureRedirect: '/',
    }));

app.use(function (req, res, next) {
  var msg = 'Request endpoint not supported: method: ' +
   req.method + ' url: ' + req.originalUrl;

  res.status(404).send(msg);
  console.log(msg);
});

var server = app.listen(3000, 'localhost', function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('server URL http://' + host + ':' + port);
});
