(function() {
  'use strict';

  var ctrl = function($scope, voiceData) {
    $scope.reports = [
      {
        name: 'delay',
        title: 'Delay in the past',
        getYValue: function(d) {
          return d.y / 10;
        }
      },
      {
        name: 'lost',
        title: 'Lost in the past',
        getYValue: function(d) {
          return d.y / 10;
        }
      },
      {
        name: 'discontinuity',
        title: 'Discontinuity in the past',
        getYValue: function(d) {
          return d.y;
        }
      }
    ];

    // Set cacheOption and fetch method
    _.each($scope.reports, function(report) {
      report.cacheOption = {
        category: 'quality',
        subCategory: report.name
      };

      report.fetch = function(params) {
        return voiceData.resources.getQualityReport(report.name, params);
      };
    });

    // Set fetch method
  };

  angular.module('AgoraApp').controller('qualityCtrl', ctrl);
})();
