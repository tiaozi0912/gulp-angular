(function() {
  'use strict';

  var User = require('./models/User');

  module.exports = function(router) {
    router.route('/signup')
      .post(function(req, res, next) {
        var params = req.param('user', {});

        User.query('SELECT 1 from users WHERE ?', {email: params.email}, function(err, result) {
          if (result) {
            res.status(400).send({
              message: 'The email is taken.'
            });
          } else {
            params.password = User.generateHash(params.password);
            User.save(params, function(err, user) {
              req.session.currentUser = user;

              res.send({
                id: req.session.id,
                user: user,
                message: 'Account created succussfully.'
              });
            });
          }
        });
      });
  };
})();
