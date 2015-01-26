(function() {
  'use strict';

  var express = require('express');
  var router = express.Router();

  var User = require('../models/User');
  var ChannelUser = require('../models/ChannelUser');
  var _ = require('underscore');
  var request = require('request');
  var fs = require('fs');
  var readline = require('readline');
  var stream = require('stream');
  var IP = require('../models/IP');
  var csv = require('fast-csv');
  
  /** --- Define before filter for authenticate --- */

  function requireAuth(req, res, next) {
    if (!req.session.currentUser) {
    	res.status(401).send({
    		message: 'Not authenticated.'
    	});

    	return;
    }

    next();
  }
  
  /** --- Define controllers --- */

  function voiceUsageCtrl(req, res) {
    // Assuming signed in
    var currentUser = new User(req.session.currentUser),
        start = req.param('start'),
        //start = new Date('2014-12-17T23:59:59').getTime(),
        end = req.param('end'),
        interval = req.param('interval'),
        minutes = 0;
        //end = new Date('2014-12-18T23:59:59').getTime();

    currentUser.getCurrMonthMinutesUsage(function(err, minutesUsage) {
      if (err) {
        return _genErrHandler
      }

      if (minutesUsage[0] && minutesUsage[0].minutes) {
        minutes = minutesUsage[0].minutes;
      }

      currentUser.getVoiceUsage(function(err, data) {
        if (err) {
          return _genErrHandler(res, err);
        }

        res.send({
          data: data,
          minutesUsage: minutes,
          notifications: res.locals.messages
        });
      }, start, end, interval);
    });
  }

  function channelUsersCtrl(req, res) {
    var currentUser = new User(req.session.currentUser),
        start = req.param('start'),
        //start = new Date('2014-12-17T23:59:59').getTime(),
        end = req.param('end'),
        interval = req.param('interval');
        //end = new Date('2014-12-18T23:59:59').getTime();

    currentUser.getChannelUsersInfo(function(err, data) {
      if (err) {
        return _genErrHandler(res, err);
      }

      res.send({
        data: data
      });
    }, start, end, interval);
  }

  function ipLocationsCtrl(req, res) {
    var currentUser = new User(req.session.currentUser),
        start = req.param('start'),
        end = req.param('end'),
        interval = req.param('interval'),
        ipLocationURL = 'http://report.agoralab.co:8082/iplocation?ips=',
        ips = [],
        tracker = {},
        data;
    
    function processIPLocations(IPLocations) {
      var data = _.reject(IPLocations, function(location) {
        return !_.isNumber(location.long) || !_.isNumber(location.lat);
      });

      data = _.groupBy(data, function(d) {
        return d.city;
      });

      data = _.map(data, function(arr, city) {
        arr[0].count = arr.length;
        return arr[0];
      });

      return data;
    }

    // return res.send({
    //   data: processIPLocations(mockIPLocations);
    // });

    currentUser.getChannelUsersInfo(function(err, users) {
      if (err) {
        return _genErrHandler(res, err);
      }

      // _.each(users, function(u) {
      //   if (!tracker[u.ip]) {
      //     tracker[u.ip] = 1;
      //     ips.push(u.ip);
      //   } else {
      //     tracker[u.ip] += 1;
      //   }
      // });

      //ipLocationURL += ips.join(',');

      // request(ipLocationURL, function(error, response, data) {
      //   if (!error && response.statusCode == 200) {
      //     res.send({
      //       data: JSON.parse(data)
      //     });
      //   } else {
      //     _genErrHandler(res, error);
      //   }
      // });
      IP.getIPLocations(ips, function(err, ipLocations) {
        if (err) {
          return _genErrHandler(res, err);
        }

        res.send({
          data: processIPLocations(ipLocations)
        });
      });
    }, start, end, interval);
  }

  function dataDownloadCtrl(req, res) {
    var mimetype = 'text/csv',
        start = req.query.start,
        end = req.query.end,
        period = req.query.period,
        currentUser = new User(req.session.currentUser),
        filename = period;

    currentUser.getCompleteData(function(err, data) {
      if (err) {
        return _genErrHandler(res, err);
      }

      if (!data || !data.length) {
        // Return empty array if there is no data
        return res.send({data: []});
      }

      res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-type', mimetype);

      csv.write(data, {headers: true})
        .pipe(res);
    }, start, end, period);
  }

  function preDataDownloadCtrl(req, res) {
    var start = req.query.start,
        end = req.query.end,
        period = req.query.period,
        currentUser = req.session.currentUser;

    ChannelUser.query('SELECT COUNT(*) AS count FROM users INNER JOIN channels ON channels.cid = users.cid WHERE users.vendorID = ? AND users.quit >= ? AND users.quit <= ?', [currentUser.vendor_id, start, end], function(err, result) {
      if (err) {
        return _genErrHandler(res, err);
      }

      res.send({data: result[0].count});
    });
  }

  function usersUpdateCtrl(req, res) {
    var userId = parseInt(req.params.user_id),
       currentUser = new User(req.session.currentUser),
       userData = req.body,
       user;

    if (userId === currentUser.data.id || currentUser.isAdmin()) {
      User.query('SELECT * FROM users WHERE ?', {id: userId}, function(err, users) {
        if (err || !users.length) {
          return _genErrHandler(res, err);
        }

        userData.id = userId;

        User.save(userData, function(err, result) {
          if (err) {
            return _genErrHandler(res, err);
          }

          // Update session.currentUser
          // @readme: if updating for the other user, the other user' session may out of sync
          if (userId === currentUser.data.id) {
            User.saveInSession(req.session, result[0]);
          }

          res.send({
            message: 'Saved successfully.'
          });
        });
      });
    } else {
      res.status(401).send({
        message: 'Failed. Not authorized.'
      });
    }
  }

  function verifyEmailCtrl(req, res) {
    var token = req.params.token,
        redirect = '/dashboard/overview',
        successMsg = 'Email is verified successfully.';

    User.query('SELECT * FROM users WHERE ?', {access_token: token}, function(err, users) {
      if (err) {
        return _genErrHandler(res, err);
      }

      if (!users.length) {
        res.send({
          message: 'The link is wrong or expired.'
        });
      } else {
        // Signin the user, clear the access_token and redirect to dashboard page
        User.save({access_token: null, status: 1, id: users[0].id}, function(err, result) {
          if (err || !result.length) {
            return _genErrHandler(res, err);
          }

          User.saveInSession(req.session, result[0]);
          res.message({ content:successMsg, type: 'success' });

          res.redirect(redirect);
        });
      }
    });
  }
  
  /** --- Check authentication before passing to other controllers --- */

  router.use(requireAuth);
  
  /** --- Hook controllers up with paths --- */

  router.get('/voice_usage', voiceUsageCtrl);
  router.get('/channel_users', channelUsersCtrl);
  router.get('/ip_locations', ipLocationsCtrl);
  router.get('/data_download', dataDownloadCtrl);
  router.get('/pre_data_download', preDataDownloadCtrl);
  router.put('/users/:user_id', usersUpdateCtrl);
  router.get('/verify_email/:token', verifyEmailCtrl);

  module.exports = router;
})();
