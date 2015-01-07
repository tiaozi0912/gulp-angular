(function() {
  'use strict';

  var bcrypt = require('bcrypt-nodejs');
  var DBModel = require('./DBModel');
  var Channel = require('./Channel');
  var ChannelUser = require('./ChannelUser');

  var EMAIL_REGEX =/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  var User = new DBModel('users', {
    validates: {
      email: { presence: true, regex: EMAIL_REGEX, minLength: 3 },
      name: { presence: true, minLength: 2},
      company_name: { presence: true, minLength: 2},
      password: { presence: true, minLength: 6 }
    }
  });

  /**
   * Generating a hash
   */
  User.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  /**
   * Create a new user
   */
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

  /**
   * Check if the password is valid
   *
   * @param {String} password - unhashed password
   * @return {Boolean} isValid
   */
  User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.data.password);
  };

  /**
   * Get the voice usage info from start date to the end date every interval(day, hour etc)
   *
   * @param {Function} cb - callback function, taking err and res as arguments
   *   {Object} res - keys: usage(in sec), datetime(e.g. 2014-12-01 or 2014-12-01 12), vendorID
   * @param {Int} start - unix timestamp in sec
   * @param {Int} end   - unix timestamp in sec
   * @param {String} interval - 'day', 'hour', default is 'day'
   */
  User.prototype.getVoiceUsage = function(cb, start, end, interval) {
    var vendorId = this.data.vendor_id;

    interval = interval || 'day';

    if (interval === 'day') {
      Channel.query("SELECT SUM(duration) AS 'usage', DATE_FORMAT(FROM_UNIXTIME(`destroy`), '%Y-%m-%d') AS 'datetime', vendorID FROM channels WHERE vendorID = ? AND destroy >= ? AND destroy <= ? GROUP BY datetime", [vendorId, start, end], cb);
    }

    if (interval === 'hour') {
      Channel.query("SELECT SUM(duration) AS 'usage', DATE_FORMAT(FROM_UNIXTIME(`destroy`), '%Y-%m-%d %H') AS 'datetime', vendorID FROM channels WHERE vendorID = ? AND destroy >= ? AND destroy <= ? GROUP BY datetime", [vendorId, start, end], cb);
    }
  };

  /**
   * Get the channel users info from start date to the end date every interval(day, hour etc)
   *
   * @param {Function} cb - callback function, taking err and res as arguments
   *   {Object} res - keys: duration, uid, datetime, vendorID, cid, ip, channel_duration
   * @param {Int} start - unix timestamp in sec
   * @param {Int} end   - unix timestamp in sec
   * @param {String} interval - 'day', 'hour', default is 'day'
   */
  User.prototype.getChannelUsersInfo = function(cb, start, end, interval) {
    var vendorId = this.data.vendor_id;

    interval = interval || 'day';

    if (interval === 'day') {
      ChannelUser.query("SELECT users.duration, users.uid, users.cid, users.ip, DATE_FORMAT(FROM_UNIXTIME(`quit`), '%Y-%m-%d') AS 'datetime', users.vendorID, channels.duration AS channel_duration FROM users INNER JOIN channels ON channels.cid = users.cid WHERE users.vendorID = ? AND users.quit >= ? AND users.quit <= ?", [vendorId, start, end], cb);
    }

    if (interval === 'hour') {
      ChannelUser.query("SELECT users.duration, users.uid, users.cid, users.ip, DATE_FORMAT(FROM_UNIXTIME(`quit`), '%Y-%m-%d %H') AS 'datetime', users.vendorID, channels.duration AS channel_duration FROM users INNER JOIN channels ON channels.cid = users.cid WHERE users.vendorID = ? AND users.quit >= ? AND users.quit <= ?", [vendorId, start, end], cb);
    }
  };

  module.exports = User;
})();
