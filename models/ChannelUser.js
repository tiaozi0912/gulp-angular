(function() {
  'use strict';

  var DBModel = require('./DBModel');

  var ChannelUser = new DBModel('users', {
    db: 'voice_online'
  });

  module.exports = ChannelUser;
})();
