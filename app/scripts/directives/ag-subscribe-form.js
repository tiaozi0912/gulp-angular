(function(angular, ga) {
  'use strict';

  function sendUserInGA(user) {
    var CATEGORY = 'subscribe',
        ACTION = 'submit',
        label = JSON.stringify(user);

    ga('send', 'event', CATEGORY, ACTION, label);
  }

  var dir = function($templateCache) {
    return {
      restrict: 'A',
      template: $templateCache.get('directives/subscribe_form.html'),
      replace: true,
      scope: {},
      controller: function($scope, $interval) {
        function onSuccess() {
          var DURATION = 3000;
          $scope.user = {};

          $scope.success = true;

          $interval(function() {
            $scope.success = false;
          }, DURATION);
        }

        $scope.success = false;
        $scope.user = {};

        $scope.submit = function() {
          var user = $scope.user;

          if(user.name && user.email) {
            window.console.log(user);
            sendUserInGA(user);
            onSuccess();
          } else {
            window.alert('Please enter full name and email');
          }
        };
      }
    };
  };

  angular.module('AgoraApp').directive('agSubscribeForm', dir);
})(window.angular, window.ga);
