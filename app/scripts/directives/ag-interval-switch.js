/**
 * @name agIntervalSwitch
 *
 * @description 
 * buttons group to switch between 'hourly' and 'day'
 *
 * <div ag-interval-switch onselect="cb()" data="query" field="interval"></div>
 *
 * @param {Function} onselect - the function executed when a button clicked
 * @param {Object} data       - the data that actually changed by the switch
 * @param {String} field      - the data field whose value is changed to the selected button's value
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
      replace: true,
      scope: {
        data: '=',
        onselect: '&',
        field: '@'
      },
      template: '<div ag-switch btns="btns" onselect="onselect()" data="data" field="{{field}}"></div>',
      controller: ctrl
    };
  };

  angular.module('AgoraApp').directive('agIntervalSwitch', dir);
})(window.angular);
