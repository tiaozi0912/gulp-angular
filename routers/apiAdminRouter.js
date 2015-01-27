(function() {
  'use strict';

  var express = require('express');
  var router = express.Router();

  var User = require('../models/User');

  // Helper functions
  function _genErrHandler(res, err, msg) {
    msg = msg || 'Something went wrong. Please try later.';
    console.log(err);
    return res.status(400).send({ message: msg });
  }

  /** --- Define before filter for authenticate --- */

  function requireAdminAuth(req, res, next) {
    if (!req.session.currentUser || !new User(req.session.currentUser).isAdmin()) {
      res.status(401).send({
        message: 'Not authenticated.'
      });

      return;
    }

    next();
  }

  /** --- Define controllers --- */

  // @todo: pagination
  function usersCtrl(req, res) {
    User.findAll(function(err, users) {
      if (err) {
        return _genErrHandler(res, err);
      }

      res.send({data: users});
    });
  }

  /** --- Check authentication before passing to other controllers --- */

  router.use(requireAdminAuth);

  /** --- Hook controllers up with paths --- */

  router.get('/users', usersCtrl);

  module.exports = router;
})();

