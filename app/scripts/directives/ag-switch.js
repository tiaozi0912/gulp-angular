/**
 * @name agSwitch
 *
 * @description
 * buttons group to switch
 *
 * <div ag-switch onselect="cb()" btns="btns" value="query" field="interval"></div>
 *
 * @param {Function} onselect - the function executed when a button clicked
 * @param {Object} btns       - array of buttons with at least keys: label and value
 * @param {Object} value       - the value that actually changed by the switch
 * @param {String} field      - the value field whose value is changed to the selected button's value
 */
(function(angular) {
  'use strict';

  var ctrl = function($scope) {
    $scope.select = function(btn) {
      $scope.value[$scope.field] = btn.value;
      $scope.onselect();
    };

    $scope.isActive = function(btn) {
      return btn.value === $scope.value[$scope.field] ? 'active' : '';
    };
  };

  var dir = function() {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        value: '=',
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
