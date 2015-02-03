(function() {
  'use strict';

  var DBModel = require('./DBModel');
  var formatter = require('../lib/dataFormatter');
  var _ = require('underscore');

  /*
   * @readme: quality_report is the db name. there is no table named as quality_report
   *          therefore only Model.query method can be used
   */
  var QualityReport = new DBModel('quality_report', {
    db: 'quality_report'
  });

  function distribute(data, interval, yFields) {
    var step = interval === 'instant' ? 300 : 60 * 60 * 24;

    return formatter.distribute(data, step, 'datetime', yFields);
  }

  /**
   * Get delay data            - instant, daily
   * @param  {Function} cb
   * @param  {String} interval - instant, daily
   * @param  {Dict}   find     - fields to look into: vendor_id, start, end
   */
  QualityReport.getDelayData = function(cb, interval, find) {
    var table = interval + '_vendor_delay1',
        groups = [
          {name: 'delay400', label: 'percentage of users having delay less than 400ms'},
          {name: 'delay800', label: 'percentage of users having delay less than 800ms'}
        ];

    // debug
    var sql = 'SELECT vendor_id, report_ts as datetime, delay400, delay800 FROM <%= table %> WHERE vendor_id = <%= vendor_id %> AND report_ts <= <%= end %> AND report_ts >= <%= start %> AND category = 3';
    find.table = table;
    console.log(_.template(sql)(find));

    QualityReport.query('SELECT vendor_id, report_ts as datetime, delay400, delay800 FROM ?? WHERE vendor_id = ? AND report_ts <= ? AND report_ts >= ? AND category = 3', [table, find.vendor_id, find.end, find.start], function(err, data) {
      if (!err) {
        data = distribute(data, interval, ['delay400', 'delay800']);
        data = formatter.getGroupsDataForFields(data, groups);
      }

      cb(err, data);
    });
  };

  /**
   * Get lost data            - instant, daily
   * @param  {Function} cb
   * @param  {String} interval - instant, daily
   * @param  {Dict}   find     - fields to look into: vendor_id, start, end
   */
  QualityReport.getLostData = function(cb, interval, find) {
    var table = interval + '_vendor_delay1',
        groups = [
          {name: 'lost5', label: 'percentage of users having loss less than 5%'},
          {name: 'lost10', label: 'percentage of users having loss less than 10%'}
        ];

    // debug
    var sql = 'SELECT vendor_id, report_ts as datetime, lost5, lost10 FROM <%= table %> WHERE vendor_id = <%= vendor_id %> AND report_ts <= <%= end %> AND report_ts >= <%= start %> AND category = 3';
    find.table = table;
    console.log(_.template(sql)(find));

    QualityReport.query('SELECT vendor_id, report_ts as datetime, lost5, lost10 FROM ?? WHERE vendor_id = ? AND report_ts <= ? AND report_ts >= ? AND category = 3', [table, find.vendor_id, find.end, find.start], function(err, data) {
      if (!err) {
        data = distribute(data, interval, ['lost5', 'lost10']);
        data = formatter.getGroupsDataForFields(data, groups);
      }

      cb(err, data);
    });
  };

  /**
   * Get jitter data            - instant, daily
   * @param  {Function} cb
   * @param  {String} interval - instant, daily
   * @param  {Dict}   find     - fields to look into: vendor_id, start, end
   */
  QualityReport.getJitterData = function(cb, interval, find) {
    var table = interval + '_audio_report';

    // debug
    var sql = 'SELECT vendor_id, report_ts as datetime, ka FROM <%= table %> WHERE vendor_id = <%= vendor_id %> AND report_ts <= <%= end %> AND report_ts >= <%= start %>';
    find.table = table;
    console.log(_.template(sql)(find));

    QualityReport.query('SELECT vendor_id, report_ts as datetime, ka as jitter FROM ?? WHERE vendor_id = ? AND report_ts <= ? AND report_ts >= ?', [table, find.vendor_id, find.end, find.start], function(err, data) {
      if (!err) {
        data = distribute(data, interval, ['jitter']);
      }

      cb(err, data);
    });
  };

  module.exports = QualityReport;
})();
