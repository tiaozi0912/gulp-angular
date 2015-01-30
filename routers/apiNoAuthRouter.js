(function() {
  'use strict';

  var express = require('express');
  var router = express.Router();

  var User = require('../models/User');
  var _ = require('underscore');
  var mailer = require('../lib/mailer');

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
              return error.message;
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
          User.saveInSession(req.session, user.data);

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


  function verifyEmailCtrl(req, res) {
    var token = req.params.token,
        redirect = '/dashboard/overview',
        successMsg = 'Email is verified successfully.';

    User.query('SELECT * FROM users WHERE ?', {access_token: token}, function(err, users) {
      if (err) {
        return _genErrHandler(res, err);
      }

      if (!users.length) {
        res.send({
          message: 'The link is wrong or expired.'
        });
      } else {
        // Signin the user, clear the access_token and redirect to dashboard page
        User.save({access_token: null, status: 1, id: users[0].id}, function(err, result) {
          if (err || !result.length) {
            return _genErrHandler(res, err);
          }

          mailer.sendEmailVerifiedNotification(result[0]);

          User.saveInSession(req.session, result[0]);
          res.message({ content:successMsg, type: 'success' });

          res.redirect(redirect);
        });
      }
    });
  }

  function resetPasswordCodeCtrl(req, res) {
    var email = req.body.email,
        user;

    User.findByEmail(email, function(err, users) {
      if (!err && users.length) {

        user = new User(users[0]);

        user.sendResetPasswordEmail();

        res.send({
          message: 'Security token is sent to your email.'
        });
      } else {
        _genErrHandler(res, err);
      }
    });
  }

  function resetPasswordCtrl(req, res) {
    var email = req.body.email,
        password = req.body.password,
        token = req.body.access_token,
        user,
        data;

    User.findByEmail(email, function(err, users) {
      if (err || !users.length) {
        return _genErrHandler(res, err);
      }

      user = users[0];

      if (user.access_token === token) {
        data = {
          password: User.generateHash(password),
          id: user.id,
          access_token: null
        };

        // Set email verified if isn't
        if (user.status === 0) {
          data.status = 1;
        }

        User.save(data, function(err, users) {
          if (err || !users.length) {
            return _genErrHandler(res, err);
          }

          User.saveInSession(req.session, users[0]);
          res.send({
            message: 'Password reset successfully.',
            id: req.session.id,
            user: req.session.currentUser
          });
        });
      } else {
        res.status(400).send({
          message: 'Invalid security code.'
        });
      }
    });
  }

  /** --- Hook controllers up with paths --- */

  router.post('/signup', signupCtrl);
  router.post('/signin', signinCtrl);
  router.get('/signout', signoutCtrl);
  router.get('/reauthorize', reauthorizeCtrl);
  router.get('/verify_email/:token', verifyEmailCtrl);
  router.post('/reset_password_code', resetPasswordCodeCtrl);
  router.post('/reset_password', resetPasswordCtrl);

  module.exports = router;
})();

