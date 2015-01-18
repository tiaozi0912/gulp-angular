(function() {
  'use strict';

  var User = require('./models/User');
  var _ = require('underscore');
  var request = require('request');
  var fs = require('fs');
  var readline = require('readline');
  var stream = require('stream');
  var IP = require('./models/IP');

  var mockIPLocations = require('./data/mock_ip_locations');

  function _genErrHandler(res, err, msg) {
    msg = msg || 'Something went wrong. Please try later.';
    console.log(err);
    return res.status(400).send({ message: msg });
  }

  module.exports = function(router) {
    router.route('/signup')
      .post(function(req, res) {
        var params = req.param('user', {}),
            errMsg,
            createdUser;

        User.query('SELECT id FROM users WHERE ?', {email: params.email}, function(err, results) {
          if (err) {
            return _genErrHandler(res, err);
          }

          // Check if the email is taken
          if (results.length > 0) {
            res.status(400).send({
              message: 'The email is taken.'
            });
          } else {
            // Create user
            try {
              User.create(params, function(err, result) {
                if (err) {
                  return _genErrHandler(res, err);
                }

                createdUser = _.omit(params, 'password');
                createdUser.id = result.insertId;

                req.session.currentUser = createdUser;

                res.send({
                  id: req.session.id,
                  user: createdUser,
                  message: 'Account created succussfully.'
                });
              });
            } catch (e) { // Validation errors
              if (_.isArray(e) && e[0].message) {
                errMsg = _.map(e, function(error) {
                  return error.message
                }).join(' ');
              } else {
                errMsg = e.toString();
              }

              res.status(400).send({
                message: errMsg
              });
            }
          }
        });
      });

    router.route('/signin')
      .post(function(req, res) {
        var params = req.param('user', {}),
            errMsg,
            user;

        User.query('SELECT * FROM users WHERE ?', {email: params.email}, function(err, users) {
          if (err) {
            return _genErrHandler(res, err);
          }

          if (users.length) {
            user = new User(users[0]);
            if (user.validPassword(params.password)) {
              // Sign in user
              req.session.currentUser = _.omit(user.data, 'password');

              return res.send({
                id: req.session.id,
                user: req.session.currentUser,
                message: 'Signed in succussfully.'
              });
            }
          }

          res.status(400).send({
            message: 'Invalid password and email combination.'
          });
        });
      });

    router.get('/signout', function(req, res) {
      req.session.currentUser = null;
      res.send({
        message: 'Signed out successfully.'
      });
    });

    router.get('/reauthorize', function(req, res) {

      if (req.session && req.session.currentUser) {
        res.send({
          id: req.session.id,
          user: req.session.currentUser
        });
      } else {
        res.status(401).send({
          message: 'Not signed in or session has expired.'
        });
      }
    });

    // @todo: check auth
    router.get('/auth/voice_usage', function(req, res) {
      // Assuming signed in
      var currentUser = new User(req.session.currentUser),
          start = req.param('start'),
          //start = new Date('2014-12-17T23:59:59').getTime(),
          end = req.param('end'),
          interval = req.param('interval');
          //end = new Date('2014-12-18T23:59:59').getTime();

      currentUser.getVoiceUsage(function(err, data) {
        if (err) {
          return _genErrHandler(res, err);
        }

        res.send({
          data: data
        });
      }, start, end, interval);
    });

    router.get('/auth/channel_users', function(req, res) {
      // Assuming signed in
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

        // count the participants number in each channel
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

        res.send({
          data: data
        });
      }, start, end, interval);
    });

    router.get('/auth/ip_locations', function(req, res) {
      // Assuming signed in
      var currentUser = new User(req.session.currentUser),
          start = req.param('start'),
          end = req.param('end'),
          interval = req.param('interval'),
          ipLocationURL = 'http://report.agoralab.co:8082/iplocation?ips=',
          ips = [],
          tracker = {},
          data;

      // Process data
      data = _.reject(mockIPLocations, function(location) {
        return !_.isNumber(location.long) || !_.isNumber(location.lat);
      });

      data = _.groupBy(data, function(d) {
        return d.city;
      });

      data = _.map(data, function(arr, city) {
        arr[0].count = arr.length;
        return arr[0];
      });

      return res.send({
        data: data
      });

      currentUser.getChannelUsersInfo(function(err, users) {
        if (err) {
          return _genErrHandler(res, err);
        }

        _.each(users, function(u) {
          if (!tracker[u.ip]) {
            tracker[u.ip] = 1;
            ips.push(u.ip);
          } else {
            tracker[u.ip] += 1;
          }
        });

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

          console.log('output ip locations number: ' + ipLocations.length);

          res.send({data: ipLocations});
        });
      }, start, end, interval);
    });

    router.get('/load_ip_data', function(req, res) {
      var path = '/Users/yujun/developer/Agora/IP2LOCATION-LITE-DB11.CSV.cpp.txt',
          instream = fs.createReadStream(path),
          rl = readline.createInterface({
            input: instream,
            output: null,
            terminal: false
          }),
          fields = ['`start_ip`', '`end_ip`', '`country_code`', '`country`', '`province`', '`city`', '`lat`', '`long`', '`postcode`', '`timezone`'],
          query = 'INSERT INTO ips (' + fields.join(',') + ') VALUES ?',
          tmpQuery = '',
          batchCount = 25000,
          count = 0,
          ipInfos = [],
          ipInfosBatch = [];

      function loadDataToDB(ipInfos) {
        if (ipInfos.length) {
          ipInfosBatch = ipInfos.splice(0, batchCount);

          IP.query(query, [ipInfosBatch], function(err) {
            if (err) {
              return _genErrHandler(err);
            }
            count += 1;

            console.log('=== ' + count * batchCount / 1000 + 'k lines loaded. ===');

            loadDataToDB(ipInfos);
          });
        } else {
          res.send("data loaded to db");
        }
      }

      rl.on('line', function(line) {
        if (!line || line.length === 0){
          return;
        }

        ipInfos.push(line.split(' '));
      });

      rl.on('close', function() {
        loadDataToDB(ipInfos);
      });
    });
  };
})();
