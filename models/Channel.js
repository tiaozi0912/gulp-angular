(function() {
  'use strict';

  var DBModel = require('./DBModel');

  var Channel = new DBModel('channels', {
    db: 'voice_online'
  });

  module.exports = Channel;
})();
