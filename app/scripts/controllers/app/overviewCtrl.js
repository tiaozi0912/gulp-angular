(function() {
  'use strict';

  var ctrl = function($scope, $rootScope, $http, agTime, agChart, voiceData) {
      $scope.user = $rootScope.currentUser;
      $scope.query = {
        interval: 'day'
      };
      $scope.circles = [];

      var canvas = document.getElementById('overview-chart'),
          getMinutes = function(d) {
            return d.usage / 60;
          },
          dataStore = voiceData.data.overview,
          chart = new agChart(canvas);

      function cachedData(key, data) {
        if (key === 'currMonthMinutes') {
          if (data) {
            dataStore[key] = data;
          }

          return dataStore[key];
        } else {
          if (data) {
            dataStore[key][$scope.query.interval] = data;
          }

          return dataStore[key][$scope.query.interval];
        }
      }

      function draw(data) {
        chart.drawLineChart(moment.unix($scope.query.start), moment.unix($scope.query.end), data, getMinutes, $scope.query.interval);
      }

      function onSuccessGetVoiceUsage(res) {
        $scope.minutesUsage = res.minutesUsage;

        cachedData('currMonthMinutes', res.minutesUsage);
        cachedData('usage', res.data);
        draw(res.data);
      }

      function onErrorGetVoiceUsage(res) {
        console.log('Error: get ip info');
        console.log(res);
      }

      function onSuccessGetIpLocations(res) {
        console.log('IP location info');
        console.log(res.data);

        cachedData('ipLocations', res.data);

        $scope.ipLocations = res.data;
      }

      function onErrorGetIpLocations(res) {
        console.log('Error: get ip info');
        console.log(res);
      }

      /**
       * Fetch data from API and Draw the overview line chart
       */
      function getDataAndDrawChart() {
        if (!cachedData('usage')) {
          voiceData.resources.getVoiceUsage($scope.query)
            .success(onSuccessGetVoiceUsage)
            .error(onErrorGetVoiceUsage);
        } else {
          $scope.minutesUsage = cachedData('currMonthMinutes');
          draw(cachedData('usage'));
        }
      }

      /**
       * Fetch data from API and Draw the ip locations on the Google Map
       */
      function getDataAndDrawMap() {
        if (!cachedData('ipLocations')) {
          voiceData.resources.getIpLocations($scope.query)
            .success(onSuccessGetIpLocations)
            .error(onErrorGetIpLocations);
        } else {
          $scope.ipLocations = cachedData('ipLocations');
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
        getDataAndDrawChart();
        getDataAndDrawMap();
      }

      $scope.onSelect = function() {
        if ($scope.query.interval === chart.settings.CONSTANT.HOUR) {
          onHourly();
        }

        if ($scope.query.interval === chart.settings.CONSTANT.DAY) {
          onDay();
        }

        chart.clear();
        getDataAndDrawChart();
      };

      init();
    };

    angular.module('AgoraApp').controller('overviewCtrl', ctrl);
})();
