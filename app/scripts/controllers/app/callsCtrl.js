(function() {
  'use strict';

  var ctrl = function($scope, $http, agTime, agChart, voiceData) {
    $scope.query = {
      interval: 'day',
      groupBy: 'total'
    };
    $scope.groupByBtns = [
      { label: 'total', value: 'total' },
      { label: 'call length', value: 'call length' },
      { label: 'number of participants', value: 'participants number' }
    ];
    $scope.loading = {
      channelUsers: true
    };
    $scope.hasData = {
      channelUsers: true
    };

    var canvas = document.getElementById('calls-chart'),
        getCount = function(d) {
          return d.count;
        },
        chart = new agChart(canvas),
        dataStore = voiceData.data.calls,
        formatedData;

    function cachedData(data) {
      if (data) {
        dataStore.channelUsers[$scope.query.interval] = data;
      }

      return dataStore.channelUsers[$scope.query.interval];
    }

    function draw(data) {
      chart.drawLineChart(moment.unix($scope.query.start), moment.unix($scope.query.end), data, getCount, $scope.query.interval);
    }

    function onSuccess(res) {
      $scope.loading.channelUsers = false;

      cachedData(res.data);
      formatedData = voiceData.getCalls($scope.query.groupBy, $scope.query.interval);
      draw(formatedData);

      if (!res.data.length) {
        $scope.hasData.channelUsers = false;
      }
    }

    function drawChart() {
      if (!cachedData()) {
        voiceData.resources.getChannelUsersInfo($scope.query)
          .success(onSuccess);
      } else {
        $scope.loading.channelUsers = false;

        formatedData = voiceData.getCalls($scope.query.groupBy, $scope.query.interval);
        draw(formatedData);

        if (!cachedData().length) {
          $scope.hasData.channelUsers = false;
        }
      }
    }

    function onDay() {
      $scope.query.end = moment().unix();
      $scope.query.start = moment().subtract(30, 'd').unix();
      //$scope.query.start = moment('2014-12-01').unix();
      //$scope.query.end = moment('2014-12-31').unix();//
    }

    function onHourly() {
      $scope.query.start = moment().subtract(24, 'h').unix();
      $scope.query.end = moment().unix();
      //$scope.query.start = moment('2014-12-18').startOf('day').unix();
      //$scope.query.end = moment('2014-12-18').endOf('day').unix();
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
    };

    init();
  };

  angular.module('AgoraApp').controller('callsCtrl', ctrl);
})();
