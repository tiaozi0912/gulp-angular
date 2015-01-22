(function() {
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
          responsive: true,
          scaleShowVerticalLines: false
        },
        CONSTANT: {
          DAY: 'day',
          HOUR: 'hourly'
        },
        labelsCount: 4,
        colors: ['#2ecc71', '#1aa1e5', '#2c3e50', '#bdc3c7', '#e67e22']
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
      _.each(rawData, function(obj) {
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
     * Get label for a dataset to display
     */
    agChart.prototype.getLabel = function(data) {
      var range;

      if (!data[0] || !data[0].range) {
        return '';
      } else {
        range = data[0].range;
      }

      if (range[0] === 0) {
        return '< ' + range[1];
      }

      if (range[1] === Infinity) {
        return '>' + range[0];
      }

      return range.join(' - ');
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
          },
          dataset,
          legend;

      data.labels = this.filterDomain(domain, this.settings.labelsCount);

      data.datasets = _.map(rawData, function(ds, i) {
        dataset = {};

        dataset.label = _this.getLabel(ds);

        _this.settings.lineOptions.strokeColor =  _this.settings.colors[i];
        _this.settings.lineOptions.pointColor =  _this.settings.colors[i];

        dataset = _.extend(dataset, _this.settings.lineOptions);

        dataset.data = _this.getRange(ds, mapping, interval);

        return dataset;
      });

      this.chart = new Chart(this.ctx).Line(data, this.settings.chartOptions);

      if (data.datasets.length > 1) {
        legend = this.chart.generateLegend();
        $($(this.canvas).parent().append(legend));
      }

      return this.chart;
    };

    agChart.prototype.clear = function() {
      $(this.canvas).parent().find('.line-legend').remove();

      if (this.chart) {
        this.chart.destroy();
      }
    };

    return agChart;
  };

  angular.module('AgoraApp').factory('agChart', chartService);
})();
