(function(angular) {
  'use strict';

  var ctrl = function($scope) {
    $scope.btns = [
      {name: 'day'},
      {name: 'hourly'}
    ];

    $scope.select = function(btn) {
      $scope.query.interval = btn.name;
      $scope.callback();
    };
  };

  var dir = function() {
    return {
      restrict: 'A',
      scope: {
        query: '=',
        callback: '&'
      },
      template: '<div class="btn-group">' +
                  '<button type="button" class="btn btn-default" ng-repeat="btn in btns" ng-class="{active:btn.name==query.interval}" ng-click="select(btn)">{{btn.name}}</button>' +
                '</div>',
      controller: ctrl
    };
  };

  angular.module('AgoraApp').directive('agAggregationControl', dir);
})(window.angular);
