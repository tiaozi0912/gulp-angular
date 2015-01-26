(function() {
  'use strict';

  var express = require('express');
  var router = express.Router();

  var User = require('../models/User');
  var _ = require('underscore');

  // Helper functions
  function _genErrHandler(res, err, msg) {
    msg = msg || 'Something went wrong. Please try later.';
    console.log(err);
    return res.status(400).send({ message: msg });
  }

  /** --- Define controllers --- */

  function signupCtrl(req, res) {
    var params = req.param('user', {}),
        errMsg,
        createdUser;

    User.query('SELECT id FROM users WHERE ?', {email: params.email}, function(err, results) {
      if (err) {
        return _genErrHandler(res, err);
      }

      // Check if the email is taken
      if (results.length > 0) {
        res.status(400).send({
          message: 'The email is taken.'
        });
      } else {
        // Create user
        try {
          User.create(params, function(err, result) {
            if (err) {
              return _genErrHandler(res, err);
            }

            createdUser = new User(result[0]);

            createdUser.sendEmailVerification();

            User.saveInSession(req.session, createdUser.data);

            res.send({
              id: req.session.id,
              user: createdUser.data,
              message: 'Account created succussfully.'
            });
          });
        } catch (e) { // Validation errors
          if (_.isArray(e) && e[0].message) {
            errMsg = _.map(e, function(error) {
              return error.message
            }).join(' ');
          } else {
            errMsg = e.toString();
          }

          res.status(400).send({
            message: errMsg
          });
        }
      }
    });
  }

  function signinCtrl(req, res) {
    var params = req.param('user', {}),
        errMsg,
        user,
        userJSON;

    User.findByEmail(params.email, function(err, users) {
      if (err) {
        return _genErrHandler(res, err);
      }

      if (users.length) {
        userJSON = users[0];
        user = new User(userJSON);

        if (user.validPassword(params.password, userJSON.password)) {

          // Sign in user
          User.saveInSession(req.session, userJSON);

          return res.send({
            id: req.session.id,
            user: req.session.currentUser,
            message: 'Signed in succussfully.'
          });
        }
      }

      res.status(400).send({
        message: 'Invalid password and email combination.'
      });
    });
  }

  function signoutCtrl(req, res) {
    req.session.currentUser = null;
    res.redirect('/');
  }

  function reauthorizeCtrl(req, res) {
    if (req.session && req.session.currentUser) {
      res.send({
        id: req.session.id,
        user: req.session.currentUser
      });
    } else {
      res.status(401).send({
        message: 'Not signed in or session has expired.'
      });
    }
  }
  
  /** --- Hook controllers up with paths --- */
  
  router.post('/signup', signupCtrl);
  router.post('/signin', signinCtrl);
  router.get('/signout', signoutCtrl);
  router.get('/reauthorize', reauthorizeCtrl);

  module.exports = router;
})();

