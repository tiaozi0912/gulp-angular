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
    this._calGroupValue = function(d, groups) {  [0]
      var len = groups.length;

      if ((0 <= d && groups[0] > d) || groups[0] === 0) {
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

    this._countParticipants = function(obj, res, groups, track) {
      var group;

      if (!track[obj.cid]) {
        track[obj.cid] = {};
        track[obj.cid][obj.uid] = 1;

        // @todo: duration should be a param
        group = this._calGroupValue(obj.duration, groups);

        res.count[group] += 1;
      } else if(!track[obj.cid][obj.uid]) {
        track[obj.cid][obj.uid] = 1;

        group = this._calGroupValue(obj.duration, groups);

        res.count[group] += 1;
      }
    };

    /**
     * Get the data for each group
     *
     * @param {Object} data - key is the datetime, value is array of raw data
     * @param {Array} groups - sorted array of numbers indicating the borders for each group
     * @param {Function} countFn - function that contains the logic to count.
     *                             Seen the definition of this._countParticipants and this._countCalls
     * @return {Array} groupsData - array of {Arrya} groupData. groupData consists of object
     *                              with keys cout, datetime, range etc
     */
    this._getGroupsData = function(data, groups, countFn) {
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
          _.bind(countFn, _this)(obj, res, groups, track);
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

      data = _.groupBy(data, function(d) {
        return d.datetime;
      });

      if (groupBy === 'total') {
        data = _this._getGroupsData(data, [0], this._countParticipants);
      }

      if (groupBy === 'call length') {
        data = _this._getGroupsData(data, callLengthGroups, this._countParticipants);
      }

      console.log(data);

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

    };

    return this;
  };

  window.angular.module('AgoraApp').service('voiceData', voiceData);
})();
