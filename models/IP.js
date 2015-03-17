(function() {
  'use strict';

  var request = require('request');

  function ipToInt(ip) {
    var num = 0;
      ip = ip.split(".").map(function(str) {
        return parseInt(str, 10);
      });

      num = ip[0] * 256 * 256 * 256 + ip[1] * 256 * 256 + ip[2] * 256 + ip[3];
      num = num >>> 0;
      return num;
  }

  function intToIP(num) {
    var str;
      var tt = new Array();
      tt[0] = (num >>> 24) >>> 0;
      tt[1] = ((num << 8) >>> 24) >>> 0;
      tt[2] = (num << 16) >>> 24;
      tt[3] = (num << 24) >>> 24;
      str = String(tt[0]) + "." + String(tt[1]) + "." + String(tt[2]) + "." + String(tt[3]);
      return str;
  }

  var _ = require('underscore');
  var DBModel = require('./DBModel');
  var IP = new DBModel('ips');

  /**
   * Select ip location records corresponding to the input ips.
   * To optimize the performace, select all the records between min ip and max ip and contruct an ip table to inner join the selected records
   *
   * @param {Array} ips - array of ips in string format
   * @param {Function} cb - callback function taking err, results
   */
  IP.getIPLocations = function(ips,cb) {
    var sql1 = 'SELECT ip_locations_sub.*, ip_tab.ip_to_check FROM (SELECT * FROM ips WHERE ? >= ips.start_ip and ? <= ips.end_ip) AS ip_locations_sub INNER JOIN (',
        sql2 = '',
        sql3 = ') AS ip_tab ON (ip_tab.ip_to_check >= ip_locations_sub.start_ip and ip_tab.ip_to_check <= ip_locations_sub.end_ip)',
        params = [],
        ipMin, ipMax;

    // Convert ip to integer
    ips = ips.map(function(ipStr) {
      return ipToInt(ipStr);
    });

    // Sort
    ips = _.sortBy(ips, function(ipInt) {
      return ipInt;
    });

    //ips = [ips[0], ips[1], ips[ips.length - 1]];

    ipMin = ips[0];
    ipMax = ips[ips.length - 1];
    params.push(ipMax);
    params.push(ipMin);
    params = params.concat(ips);

    // construct sql
    sql2 = ips.map(function(ipInt) {
      return 'SELECT ? AS ip_to_check';
    }).join(' UNION ');

    console.log('input ips number: ' + ips.length);

    return IP.query(sql1 + sql2 + sql3, params, cb);
  };

  /**
   * Recursively batch get ip locations info to assure not exceed the batch limit
   *
   * @param {Array} ips         - array of string ips
   * @param {Array} ipLocations - initial value should be []
   * @param {Function} cb       - callback function taking err and ipLocations
   */
  IP.getIPLocationsFromAPI = function(ips, ipLocations, cb) {
    var maxIPNum = 99,
        processingIPs = [],
        url = 'http://70.39.189.65:8082/iplocation?ips=';

    if (ips.length <= maxIPNum) {
      url = url + ips.join(',');

      request(url, function(err, response, data) {
        if (!err) {
          ipLocations = ipLocations.concat(JSON.parse(data));
        }

        cb(err, ipLocations);
      });
    } else {
      processingIPs = ips.splice(0, maxIPNum);

      url = url + processingIPs.join(',');

      request(url, function(err, response, data) {
        if (!err) {
          ipLocations = ipLocations.concat(JSON.parse(data));
          IP.getIPLocationsFromAPI(ips, ipLocations, cb);
        } else {
          cb(err, ipLocations);
        }
      });
    }
  };

  module.exports = IP;
})();


