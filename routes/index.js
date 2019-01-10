var express = require('express');
var router = express.Router();
const mysql = require('mysql');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;

async function getConnection() {
  var connection = await require('../dbconnection/dbconnection')();
  return connection;
}


router.use(require('express-session')({
  secret: 'mcsmcc',
  resave: false,
  saveUninitialized: false
}));


router.use(passport.initialize());
router.use(passport.session());

passport.use(
  new LocalStrategy(
    async (username, password, done) => {
      let connection = await getConnection();
      let [user, fields] = await connection.execute('SELECT id, username, password FROM users WHERE username=?', [username])

      if (user) {
        if (user.length > 0) {
          if (user[0].password == password) {
            return done(null, user)
          }
          else {
            return done(null, false);
          }
        }

        else {
          return done(null, false);
        }
      }
    }
  )
)

passport.use(new FacebookStrategy({
  clientID : '747468575621088',
  clientSecret : '484f81f9838716c15e4eb7ced9035912',
  callbackURL: 'https://ca450ce0.ap.ngrok.io/authFacebook/done',
  profileFields: ['id', 'name', 'email', 'photos']
}, function(accessToken, refreshToken, profile, done){
  return done(null, profile);
}))

//passport.use(new Local)

passport.serializeUser(function(profile,done){
  return done(null, profile);
})

passport.deserializeUser(function(profile,done){
  return done(null, profile);
})

router.get('/authLocal', async (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/home?id=' + req.user[0].id);
  }
  return res.render('loginLocal');
})

router.post(
  '/authLocal', 
  passport.authenticate('local', {
    failureRedirect: '/'
  }),
  async(req, res) => {
    console.log("usernya local: ", req.user[0]);
    if (req.isAuthenticated()) res.send(req.user[0])
  }
)

router.get('/aboutMe', async (req, res) => {
  res.send(req.user)
})

router.get('/authFacebook', passport.authenticate('facebook', {
  scope: ['email']
}));

router.get('/authFacebook/done', 
  passport.authenticate('facebook', {
    failureRedirect: '/'
  }),
  async (req,res) => {
    let connection = await getConnection();
    console.log(req.user)
    let fbid = req.user.id;
    try {
      let [user, fields] = await connection.execute("SELECT * FROM users WHERE fbid=?", [fbid]);
    
      if (user) {
        if (user.length == 0) {
          res.redirect('/register?fbid=' + fbid);
        }
        else {
          //udah regis
          res.redirect('/home?id=' + user[0].id);
        }
      }
    }

    catch (err) {
      console.log(err.message);
      res.redirect('/');
    }
  }
);

router.get('/home', (req, res) => {
  if (req.user) console.log(req.user)
  res.render('home')
})

router.get('/register', (req, res) => {
  res.render('register');
})

router.post('/register', async (req, res) => {
  console.log(req.user)
  var username = req.body.username;
  var password = req.body.password;
  var fbid = req.body.fbid;
  var email = req.user._json.email;
  let connection = await getConnection();

  try {
    await connection.execute("INSERT INTO users(fbid, username, email, password) VALUES (?, ?, ?, ?)", [fbid, username, email, password]);
  
    return res.json({msg: 'success'});
  }
  catch (error) {
    console.log(error.message);

    return res.json({msg: 'error'})
  }

  console.log(req.body.username);
})


router.get('/courses', async (req, res) => {
  // console.log(req.user)
  // if (req.user) {
    let connection = await getConnection();

    let [courses, fields] = await connection.execute(`
      SELECT id, main_course_name, course_name, description FROM courses
    `)

    res.send(courses);
  //}
  // else {
  //   res.send({error: 'not authenticated'})
  // }
})

router.get('/detail_courses', async (req, res) => {
  if (req.body.course_id) {
    let connection = await getConnection();

    let [courses, fields] = await connection.execute(
      `SELECT id, main_course_name, course_name, description, link FROM courses WHERE id=?`,
      [req.body.course_id]
    )

    res.send(courses);
  }
  else {
    return res.status(400).send('no course id supplied!')
  }
})

router.post('/user_courses', async(req, res) => {
  if (req.body.user_id) {
    let connection = await getConnection();

    let [user_courses, fields] = await connection.execute(`SELECT * FROM course_history JOIN courses ON course_id=courses.id WHERE user_id=?`, [req.body.user_id]);

    let userCourseHistory = {
      user_id: req.body.user_id,
      courses: []
    }

    let courses = []
    for (user_course of user_courses) {
      console.log(user_course)

      let courseEntry = {
        id: user_course.id,
        main_course_name: user_course.main_course_name,
        course_name: user_course.course_name,
        description: user_course.description
      };

      courses.push(courseEntry);
    }


    userCourseHistory.courses = courses;

    res.send(userCourseHistory);
  }
  else {
    return res.status(400).send('no user id supplied!')
  }
})

router.post('/assign_course', async(req, res) => {
  if (req.body.user_id && req.body.course_id) {
    let connection = await getConnection();
    try {
      let [alreadyAssigned, fields] = await connection.execute('SELECT * FROM course_history WHERE user_id=? AND course_id=?', [req.body.user_id, req.body.course_id]);

      if (alreadyAssigned.length > 0) {
        return res.send({
          status: "failed",
          reason: "user already assigned course"
        })
      }


      await connection.execute('INSERT INTO course_history(user_id, course_id) VALUES(?, ?)', [req.body.user_id, req.body.course_id]);
    
      return res.send({
        user_id: req.body.user_id,
        course_id: req.body.course_id,
        status: "success"
      })
    } 
    catch (error) {
      console.log(error.message);

      return res.status(500).send("internal error");
    }
  }
})

router.get('/regis', function(req, res, next) {
  res.render('regis', { title: 'Express' });
});

router.get('/Homepage', function(req, res, next) {
  res.render('Homepage', { title: 'Express' });
});

router.get('/MyCourse', function(req, res, next) {
  res.render('MyCourse', { title: 'Express' });
});

router.get('/viewDetail', function(req, res, next) {
  res.render('viewDetail', { title: 'Express' });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Express' });
});


module.exports = router;
