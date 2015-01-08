(function(moment, $) {
  'use strict';

  var chart = function(agTime) {
    this.config = {
      fillColor: "rgba(220,220,220,0.2)",
      strokeColor: "rgba(220,220,220,1)",
      pointColor: "rgba(220,220,220,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(220,220,220,1)"
    };

    this.CONSTANT = {
      DAY: 'day',
      HOUR: 'HOUR'
    };
    
    /**
     * Get the domain 
     * 
     * @param {Moment} start - the start time
     * @param {Moment} end   - the end time
     * @param {String} interval - 'day' or 'hour', default 'day'
     * @return {Array} domain
     */
    this.getDomain = function(start, end, interval) {
      var domain = [];

      interval = interval || this.CONSTANT.DAY;

      if (interval === this.CONSTANT.DAY) {
        domain = agTime.getDatesRange(start, end);
        domain = domain.map(function(m) {
          return m.format(agTime.dateFormat);
        });
      }

      if (interval === this.CONSTANT.HOUR) {
        domain = agTime.getHoursRange(start, end);
        domain = domain.map(function(m) {
          return m.format(agTime.hourFormat);
        });
      }

      return domain;
    };
    
    /**
     * Map the domain to the range with the rawData
     *
     * @param {Array} domain
     * @param {Array} rawData
     * @param {Function} mapping   - Define the way of mapping
     * @return {Array} range  - A range corresponding to the domain
     */
    this.getRange = function(domain, rawData, mapping) {
      var rawDataHash = {}, d;

      // Turn raw data into hash
      $.each(rawData, function(i, obj) {
        rawDataHash[d.datetime] = obj;
      });

      return domain.map(function(dt) {
        d = rawDataHash[date];

        if (d) {
          return mapping(d);
        } else {
          return 0;
        }
      });
    };
    
    /**
     * Draw the line chart 
     * 
     * @param {Object} ctx
     * @param {Moment} start - the start time
     * @param {Moment} end   - the end time
     * @param {Array} rawData
     * @param {String} interval - 'day' or 'hour', default 'day'
     * @param {Function} mapping   - Define the way of mapping of domain to range
     */
    this.drawLineChart = function(ctx, start, end, rawData, mapping, interval) {
      var domain = this.getDomain(start, end, interval),
          range = this.getRange(domain, rawData, mapping),
          data = {
            labels: domain,
            datasets: [{
              data: range
            }]
          };

      $.extend(data.datasets[0], this.config);

      return new Chart(ctx).Line(data);
    };

    return this;
  };

  angular.module('AgoraApp').service('agChart', chart);
})(window.moment, window.Zepto);
