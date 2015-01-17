(function() {
  'use strict';

  var DBModel = require('./DBModel');

  var IP = new DBModel('ips');

  module.exports = IP;
})();
