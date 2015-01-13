(function(moment) {
  'use strict';

  var ctrl = function($scope, $rootScope, $http, agTime, agChart, voiceData) {
      $scope.user = $rootScope.currentUser;
      $scope.query = {
        interval: 'day'
      };

      var canvas = document.getElementById('overview-chart'),
          getMinutes = function(d) {
            return d.usage / 60;
          },
          chart = new agChart(canvas);

      function cachedData(data) {
        if (data) {
          voiceData.data.usage[$scope.query.interval] = data;
        }

        return voiceData.data.usage[$scope.query.interval];
      }

      function draw(data) {
        chart.drawLineChart(moment.unix($scope.query.start), moment.unix($scope.query.end), data, getMinutes, $scope.query.interval);
      }

      function onSuccess(res) {
        cachedData(res.data);
        draw(res.data);
      }

      function drawChart() {
        if (!cachedData()) {
          voiceData.resources.getVoiceUsage($scope.query)
            .success(onSuccess);
        } else {
          draw(cachedData());
        }
      }

      function onDay() {
        $scope.query.start = moment('2014-12-01').unix();//moment().startOf('month').unix(),
        $scope.query.end = moment('2014-12-31').unix();//moment().endOf('month').unix()
      }

      function onHourly() {
        $scope.query.start = moment('2014-12-18').startOf('day').unix();
        $scope.query.end = moment('2014-12-18').endOf('day').unix();
      }

      function init() {
        onDay();
        drawChart();
      }

      $scope.onSelect = function() {
        if ($scope.query.interval === chart.settings.CONSTANT.HOUR) {
          onHourly();
        }

        if ($scope.query.interval === chart.settings.CONSTANT.DAY) {
          onDay();
        }

        chart.clear();
        drawChart();
      };

      init();
    };

    window.angular.module('AgoraApp').controller('overviewCtrl', ctrl);
})(window.moment);
