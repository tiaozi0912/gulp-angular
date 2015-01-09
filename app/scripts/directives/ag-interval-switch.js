/**
 * @name agIntervalSwitch
 *
 * @description
 * buttons group to switch between 'hourly' and 'day'
 *
 * Notes: {Function} onSelect, {Object} query must be defined in the $scope.onSelect and $scope.query
 *
 * <div ag-interval-switch></div>
 *
 */
(function(angular) {
  'use strict';

  var ctrl = function($scope) {
    $scope.btns = [
      {label: 'day', value: 'day'},
      {label: 'hourly', value: 'hourly'}
    ];
  };

  var dir = function() {
    return {
      restrict: 'A',
      template: '<div ag-switch btns="btns" value="query" onselect="onSelect()" field="interval"></div>',
      controller: ctrl
    };
  };

  angular.module('AgoraApp').directive('agIntervalSwitch', dir);
})(window.angular);
