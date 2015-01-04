(function() {
  'use strict';

  var bcrypt = require('bcrypt-nodejs');
  var DBModel = require('./DBModel');

  var EMAIL_REGEX =/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  var User = new DBModel('users', {
    validates: {
      email: { presence: true, regex: EMAIL_REGEX, minLength: 3 },
      name: { presence: true, minLength: 2},
      company_name: { presence: true, minLength: 2},
      password: { presence: true, minLength: 6 }
    }
  });

  // generating a hash
  User.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  User.create = function(data, cb) {
    var validation = User.validates(data);
    if ( validation === true ) {
      // Hash password
      data.password = User.generateHash(data.password);

      User.save(data, cb);
    } else {
      // throw the validation errors
      throw validation;
    }
  };

  // checking if password is valid
  User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  module.exports = User;
})();
