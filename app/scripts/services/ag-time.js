(function(moment) {
  'use strict';

  var time = function() {
    this.dateFormat = 'YYYY-MM-DD';

    this.dateDisplayFormat = 'MMM DD';

    this.hourFormat = 'YYYY-MM-DD HH';

    this.hourDisplayFormat = 'H';

    /**
     * Get the sets of dates between date1 and date2
     *
     * @param {Moment} date1 - start date, moment object
     * @param {Moment} date2 - end date, moment object
     * @return {Array} dates - array of moment object
     */
    this.getDatesRange = function(date1, date2) {
      date1 = date1.startOf('day');
      date2 = date2.startOf('day');

      var m = moment(date1),
          dates = [];

      while (m.unix() <= date2.unix()) {
        dates.push(m);
        m = moment(m).add(1, 'days');
      }

      return dates;
    };

    /**
     * Get the sets of hours between date1 and date2
     *
     * @param {Moment} hour1 - start date, moment object
     * @param {Moment} hour2 - end date, moment object
     * @return {Array} hours - array of moment object
     */
    this.getHoursRange = function(hour1, hour2) {
      hour1 = hour1.startOf('hour');
      hour2 = hour2.startOf('hour');

      var h = moment(hour1),
          hours = [];

      while (h.unix() <= hour2.unix()) {
        hours.push(h);
        h = moment(h).add(1, 'hours');
      }

      return hours;
    };

    return this;
  };

  window.angular.module('AgoraApp').service('agTime', time);
})(window.moment);
