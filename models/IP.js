(function() {
  'use strict';

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

  IP.getIPLocations2 = function(ips,cb) {
    var sql = 'SELECT COUNT(*) FROM ips WHERE ? >= ips.start_ip and ? <= ips.end_ip', // not ( ips.end_ip < min or ips.start_ip > max) ====> end >= min and start <= max
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

    ipMin = ips[0] * 100;
    ipMax = ips[ips.length - 1];
    params.push(ipMax);
    params.push(ipMin);

    return IP.query(sql, params, cb);
  };

  module.exports = IP;
})();



//SELECT ip_locations_sub.*, ip_tab.ip_to_check FROM (SELECT * FROM ips WHERE 785951785 >= ips.start_ip and 21014502 <= ips.end_ip) AS ip_locations_sub INNER JOIN (SELECT 785951785 AS ip_to_check UNION SELECT 21014502 AS ip_to_check UNION SELECT 403119584 AS ip_to_check) AS ip_tab ON (ip_tab.ip_to_check >= ip_locations_sub.start_ip and ip_tab.ip_to_check <= ip_locations_sub.end_ip)
