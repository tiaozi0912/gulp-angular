(function() {
  'use strict';

  var bcrypt = require('bcrypt-nodejs');
  var DBModel = require('./DBModel');
  var Channel = require('./Channel');
  var ChannelUser = require('./ChannelUser');
  var Vendor = require('./Vendor');
  var _ = require('underscore');
  var mailer = require('../lib/mailer');
  var dataFormatter = require('../lib/dataFormatter');

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
      if (!err && res[0]) {
        userJSON.key = res[0].key;
      }

      cb(err, [userJSON]);
    });
  }

  /**
   * Get API Key in bulk
   *
   * @param  {Array}   vendorIds  - array of vendor IDs
   * @param  {Array}   userJSONs  - array of userJSON data
   * @param  {Function} cb
   */
  function batchGetAPIKey(vendorIds, userJSONs, cb) {
    Vendor.query('SELECT `key` FROM vendor_info WHERE vendor_id IN ?', [[vendorIds]], function(err, res) {
      if (!err && res.length) {
        _.each(userJSONs, function(u, i) {
          u.key = res[i] && res[i].key;
        });
      }

      cb(err, userJSONs);
    });
  }

  /**
   * count the participants number in each channel
   */
  function countParticipantsNumber(data) {
    var count = {}, // {cid: count}
        tracker = {},
        c = 0;

    var channelsHash = _.groupBy(data, function(d) {
      return d.cid;
    });

    _.each(channelsHash, function(arr, cid) {
      c = 0;
      tracker = {};
      _.each(arr, function(d) {
        if (!tracker[d.uid]) {
          c += 1;
          tracker[d.uid] = 1;
        }
      });
      count[cid] = c;
    });

    _.each(data, function(d) {
      d.participants_number = count.hasOwnProperty(d.cid) ? count[d.cid] : 0;
    });

    return data;
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

    data.updated_at = new Date().getTime() / 1000;

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
      data.created_at = new Date().getTime() / 1000;
      data.updated_at = data.created_at;

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
   * Find the user by email. It will fetch the api key too
   */
  User.findByEmail = function(email, cb) {
    var userJSON;

    User.query('SELECT * FROM users where ?', {email: email}, function(err, users) {
      userJSON = users[0];
      if (err || !userJSON) {
        cb(err, users);
      } else {
        getAPIKey(userJSON.vendor_id, userJSON, cb);
      }
    });
  };

  User.findAll = function(cb) {
    var vendorIds,
        usersWithVendorId,
        usersWithoutVendorId;

    User.query('SELECT * FROM users', function(err, users) {
      if (err || !users.length) {
        cb(err, users);
      } else {
        usersWithVendorId = _.filter(users, function(u) {
          return u.vendor_id;
        });

        usersWithoutVendorId = _.filter(users, function(u) {
          return !u.vendor_id;
        });

        vendorIds = usersWithVendorId.map(function(u) {
          return u.vendor_id;
        });

        batchGetAPIKey(vendorIds, usersWithVendorId, function(err, users) {
          users = users.concat(usersWithoutVendorId);

          users = users.map(function(u) {
            return _.omit(u, User._privateProperties);
          });

          cb(err, users);
        });
      }
    });
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
    // start = 1417420800;
    // end= 1420012800;

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
      ChannelUser.query('SELECT users.duration, users.uid, users.cid, users.ip, DATE_FORMAT(FROM_UNIXTIME(`quit`), \'%Y-%m-%d\') AS \'datetime\', users.vendorID, channels.duration AS channel_duration FROM users INNER JOIN channels ON channels.cid = users.cid WHERE users.vendorID = ? AND users.quit >= ? AND users.quit <= ?', [vendorId, start, end], function(err, data) {
        if (err || !data.length) {
          cb(err, data);
        } else {
          countParticipantsNumber(data);
          cb(null, data);
        }
      });
    }

    if (interval === 'hourly') {
      ChannelUser.query('SELECT users.duration, users.uid, users.cid, users.ip, DATE_FORMAT(FROM_UNIXTIME(`quit`), \'%Y-%m-%d %H\') AS \'datetime\', users.vendorID, channels.duration AS channel_duration FROM users INNER JOIN channels ON channels.cid = users.cid WHERE users.vendorID = ? AND users.quit >= ? AND users.quit <= ?', [vendorId, start, end], function(err, data) {
        if (err || !data.length) {
          cb(err, data);
        } else {
          countParticipantsNumber(data);
          cb(null, data);
        }
      });
    }
  };

  /**
   * Get complete data for downloading
   *
   * @param {String} period - 'yesterday', 'past_7_days', 'past_30_days', 'past_12_months-monthly', 'past_12_months-yearly'
   */
  User.prototype.getCompleteData = function(cb, start, end, period) {
    var dtFormatter = '%Y-%m-%d',
        vendorId = this.data.vendor_id,
        channelUserSQL = 'SELECT users.duration, users.uid, users.cid, users.ip, DATE_FORMAT(FROM_UNIXTIME(`quit`), \'' + dtFormatter + '\') AS \'datetime\', users.vendorID, channels.duration AS channel_duration FROM users INNER JOIN channels ON channels.cid = users.cid WHERE users.vendorID = ? AND users.quit >= ? AND users.quit <= ?',
        //usageSQL = 'SELECT SUM(duration) / 60 AS \'total minutes\', DATE_FORMAT(FROM_UNIXTIME(`destroy`), \'' + dtFormatter + '\') AS \'datetime\', vendorID FROM channels WHERE vendorID = ? AND destroy >= ? AND destroy <= ? GROUP BY datetime';
        usageSQL = 'SELECT SUM(duration) / 60 AS \'total minutes\' FROM channels WHERE vendorID = ? AND destroy >= ? AND destroy <= ?';

    console.log(period);

    ChannelUser.query(channelUserSQL, [vendorId, start, end], function(err, data) {
      if (err || !data.length) {
        cb(err, data);
      } else {
        var dataDict = {},
            groupsData,
            matrix = [],
            rows = [],
            row = {};

        var count = 0;

        countParticipantsNumber(data);

        dataDict[end] = data;

        _.each(dataFormatter, function(obj, dataCategory) {
          if (obj.groups) {
            _.each(obj.groups, function(g, dataSubCategory) { // loop through groups
              groupsData = dataFormatter.getGroupsData(dataDict, dataSubCategory, g.values, obj.count);

              matrix.push(dataFormatter.formatData(groupsData, dataCategory, dataSubCategory));

              count += 1;
            });
          }
        });

        // matrix -> rows: [ [{...}, ...], [...] ] -> [ {...}, ... ]
        for (var i = 0; matrix[0][i]; i++) {
          row = {};

          for (var j = 0; matrix[j]; j++) {
            _.extend(row, matrix[j][i]);
          }

          rows.push(row);
        }

        Channel.query(usageSQL, [vendorId, start, end], function(err, data) {
          _.extend(rows[0], data[0]);

          cb(err, rows);
        });
      }
    });
  };

  User.prototype.isAdmin = function() {
    return this.data.role === 1;
  };

  User.prototype.sendEmailVerification = function() {
    var token = User.generateRandomString();

    // @readme: may result to bug if the token is not saved scucessfully.
    User.save({access_token: token, id: this.data.id}, function() {});

    mailer.sendEmailVerification(this.data, token);
  };

  module.exports = User;
})();
