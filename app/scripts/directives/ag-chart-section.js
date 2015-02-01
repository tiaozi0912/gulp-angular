/**
 * Render the chart section, including:
 * chart title, interval control, view control, chart and legend
 *
 * <div ag-chart-section data-chart="chart">
 *
 * chart:
 * {String}   title         - chart title
 * {Function} fetch         - fetch the data from server
 * {Function} getYValue
 * {Dict}     cacheOption   - keys are category, dataCategory
 */

(function() {
  'use strict';

  var ctrl = function($scope) {
    $scope.query = {
      interval: 'day'
    };

    $scope.loading = true;

    $scope.hasData = true;
  };

  var dir = function($templateCache, agChart, voiceData) {
    return {
      restrict: 'A',
      scope: {
        chart: '=',
      },
      replace: true,
      template: $templateCache.get('directives/chart_section.html'),
      controller: ctrl,
      link: function(scope, element) {
            var canvas = $(element[0]).find('canvas')[0],
                chart = new agChart(canvas),
                model = scope.chart,
                dataCategory = model.cacheOption.category,
                dataSubCategory = model.cacheOption.subCategory,
                dataStore = voiceData.data[dataCategory];

        function cachedData(key, data) {
          if (data) {
            dataStore[key][scope.query.interval] = data;
          }

          return dataStore[key][scope.query.interval];
        }

        function draw(data) {
          chart.drawLineChart(null, null, data, model.getYValue, scope.query.interval);
        }

        function onFetchSuccess(res) {
          scope.loading = false;
          scope.hasData = res.data.length > 0;
          cachedData(dataSubCategory, res.data);

          if (scope.hasData) {
            draw(res.data);
          }
        }

        function onFetchError(res) {
          console.log('Error: get ip info');
          console.log(res);
        }

        /**
         * Fetch data from API and Draw the line chart
         */
        function getDataAndDrawChart() {
          scope.loading = true;

          if (!cachedData(dataSubCategory)) {
            model.fetch(scope.query)
              .success(onFetchSuccess)
              .error(onFetchError);
          } else {
            scope.loading = false;

            scope.hasData = cachedData(dataSubCategory).length > 0;

            if (scope.hasData) {
              draw(cachedData(dataSubCategory));
            }
          }
        }

        function onDay() {
          scope.query.end = moment().unix();
          scope.query.start = moment().subtract(30, 'd').unix();
          // scope.query.start = moment('2014-12-01').unix();
          // scope.query.end = moment('2014-12-31').unix();
        }

        function onHourly() {
          scope.query.start = moment().subtract(24, 'h').unix();
          scope.query.end = moment().unix();
          scope.query.start = moment('2014-12-18').startOf('day').unix();
          scope.query.end = moment('2014-12-18').endOf('day').unix();
        }

        function init() {
          onDay();
          getDataAndDrawChart();
        }

        scope.onSelect = function() {
          if (scope.query.interval === chart.settings.CONSTANT.HOUR) {
            onHourly();
          }

          if (scope.query.interval === chart.settings.CONSTANT.DAY) {
            onDay();
          }

          chart.clear();
          getDataAndDrawChart();
        };

        init();
      }
    };
  };

  angular.module('AgoraApp').directive('agChartSection', dir);

})();
