(function() {
  'use strict';

  var User = require('./models/User');
  var _ = require('underscore');

  module.exports = function(router) {
    router.route('/signup')
      .post(function(req, res, next) {
        var params = req.param('user', {}),
            errMsg,
            createdUser;

        User.query('SELECT 1 from users WHERE ?', {email: params.email}, function(err, results) {

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
                  console.log(err);
                  res.status(400).send({
                    message: 'Something went wrong. Please try later.'
                  });
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
            } catch (e) {
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
  };
})();
