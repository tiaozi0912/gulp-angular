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
          dataStore = voiceData.data.overview,
          chart = new agChart(canvas);

      function cachedData(key, data) {
        if (data) {
          dataStore[key][$scope.query.interval] = data;
        }

        return dataStore[key][$scope.query.interval];
      }

      function draw(data) {
        chart.drawLineChart(moment.unix($scope.query.start), moment.unix($scope.query.end), data, getMinutes, $scope.query.interval);
      }

      function onSuccessGetVoiceUsage(res) {
        cachedData('usage', res.data);
        draw(res.data);
      }

      function onSuccessGetIPInfo(res) {
        console.log('IP location info');
        console.log(res.data);
      }

      function onErrorGetIPInfo(res) {
        console.log('Error: get ip info');
        console.log(res);
      }

      function onSuccessGetChannelUsersInfo(res) {
        voiceData.resources.getIPInfo(res.data);
          //.success(onSuccessGetIPInfo)
          ///.error(onErrorGetIPInfo);
      }

      function getDataAndDrawChart() {
        if (!cachedData('usage')) {
          voiceData.resources.getVoiceUsage($scope.query)
            .success(onSuccessGetVoiceUsage);
        } else {
          draw(cachedData('usage'));
        }
      }

      // @todo: to complete
      function getDataAndDrawMap() {
        if (!cachedData('channelUsers')) {
          voiceData.resources.getChannelUsersInfo($scope.query)
            .success(onSuccessGetChannelUsersInfo);
        } else {
          draw(cachedData('channelUsers'));
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

    window.angular.module('AgoraApp').controller('overviewCtrl', ctrl);
})(window.moment);
