/**
 * @name agSwitch
 *
 * @description 
 * buttons group to switch
 *
 * <div ag-switch onselect="cb()" btns="btns" data="query" field="interval"></div>
 *
 * @param {Function} onselect - the function executed when a button clicked
 * @param {Object} btns       - array of buttons with at least keys: label and value
 * @param {Object} data       - the data that actually changed by the switch
 * @param {String} field      - the data field whose value is changed to the selected button's value
 */
(function(angular) {
  'use strict';

  var ctrl = function($scope) {
    $scope.select = function(btn) {
      $scope.data[$scope.field] = btn.value;
      $scope.callback();
    };

    $scope.isActive = function(btn) {
      return btn.value === $scope.data[$scope.field];
    };
  };

  var dir = function() {
    return {
      restrict: 'A',
      scope: {
        data: '=',
        onselect: '&',
        btns: '=',
        field: '@'
      },
      template: '<div class="btn-group">' +
                  '<button type="button" class="btn btn-default" ng-repeat="btn in btns" ng-class="isActive(btn)" ng-click="select(btn)">{{btn.label}}</button>' +
                '</div>',
      controller: ctrl
    };
  };

  angular.module('AgoraApp').directive('agSwitch', dir);
})(window.angular);
