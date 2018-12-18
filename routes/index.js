var express = require('express');
var router = express.Router();
const mysql = require('mysql');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'users'
});


router.use(passport.initialize());

passport.use(new FacebookStrategy({
  clientID : '747468575621088',
  clientSecret : '484f81f9838716c15e4eb7ced9035912',
  callbackURL: 'https://2c1ae7dd.ap.ngrok.io/authFacebook/done',
  profileFields: ['id', 'name', 'email', 'photos']
}, function(accessToken, refreshToken, profile, done){
  return done(null, profile);
}))

passport.serializeUser(function(profile,done){
  return done(null, profile);
})

passport.deserializeUser(function(profile,done){
  return done(null, profile);
})

router.get('/authFacebook', passport.authenticate('facebook'));
router.get('/authFacebook/done', 
passport.authenticate('facebook', {
  failureRedirect: '/'
}),function(req,res){
  console.log(req.user)
  let fbid = req.user.id;
  let user = connection.query("SELECT * FROM user WHERE fbid=?", [fbid], (err, result) => {
    if (err) {
      res.redirect('/');
    }
    if (result) {
      if (result.length == 0) {
        //belom regis
        res.redirect('/register?fbid=' + fbid);
      }
      else {
        //udah regis
        res.redirect('/home?id=' + result[0].id);
      }
    }
  });



  //return res.json(req.user);
});

router.get('/home', (req, res) => {
  res.render('home')
})

router.get('/register', (req, res) => {
  res.render('register');
})

router.post('/register', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var fbid = req.body.fbid;

  connection.query("INSERT INTO user(fbid, name, password) VALUES (?, ?, ?)", [fbid, username, password], (err, result) => {
    if (err) {
      return res.json({msg: 'error'})
    } 
    else {
      return res.json({msg: 'success'});
    }
  });


  console.log(req.body.username);
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
