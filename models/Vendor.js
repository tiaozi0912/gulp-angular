(function() {
  'use strict';

  var DBModel = require('./DBModel');

  var Vendor = new DBModel('vendor_info', {
    db: 'vendors'
  });

  module.exports = Vendor;
})();
