(function() {
  'use strict';

  var _ = require('underscore');

  var formatter = {
    participants: {
      groups: {
        duration: { values: [10, 30, 60, 300], unit: 'min' }
      },
      label: '# of users'
    },
    calls: {
      groups: {
        channel_duration: { values: [10, 30, 60, 300], unit: 'min' },
        participants_number: { values: [3, 5, 10], unit: ''}
      },
      label: '# of calls'
    }
  };

  var getRangeLabel = function(range, dataCategory, dataSubCategory) {
    var unit = formatter[dataCategory].groups[dataSubCategory].unit,
        category = formatter[dataCategory].label,
        label;

    if (range[0] === 0) {
      label = '< ' + range[1];
      label = unit ? label + ' ' + unit : label;
    } else if (range[1] === Infinity) {
      label = '>' + range[0];
      label = unit ? label + ' ' + unit : label;
    } else {
      label = unit ? range[0] + ' ' + unit + ' - ' + range[1] + ' ' + unit : range.join(' - ');
    }
    label = category + '(' + label + ')';

    return label;
  };

  /**
   * Calculate which group d belongs to
   *
   * @param {Number} d - the number that to be calculated
   * @param {Array} groups - sorted array of numbers indicating the borders for each group
   * @return {Number} value - a number between 0 - groups.length indicating which group d belongs to
   */
  var calGroupValue = function(d, groups) {
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

  var calGroupRange = function(value, groups) {
    var l = 0,
        r = Infinity;

    if (!_.isEqual(groups, [0])) {
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
  formatter.participants.count = function(obj, field, count, groups, track) {
    var group;

    if (!track[obj.cid]) {
      track[obj.cid] = {};
      track[obj.cid][obj.uid] = 1;

      group = calGroupValue(obj[field], groups);

      count[group] += 1;
    } else if(!track[obj.cid][obj.uid]) {
      track[obj.cid][obj.uid] = 1;

      group = calGroupValue(obj[field], groups);

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
  formatter.calls.count = function(obj, field, count, groups, track) {
    var group;

    if (!track[obj.cid]) {
      track[obj.cid] = 1;
      group = calGroupValue(obj[field], groups);
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
   *                             Seen the definition of countParticipants and countCalls
   * @return {Array} groupsData - array of {Arrya} groupData. groupData consists of object
   *                              with keys cout, datetime, range etc
   */
  formatter.getGroupsData = function(data, field, groups, countFn) {
    var groupsCount = groups.length,
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
        countFn(obj, field, res.count, groups, track);
      });

      return res;
    });

    _.each(data, function(obj) {
      _.each(obj.count, function(c, index) {
        groupsData[index].push({
          datetime: obj.datetime,
          count: c,
          range: calGroupRange(index, groups)
        });
      });
    });

    return groupsData;
  };

  /**
   * Format data for CSV export.
   *
   * @param {Array} data - raw data returned from getGroupsData function, like
   *                       [ [ { datetime: '1422161642', count: 168, range: [Object] } ],
   *                         [ { datetime: '1422161642', count: 204, range: [Object] } ],
   *                         [ { datetime: '1422161642', count: 80, range: [Object] } ],
   *                         [ { datetime: '1422161642', count: 78, range: [Object] } ],
   *                         [ { datetime: '1422161642', count: 55, range: [Object] } ] ]
   * @param {string} dataCategory - 'calls' or 'participants'
   * @param {string} dataSubCategory - 'duration', 'channel_duration', 'participants_number'
   * @return {Array} rows of data - array of rows, row is dict
   */
  formatter.formatData = function(data, dataCategory, dataSubCategory) {
    var rows = [],
        row = {},
        total = 0,
        d,
        header;

    for (var i = 0; data[0][i]; i++) {
      for (var j = 0; data[j]; j++) {
        d = data[j][i];
        header = getRangeLabel(d.range, dataCategory, dataSubCategory);
        row[header] = d.count;
      }

      rows.push(row);
    }

    // total
    _.each(rows, function(r) {
      _.each(r, function(c) {
        total += c;
      });

      r['total ' + dataCategory] = total;
    });

    return rows;
  };

  module.exports = formatter;

})();
