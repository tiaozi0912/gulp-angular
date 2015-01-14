(function() {
  'use strict';

  var ctrl = function($scope, $rootScope, $http, agTime, agChart, voiceData) {
      $scope.user = $rootScope.currentUser;
      $scope.query = {
        interval: 'day',
        groupBy: 'total'
      },
      $scope.groupByBtns = [
        { label: 'total', value: 'total' },
        { label: 'call length', value: 'call length' },
        { label: 'number of participants', value: 'participants number' }
      ];

      var canvas = document.getElementById('calls-chart'),
          getCount = function(d) {
            return d.count;
          },
          chart = new agChart(canvas),
          formatedData;

      function cachedData(data) {
        if (data) {
          voiceData.data.channelUsers[$scope.query.interval] = data;
        }

        return voiceData.data.channelUsers[$scope.query.interval];
      }

      function draw(data) {
        chart.drawLineChart(moment.unix($scope.query.start), moment.unix($scope.query.end), data, getCount, $scope.query.interval);
      }

      function onSuccess(res) {
        cachedData(res.data);
        formatedData = voiceData.getParticipants($scope.query.groupBy, $scope.query.interval);
        draw(formatedData);
      }

      function drawChart() {
        if (!cachedData()) {
          voiceData.resources.getChannelUsersInfo($scope.query)
            .success(onSuccess);
        } else {
          formatedData = voiceData.getParticipants($scope.query.groupBy, $scope.query.interval);
          draw(formatedData);
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

      $scope.groupBy = function() {
        chart.clear();
        drawChart();
      }

      init();
    };

    angular.module('AgoraApp').controller('callsCtrl', ctrl);
})();
