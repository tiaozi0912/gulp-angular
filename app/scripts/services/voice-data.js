(function() {
  'use strict';

  var voiceData = function($http) {
    /**
     * Cache data
     *
     * Data cache are set by pages
     * so that it won't effect each other when switch pages
     *
     * @todo: set expiration
     */
    this.data = {
      overview: {
        usage: { day: null, hourly: null },
        channelUsers: { day: null, hourly: null }
      },
      participants: {
        usage: { day: null, hourly: null },
        channelUsers: { day: null, hourly: null }
      },
      calls: {
        usage: { day: null, hourly: null },
        channelUsers: { day: null, hourly: null }
      }
    };

    this.resources = {
      getVoiceUsage: function(params) {
        var url = '/api/dashboard/voice_usage';

        return $http.get(url, {params: params});
      },
      getChannelUsersInfo: function(params) {
        var url = '/api/dashboard/channel_users_info';

        return $http.get(url, {params: params});
      },
      getIPInfo: function(channelUsers) {
        var url = 'http://report.agoralab.co:8082/iplocation?ips=',
            tracker = {}, // {ip: count}
            param = [];

        _.each(channelUsers, function(u) {
          if (!tracker[u.ip]) {
            tracker[u.ip] = 1;
            param.push(u.ip);
          } else {
            tracker[u.ip] += 1;
          }
        });

        param = param.join(',');
        param = '120.204.247.114,202.38.64.3';
        url += param + '&jsonp=?';// + '&callback=JSON_CALLBACK';

        //return $http.jsonp(url);
        //
        $.ajax({
          url: url,
          contentType: 'application/javascript'
        });
      }
    };

    /**
     * Calculate which group d belongs to
     *
     * @param {Number} d - the number that to be calculated
     * @param {Array} groups - sorted array of numbers indicating the borders for each group
     * @return {Number} value - a number between 0 - groups.length indicating which group d belongs to
     */
    this._calGroupValue = function(d, groups) {  [0]
      var len = groups.length;

      if ((0 <= d && groups[0] > d) || groups[0] === 0) {
        return 0;
      }

      if (groups[len - 1] <= d) {
        return len;
      }

      for (var i = 1; i < len; i++) {
        if (groups[i - 1] <= d && groups[i] > d) {
          return i;
        }
      }
    };

    this._calGroupRange = function(value, groups) {
      var l = 0,
          r = Infinity;

      if (_.isEqual(groups, [0])) {
        if (value > 0) {
          l = groups[value - 1];
        }

        if (value < groups.length) {
          r = groups[value];
        }
      }

      return [l, r];
    };

    /**
     * The logic to increase the count of participants in each group
     *
     * @param {Object} obj - data object
     * @param {Object} count - passed by reference so its value got changed in the function; key: group value, value: count
     * @param {Array}  groups - sorted array of numbers indicating the borders for each group
     * @param {String} field - field name of the data object. it is used to determine which group it belongs to
     * @param {Object} track - track if the participant is counted or not.
     *                       - the uid in a channel(cid) is unique, but not globally uniqu
     */
    this._countParticipants = function(obj, field, count, groups, track) {
      var group;

      if (!track[obj.cid]) {
        track[obj.cid] = {};
        track[obj.cid][obj.uid] = 1;

        group = this._calGroupValue(obj[field], groups);

        count[group] += 1;
      } else if(!track[obj.cid][obj.uid]) {
        track[obj.cid][obj.uid] = 1;

        group = this._calGroupValue(obj[field], groups);

        count[group] += 1;
      }
    };

    /**
     * The logic to increase the count of calls in each group
     *
     * @param {Object} obj - data object
     * @param {Object} count - passed by reference so its value got changed in the function; key: group value, value: count
     * @param {Array}  groups - sorted array of numbers indicating the borders for each group
     * @param {String} field - field name of the data object. it is used to determine which group it belongs to
     * @param {Object} track - track if the channel is counted or not.
     */
    this._countCalls = function(obj, field, count, groups, track) {
      var group;

      if (!track[obj.cid]) {
        track[obj.cid] = 1;
        group = this._calGroupValue(obj[field], groups);
        count[group] += 1;
      }
    };

    /**
     * Get the data for each group
     *
     * @param {Object} data - key is the datetime, value is array of raw data
     * @param {String} field - field name of the data object. it is used to determine which group it belongs to
     * @param {Array} groups - sorted array of numbers indicating the borders for each group
     * @param {Function} countFn - function that contains the logic to count.
     *                             Seen the definition of this._countParticipants and this._countCalls
     * @return {Array} groupsData - array of {Arrya} groupData. groupData consists of object
     *                              with keys cout, datetime, range etc
     */
    this._getGroupsData = function(data, field, groups, countFn) {
      var _this = this,
          groupsCount = groups.length,
          res = {},
          track = {},
          groupsData = [];

      if (_.isEqual(groups, [0])) {
        groupsData = [[]];
      } else {
        for (var j = 0; j<= groupsCount; j++) {
          groupsData.push([]);
        }
      }


      data = _.map(data, function(arr, datetime) {
        res = { count: { 0: 0 } };
        res.datetime = datetime;

        if (!_.isEqual(groups, [0])) {
          for (var i = 0; i <= groupsCount; i++) {
            res.count[i] = 0;
          }
        }

        track = {};

        _.each(arr, function(obj) {
          _.bind(countFn, _this)(obj, field, res.count, groups, track);
        });

        return res;
      });

      _.each(data, function(obj) {
        _.each(obj.count, function(c, index) {
          groupsData[index].push({
            datetime: obj.datetime,
            count: c,
            range: _this._calGroupRange(index, groups)
          });
        });
      });

      return groupsData;
    };

    /**
     * Get participants count over the time domain
     *
     * @param {String} groupBy - 'total', 'call length'
     * @param {String} interval - 'day', 'hourly'
     * @return {Arry} data
     */
    this.getParticipants = function(groupBy, interval) {
      var data = this.data.participants.channelUsers[interval],
          callLengthGroups = [10, 30, 60, 300],
          _this = this,
          res = {},
          track = {}; // channel: {cid1: 1, cid2:1}

      data = _.groupBy(data, function(d) {
        return d.datetime;
      });

      if (groupBy === 'total') {
        data = _this._getGroupsData(data, 'duration', [0], this._countParticipants);
      }

      if (groupBy === 'call length') {
        data = _this._getGroupsData(data, 'duration', callLengthGroups, this._countParticipants);
      }

      return data;
    };

    /**
     * Get calls count over the time domain
     *
     * @param {String} groupBy - 'total', 'call length', 'participants number'
     * @param {String} interval - 'day', 'hourly'
     * @return {Arry} data
     */
    this.getCalls = function(groupBy, interval) {
      var data = this.data.calls.channelUsers[interval],
          callLengthGroups = [10, 30, 60, 300],
          participantsNumberGroups = [3, 5, 10],
          _this = this,
          res = {},
          track = {}; // channel: {cid1: 1, cid2:1}

      data = _.groupBy(data, function(d) {
        return d.datetime;
      });

      if (groupBy === 'total') {
        data = _this._getGroupsData(data, 'channel_duration', [0], this._countCalls);
      }

      if (groupBy === 'call length') {
        data = _this._getGroupsData(data, 'channel_duration', callLengthGroups, this._countCalls);
      }

      if (groupBy === 'participants number') {
        data = _this._getGroupsData(data, 'participants_number', callLengthGroups, this._countCalls);
      }

      return data;
    };

    return this;
  };

  window.angular.module('AgoraApp').service('voiceData', voiceData);
})();
