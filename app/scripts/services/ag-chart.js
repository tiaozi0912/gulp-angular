(function(moment, Chart) {
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
        lineOptions: {
          strokeColor: '#2ecc71',
          pointColor: '#2ecc71',
          pointHighlightFill: 'white',
        },
        chartOptions: {
          pointHitDetectionRadius: 5,
          datasetFill: false,
          pointDotStrokeWidth: 0,
          responsive: true
        },
        CONSTANT: {
          DAY: 'day',
          HOUR: 'hourly'
        },
        labelsCount: 4
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

      _.extend(this.settings, options);
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
          return m.format(agTime.dateDisplayFormat);
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
     * Not showing every labels in the domain, only showing n labels
     */
    agChart.prototype.filterDomain = function(domain, n) {
      var len = domain.length,
          filteredDomain = domain.map(function() {
            return '';
          }),
          step = parseInt(len / ( n - 1 )),
          i = 0;

      while (domain[i]) {
        filteredDomain[i] = domain[i];
        i += step;
      }

      return filteredDomain;
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
      _.each(rawData, function(obj, i) {
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
      if (!_.isArray(rawData[0])) {
        rawData = [rawData];
      }

      var _this = this,
          domain = this.getDomain(start, end, interval),
          data = {
            labels: domain,
            datasets: []
            // datasets: [{
            //   data: range
            // }]
          },
          range,
          dataset;

      data.labels = this.filterDomain(domain, this.settings.labelsCount);

      data.datasets = _.map(rawData, function(ds) {
        dataset = {};
        dataset.data = _this.getRange(ds, mapping, interval);
        dataset = _.extend(dataset, _this.settings.lineOptions);
        return dataset;
      });

      this.chart = new Chart(this.ctx).Line(data, this.settings.chartOptions);

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
})(window.moment, window.Chart);
