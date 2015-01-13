(function() {
  'use strict';

  var voiceData = function($http) {
    /**
     * Cache data
     * @todo: set expiration
     */
    this.data = {
      usage: { day: null, hourly: null },
      channelUsers: { day: null, hourly: null },
    };

    this.resources = {
      getVoiceUsage: function(params) {
        var url = '/api/dashboard/voice_usage';

        return $http.get(url, {params: params});
      },
      getChannelUsersInfo: function(params) {
        var url = '/api/dashboard/channel_users_info';

        return $http.get(url, {params: params});
      }
    };

    /**
     * Calculate which group d belongs to
     *
     * @param {Number} d - the number that to be calculated
     * @param {Array} groups - sorted array of numbers indicating the borders for each group
     * @return {Number} value - a number between 0 - groups.length indicating which group d belongs to
     */
    this._calGroupValue = function(d, groups) {
      var len = groups.length;

      if (0 <= d && groups[0] > d) {
        return 0;
      }

      if (groups[len - 1] <= d) {
        return len;
      }

      for (var i = 1; i < len; i++) {
        if (groups[i -1] <= d && groups[i] > d) {
          return i;
        }
      }
    };

    this._calGroupRange = function(value, group) {
      var l = 0,
          r = Infinity;

      if (value > 0) {
        l = group[value - 1];
      }

      if (value < group.length) {
        r = group[value];
      }

      return [l, r];
    };

    this._getGroupsData = function(data, groups) {
      var _this = this,
          groupsCount = groups.length,
          res = {},
          track = {},
          groupsData = [],
          group;

      for (var j = 0; j<= groupsCount; j++) {
        groupsData.push([]);
      }

      data = _.map(data, function(arr, datetime) {
        res = { count: {} };
        res.datetime = datetime;
        for (var i = 0; i <= groupsCount; i++) {
          res.count[i] = 0;
        }
        track = {};

        _.each(arr, function(obj) {
          if (!track[obj.cid]) {
            track[obj.cid] = {};
            track[obj.cid][obj.uid] = 1;

            // @todo: duration should be a param
            group = _this._calGroupValue(obj.duration, groups);

            res.count[group] += 1;
          } else if(!track[obj.cid][obj.uid]) {
            track[obj.cid][obj.uid] = 1;

            group = _this._calGroupValue(obj.duration, groups);

            res.count[group] += 1;
          }
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
      var data = this.data.channelUsers[interval],
          callLengthGroups = [10, 30, 60, 300],
          _this = this,
          res = {},
          track = {}; // channel: {cid1: 1, cid2:1}

      //console.log(data);

      data = _.groupBy(data, function(d) {
        return d.datetime;
      });

      if (groupBy === 'total') {
        // @todo: move to a seperate func
        // data = _.groupBy(data, function(d) {
        //   return d.datetime;
        // });

        data = _.map(data, function(arr, datetime) {
          res = {};
          res.datetime = datetime;
          res.count = 0;
          track = {};

          _.each(arr, function(obj) {
            if (!track[obj.cid]) {
              track[obj.cid] = {};
              track[obj.cid][obj.uid] = 1;
              res.count += 1;
            } else if(!track[obj.cid][obj.uid]) {
              track[obj.cid][obj.uid] = 1;
              res.count += 1
            }
          });

          return res;
        });
      }

      if (groupBy === 'call length') {
        data = _this._getGroupsData(data, callLengthGroups);
      }

      console.log(data);

      return data;
    };

    return this;
  };

  window.angular.module('AgoraApp').service('voiceData', voiceData);
})();
