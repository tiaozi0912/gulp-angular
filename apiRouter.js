(function() {
  'use strict';

  var User = require('./models/User');
  var ChannelUser = require('./models/ChannelUser');
  var _ = require('underscore');
  var request = require('request');
  var fs = require('fs');
  var readline = require('readline');
  var stream = require('stream');
  var IP = require('./models/IP');
  var csv = require('fast-csv');

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

                createdUser = new User(result[0]);

                createdUser.sendEmailVerification();

                User.saveInSession(req.session, createdUser.data);

                res.send({
                  id: req.session.id,
                  user: createdUser.data,
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
            user,
            userJSON;

        User.findByEmail(params.email, function(err, users) {
          if (err) {
            return _genErrHandler(res, err);
          }

          if (users.length) {
            userJSON = users[0];
            user = new User(userJSON);

            if (user.validPassword(params.password, userJSON.password)) {

              // Sign in user
              User.saveInSession(req.session, userJSON);

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

    router.get('/auth/data_download', function(req, res) {
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

        console.log(data);

        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', mimetype);

        csv.write(data, {headers: true})
          .pipe(res);
      }, start, end, period);
    });

    router.get('/auth/pre_data_download', function(req, res) {
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
    });

    // router.get('/load_ip_data', function(req, res) {
    //   var path = '/Users/yujun/developer/Agora/IP2LOCATION-LITE-DB11.CSV.cpp.txt',
    //       instream = fs.createReadStream(path),
    //       rl = readline.createInterface({
    //         input: instream,
    //         output: null,
    //         terminal: false
    //       }),
    //       fields = ['`start_ip`', '`end_ip`', '`country_code`', '`country`', '`province`', '`city`', '`lat`', '`long`', '`postcode`', '`timezone`'],
    //       query = 'INSERT INTO ips (' + fields.join(',') + ') VALUES ?',
    //       tmpQuery = '',
    //       batchCount = 25000,
    //       count = 0,
    //       ipInfos = [],
    //       ipInfosBatch = [];

    //   function loadDataToDB(ipInfos) {
    //     if (ipInfos.length) {
    //       ipInfosBatch = ipInfos.splice(0, batchCount);

    //       IP.query(query, [ipInfosBatch], function(err) {
    //         if (err) {
    //           return _genErrHandler(err);
    //         }
    //         count += 1;

    //         console.log('=== ' + count * batchCount / 1000 + 'k lines loaded. ===');

    //         loadDataToDB(ipInfos);
    //       });
    //     } else {
    //       res.send("data loaded to db");
    //     }
    //   }

    //   rl.on('line', function(line) {
    //     if (!line || line.length === 0){
    //       return;
    //     }

    //     ipInfos.push(line.split(' '));
    //   });

    //   rl.on('close', function() {
    //     loadDataToDB(ipInfos);
    //   });
    // });

    router.put('/auth/users/:user_id', function(req, res) {
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
    });

    router.get('/verify_email/:token', function(req, res) {
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
    });
  };
})();
