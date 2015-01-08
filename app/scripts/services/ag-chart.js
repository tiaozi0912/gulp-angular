(function(moment, $, Chart) {
  'use strict';

  var chartService = function(agTime) {
    /**
     * Define agChart class
     *
     * @param {DOM} canvas
     * @param {Object} options
     */
    var agChart = function(canvas, options) {
      this.settings = {
        config: {
          fillColor: 'rgba(220,220,220,0.2)',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)'
        },
        CONSTANT: {
          DAY: 'day',
          HOUR: 'hourly'
        },
        height: 400,
        width: 960,
      };

      this.canvas = canvas;

      // To prevent to double the canvas size in retina
      // this.canvas.height = this.settings.height;
      // this.canvas.width = this.settings.width;

      this.ctx = canvas.getContext('2d');

      /**
       * Will assign in the getDomain()
       * @type {Array} array of moment objects
       */
      this.domain = [];

      $.extend(this.settings, options);
    };

    /**
     * Get the domain
     *
     * @param {Moment} start - the start time
     * @param {Moment} end   - the end time
     * @param {String} interval - 'day' or 'hourly', default 'day'
     * @return {Array} domain
     */
    agChart.prototype.getDomain = function(start, end, interval) {
      var domain = [];

      interval = interval || this.settings.CONSTANT.DAY;

      if (interval === this.settings.CONSTANT.DAY) {
        this.domain = agTime.getDatesRange(start, end);
        domain = this.domain.map(function(m) {
          return m.format(agTime.dateFormat);
        });
      }

      if (interval === this.settings.CONSTANT.HOUR) {
        this.domain = agTime.getHoursRange(start, end);
        domain = this.domain.map(function(m) {
          return m.format(agTime.hourDisplayFormat);
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
    agChart.prototype.getRange = function(rawData, mapping, interval) {
      var CONSTANT = this.settings.CONSTANT,
          rawDataHash = {},
          d;

      // Turn raw data into hash
      $.each(rawData, function(i, obj) {
        rawDataHash[obj.datetime] = obj;
      });

      return this.domain.map(function(m) {
        if (interval === CONSTANT.HOUR) {
          d = rawDataHash[m.format(agTime.hourFormat)];
        }

        if (interval === CONSTANT.DAY) {
          d = rawDataHash[m.format(agTime.dateFormat)];
        }

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
    agChart.prototype.drawLineChart = function(start, end, rawData, mapping, interval) {
      var domain = this.getDomain(start, end, interval),
          range = this.getRange(rawData, mapping, interval),
          data = {
            labels: domain,
            datasets: [{
              data: range
            }]
          };

      $.extend(data.datasets[0], this.settings.config);

      this.chart = new Chart(this.ctx).Line(data);

      return this.chart;
    };

    agChart.prototype.clear = function() {
      if (this.chart) {
        this.chart.destroy();
      }
    };

    return agChart;
  };

  window.angular.module('AgoraApp').factory('agChart', chartService);
})(window.moment, window.Zepto, window.Chart);
