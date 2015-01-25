(function() {
  'use strict';

  var bcrypt = require('bcrypt-nodejs');
  var DBModel = require('./DBModel');
  var Channel = require('./Channel');
  var ChannelUser = require('./ChannelUser');
  var Vendor = require('./Vendor');
  var _ = require('underscore');
  var emailSender = require('../emailSender');

  var EMAIL_REGEX =/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  var User = new DBModel('users', {
    validates: {
      email: { presence: true, regex: EMAIL_REGEX, minLength: 3 },
      name: { presence: true, minLength: 2},
      company_name: { presence: false, minLength: 2},
      phone: { presence: false, minLength: 10 },
      password: { presence: true, minLength: 6 }
    }
  });

  /**
   * Get the datetime of the start of the month in UTC
   *
   * @return {Date} startDatetime
   */
  function getMonthStartDatetime() {
    var currDatetime = new Date(),
        currMonth = currDatetime.getMonth() + 1,
        currYear = currDatetime.getFullYear(),
        monthStart;

    if (currMonth < 10) {
      currMonth = '0' + currMonth;
    }

    monthStart = [currYear,currMonth, '01'].join('-') + 'T00:00:00Z';

    return new Date(monthStart);
  }

  function getAPIKey(vendorId, userJSON, cb) {
    Vendor.query('SELECT `key` FROM vendor_info WHERE ?', { vendor_id: vendorId }, function(err, res) {
      console.log(err);
      console.log(res);
      if (!err && res[0]) {
        userJSON.key = res[0].key;
      }

      cb(err, [userJSON]);
    });
  }

  User.STATUSES = {
    0: 'email not verified',
    1: 'email verified but API key not received',
    2: 'API key received'
  };

  /**
   * Generating a hash
   */
  User.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  User.generateRandomString = function() {
    return Math.random().toString(36).substring(2);
  };

  /**
   * Store default model save method to User._save
   */
  User._save = User.save;

  /**
   * Override the default model save method
   * Get the key in the result userJSON
   */
  User.save = function(data, cb) {
    var userJSON;

    User._save(data, function(err, res) {
      userJSON = res[0];

      if (!err && userJSON) {
        getAPIKey(userJSON.vendor_id, userJSON, cb);
      } else {
        cb(err, res);
      }
    });
  };

  /**
   * Create a new user
   */
  User.create = function(data, cb) {
    var validation = User.validates(data),
        userJSON;

    if ( validation === true ) {
      // Hash password
      data.password = User.generateHash(data.password);

      User._save(data, function(err, res) {
        userJSON = res[0];

        if (userJSON && !err) {
          getAPIKey(userJSON.vendor_id, userJSON, cb);
        } else {
          cb(err, [res]);
        }
      });
    } else {
      // throw the validation errors
      throw validation;
    }
  };

  /**
   * Properties that won't save in session
   */
  User._privateProperties = ['password'];

  User.saveInSession = function(session, userJSON) {
    session.currentUser = _.omit(userJSON, User._privateProperties);

    return session.currentUser;
  };

  /**
   * Check if the password is valid
   *
   * @param {String} password - unhashed password
   * @return {Boolean} isValid
   */
  User.prototype.validPassword = function(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
  };

  User.prototype.getCurrMonthMinutesUsage = function(cb) {
    var start = getMonthStartDatetime().getTime() / 1000,
        end = new Date().getTime() / 1000;

    // @todo: remove this
    start = 1417420800;
    end= 1420012800;

    this.getMinutesUsage(cb, start, end);
  };

  User.prototype.getMinutesUsage = function(cb, start, end) {
    Channel.query('SELECT SUM(duration / 60) AS \'minutes\', vendorID FROM channels WHERE vendorID = ? AND destroy >= ? AND destroy <= ?', [this.data.vendor_id, start, end], cb);
  };

  /**
   * Get the voice usage info from start date to the end date every interval(day, hour etc)
   *
   * @param {Function} cb - callback function, taking err and res as arguments
   *   {Object} res - keys: usage(in sec), datetime(e.g. 2014-12-01 or 2014-12-01 12), vendorID
   * @param {Int} start - unix timestamp in sec
   * @param {Int} end   - unix timestamp in sec
   * @param {String} interval - 'day', 'hourly', default is 'day'
   */
  User.prototype.getVoiceUsage = function(cb, start, end, interval) {
    var vendorId = this.data.vendor_id;

    interval = interval || 'day';

    if (interval === 'day') {
      Channel.query('SELECT SUM(duration) AS \'usage\', DATE_FORMAT(FROM_UNIXTIME(`destroy`), \'%Y-%m-%d\') AS \'datetime\', vendorID FROM channels WHERE vendorID = ? AND destroy >= ? AND destroy <= ? GROUP BY datetime', [vendorId, start, end], cb);
    }

    if (interval === 'hourly') {
      Channel.query('SELECT SUM(duration) AS \'usage\', DATE_FORMAT(FROM_UNIXTIME(`destroy`), \'%Y-%m-%d %H\') AS \'datetime\', vendorID FROM channels WHERE vendorID = ? AND destroy >= ? AND destroy <= ? GROUP BY datetime', [vendorId, start, end], cb);
    }
  };

  /**
   * Get the channel users info from start date to the end date every interval(day, hour etc)
   *
   * @param {Function} cb - callback function, taking err and res as arguments
   *   {Object} res - keys: duration, uid, datetime, vendorID, cid, ip, channel_duration
   * @param {Int} start - unix timestamp in sec
   * @param {Int} end   - unix timestamp in sec
   * @param {String} interval - 'day', 'hourly', default is 'day'
   */
  User.prototype.getChannelUsersInfo = function(cb, start, end, interval) {
    var vendorId = this.data.vendor_id;

    interval = interval || 'day';

    if (interval === 'day') {
      ChannelUser.query('SELECT users.duration, users.uid, users.cid, users.ip, DATE_FORMAT(FROM_UNIXTIME(`quit`), \'%Y-%m-%d\') AS \'datetime\', users.vendorID, channels.duration AS channel_duration FROM users INNER JOIN channels ON channels.cid = users.cid WHERE users.vendorID = ? AND users.quit >= ? AND users.quit <= ?', [vendorId, start, end], cb);
    }

    if (interval === 'hourly') {
      ChannelUser.query('SELECT users.duration, users.uid, users.cid, users.ip, DATE_FORMAT(FROM_UNIXTIME(`quit`), \'%Y-%m-%d %H\') AS \'datetime\', users.vendorID, channels.duration AS channel_duration FROM users INNER JOIN channels ON channels.cid = users.cid WHERE users.vendorID = ? AND users.quit >= ? AND users.quit <= ?', [vendorId, start, end], cb);
    }
  };

  /**
   * Get complete data for downloading
   *
   * @param {String} interval - ''
   */
  User.prototype.getCompleteData = function(cb, start, end, interval) {

  };

  User.prototype.isAdmin = function() {
    return this.data.role === 1;
  };

  User.prototype.sendEmailVerification = function() {
    var token = User.generateRandomString(),
        host = 'http://localhost:9000',
        subject = 'Verify your Agora account',
        email = 'wyj0912@gmail.com', // this.data.email
        url, content;

    if (process.env.NODE_ENV === 'production') {
      host = 'http://agora.io';
    }

    url = host + '/api/verify_email/' + token;

    User.save({access_token: token, id: this.data.id}, function() {});

    content = '<p>Hi ' + this.data.name + ':</p><br>' + '<p> Welcome to Agora! Please verify your email by clicking the following link: </p>' + '<a href="' + url + '">' + url + '</a><br>' + '<p> Best regards, </p>' + '<p>Agora Team</p><br>' + '<br><p>(If you did not request an Agora account, please ignore this message.)</p>';

    emailSender.send(content, subject, [{
      email: email,
      name: this.data.name,
      type: 'to'
    }]);
  };

  module.exports = User;
})();
