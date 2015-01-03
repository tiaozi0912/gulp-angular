(function() {
  'use strict';

  var bcrypt = require('bcrypt-nodejs');
  var DBModel = require('./DBModel');

  var User = function() {

  };

  User.prototype = new DBModel('users');

  // generating a hash
  User.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  // checking if password is valid
  User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  module.exports = User;
})();
