(function() {
  'use strict';

  var ctrl = function($scope, siteResources) {
    $scope.layout = siteResources.currLayout;
  };

  angular.module('AgoraApp').controller('siteCtrl', ctrl);
})();

