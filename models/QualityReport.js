(function() {
  'use strict';

  var DBModel = require('./DBModel');
  var formatter = require('../lib/dataFormatter');

  /*
   * @readme: quality_report is the db name. there is no table named as quality_report
   *          therefore only Model.query method can be used
   */
  var QualityReport = new DBModel('quality_report', {
    db: 'quality_report'
  });

  /**
   * Get delay data            - instant, daily
   * @param  {Function} cb
   * @param  {String} interval - instant, daily
   * @param  {Dict}   find     - fields to look into: vendor_id, start, end
   */
  QualityReport.getDelayData = function(cb, interval, find) {
    var table = interval + '_vendor_delay1',
        groups = [
          {name: 'delay400', label: 'delay less than 400ms'},
          {name: 'delay800', label: 'delay less than 800ms'}
        ];

    find.category = 3;

    QualityReport.query('SELECT vendor_id, report_ts as datetime, delay400, delay800 FROM ?? WHERE vendor_id = ? AND report_ts <= ? AND report_ts >= ?', [table, find.vendor_id, find.end, find.start], function(err, data) {
      if (!err) {
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
          {name: 'lost5', label: 'lost less than 5%'},
          {name: 'lost10', label: 'lost less than 10%'}
        ];

    find.category = 3;

    QualityReport.query('SELECT vendor_id, report_ts as datetime, lost5, lost10 FROM ?? WHERE vendor_id = ? AND report_ts <= ? AND report_ts >= ?', [table, find.vendor_id, find.end, find.start], function(err, data) {
      if (!err) {
        data = formatter.getGroupsDataForFields(data, groups);
      }

      cb(err, data);
    });
  };

  /**
   * Get discontinuity data            - instant, daily
   * @param  {Function} cb
   * @param  {String} interval - instant, daily
   * @param  {Dict}   find     - fields to look into: vendor_id, start, end
   */
  QualityReport.getDiscontinuityData = function(cb, interval, find) {
    var table = interval + '_audio_report';

    QualityReport.query('SELECT vendor_id, report_ts as datetime, ka as discontinuity FROM ?? WHERE vendor_id = ? AND report_ts <= ? AND report_ts >= ?', [table, find.vendor_id, find.end, find.start], cb);
  };

  module.exports = QualityReport;
})();
