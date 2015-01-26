(function() {
  'use strict';

  var ctrl = function($scope) {
    $scope.periodOptions = [
      { value: 'yesterday', label: 'yesterday' },
      { value: 'past 7 days', label: 'past 7 days' },
      { value: 'past 30 days', label: 'past 30 days' },
      { value: 'past 12 months - monthly', label: 'past 12 months - monthly' },
      { value: 'past 12 months - yearly', label: 'past 12 months - yearly' }
    ];

    $scope.form = {};
    $scope.downloaded = false;
    $scope.processing = false;

    $scope.showDropdownMenu = false;

    function reset() {
      $scope.form = {};
      $scope.downloaded = false;
      $scope.processing = false;
    }

    $scope.toggleDropdownMenu = function() {
      $scope.showDropdownMenu = !$scope.showDropdownMenu;
      reset();
    };

    $scope.select = function() {
      $scope.processing = $scope.form.hasOwnProperty('period');
    };
  };

  var dir = function($templateCache) {
    return {
      restrict: 'A',
      replace: true,
      scope: {},
      template: $templateCache.get('directives/download_data_dropdown.html'),
      controller: ctrl
    };
  };

  angular.module('AgoraApp').directive('agDownloadDataDropdown', dir);
})();
