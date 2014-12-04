(function(angular) {
  'use strict';



  var dir = function($templaceCache) {
    return {
      restrict: 'A',
      template: $templateCache.get('directives/subscribe_form'),
      replace: true,
      controller: function($scope) {
        $scope.submit = function(user) {

        };
      }
    };
  };

  angular.module('AgoraApp').directive('agSubscribeForm', dir);
})(window.angular);
