(function() {
  'use strict';

  var User = require('./models/User');
  var _ = require('underscore');

  function _genErrHandler(res, err, msg) {
    msg = msg || 'Something went wrong. Please try later.';
    console.log(err);
    res.status(400).send({ message: msg });
  }

  module.exports = function(router) {
    router.route('/signup')
      .post(function(req, res) {
        var params = req.param('user', {}),
            errMsg,
            createdUser;

        console.log(params.password);
        console.log(User.generateHash(params.password));

        User.query('SELECT id FROM users WHERE ?', {email: params.email}, function(err, results) {
          if (err) {
            _genErrHandler(res, err);
            return;
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
                  _genErrHandler(res, err);
                  return;
                }

                createdUser = _.omit(params, 'password');
                createdUser.id = result.insertId;

                req.session.currentUser = createdUser;

                res.send({
                  id: req.session.id,
                  user: createdUser,
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
      });

    router.route('/signin')
      .post(function(req, res) {
        var params = req.param('user', {}),
            errMsg,
            user;

        User.query('SELECT * FROM users WHERE ?', {email: params.email}, function(err, users) {
          if (err) {
            _genErrHandler(res, err);
            return;
          }

          if (users.length) {
            user = new User(users[0]);
            if (user.validPassword(params.password)) {
              // Sign in user
              req.session.currentUser = _.omit(user.data, 'password');

              res.send({
                id: req.session.id,
                user: req.session.currentUser,
                message: 'Signed in succussfully.'
              });

              return;
            }
          }

          res.status(400).send({
            message: 'Invalid password and email combination.'
          });
        });
      });

    router.get('/signout', function(req, res) {
      req.session.currentUser = null;
      res.send({
        message: 'Signed out successfully.'
      });
    });

    router.get('/reauthorize', function(req, res) {
      console.log('session:');
      console.log(req.session);

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
    });
  };
})();
