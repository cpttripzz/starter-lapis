var passport = require('passport');
var config = require('../config');
var multer  = require('multer')
import { login, register, getUsers, newUser, getProfile, postProfile, checkProps, handleProfileImageSave } from '../services/user.service';
import { removeStringBeforeLastInstance } from '../../utils/stringUtils'
import { isJwtAuthenticated } from '../middleware/jwt-authenticated.middleware'
import jwt from 'jsonwebtoken'
import { loadMocks,createMockRelationships } from '../services/mock.service'
import { allow } from '../services/resource.server.service'

module.exports = function (app) {

  process.on("unhandledRejection", function (reason, p) {
    console.log("Unhandled", reason, p); // log all your errors, "unsuppressing" them.
    throw reason; // optional, in case you want to treat these as errors
  });

  app.post('/login', (req, res) => {
    login(req)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).json(err))
  });

  app.post('/user/new', function (req, res) {
    newUser(req.body)
      .then((user) => res.json(user))
      .catch((err) => res.status(500).json(err))
  });

  app.post('/exists/:entity/', function (req, res) {
    checkProps(req.body)
      .then((result) => res.status((result) ? 500 : 200).json(result))
      .catch((err) => res.status(500).json(err))
  });


  app.get('/oauth/facebook', passport.authenticate('facebook', {
    scope: ['email']
  }));

  app.get('/oauth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/',
    successRedirect: '/',
    scope: ['email']
  }));

  app.get('/oauth/google',
    passport.authenticate('google', {scope: config.google.scope}),
    function (req, res) {
      // The request will be redirected to Google for authentication, so this
      // function will not be called.
    });

  app.get('/oauth/google/callback',
    passport.authenticate('google', {failureRedirect: '/'}),
    function (req, res) {

      let authUser = req.user;
      authUser["token"] = jwt.sign(authUser, config.jwtSecret, {
        expiresIn: 1440 * 60 * 7// expires in 24 hours * 7
      });
      res.redirect('http://bandaid.com:3000/oauth-profile/' + authUser["token"]);
    });

  app.get('/logout', function (req, res) {
    //req.session.user = null;
    req.logout();
    return res.json({});
  });

  app.get('/mocks', (req, res) => {
    //loadMocks();
    createMockRelationships()
    return res.json({})
  });


  //check jwt


// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------
  app.get('/loadAuth', isJwtAuthenticated, (req, res) => res.json(req.user))

  app.get('/users', isJwtAuthenticated, (req, res) =>
    getUsers().then((users) => res.json(users))
      .catch((err) => res.json(err))
  )

  app.get('/profile', isJwtAuthenticated, (req, res) =>
    getProfile(req.user._id).then((user) => res.json(user))
      .catch((err) => res.json(err))
  )
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, config.app.profileImgPath)
    },
    filename: function (req, file, cb) {
      const fileName = handleProfileImageSave(file.originalname,req.user._id)
      cb(null,fileName)

    }
  })

  var upload = multer({ storage: storage })
  app.post('/profile', isJwtAuthenticated, upload.single('imgFile'),  (req, res, next) =>{
    if(req.file) {
      delete req.file
      req.body['photo'] = true
      console.log('req.body',req.body)
    }
    req.body = JSON.parse(JSON.stringify(req.body));
    postProfile(req).then((user) => res.json(user))
      .catch((err) => res.json(err))
  })


  app.post('/resource', isJwtAuthenticated,  (req, res) => {
    if (req.user.role.indexOf('admin') >= 0) {
      allow(req.body)
        .then((result) => res.json(result))
        .catch((err) => res.json(err))

    }
  })
}