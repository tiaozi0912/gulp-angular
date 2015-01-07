(function(moment) {
  'use strict';

  var time = function() {
    this.dateFormat = 'YYYY-MM-DD';

    /**
     * Get the sets of dates between date1 and date2
     *
     * @param {Moment} date1 - start date, moment object
     * @param {Moment} date2 - end date, moment object
     * @return {Array} dates - array of moment object
     */
    this.getDatesRange = function(date1, date2) {
      var m = moment(date1),
          dates = [];

      while(m.unix() <= date2.unix()) {
        dates.push(m);
        m = moment(m).add(1, 'days');
      }

      return dates;
    };

    return this;
  };

  angular.module('AgoraApp').service('time', time);
})(window.moment);
