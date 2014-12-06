(function(angular, ga) {
  'use strict';

  function sendUserInGA(user) {
    var CATEGORY = 'subscribe',
        ACTION = 'submit',
        label = JSON.stringify(user);

    ga('send', 'event', CATEGORY, ACTION, label);
  }

  var dirForm = function($templateCache) {
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
      },
      link: function(scope, elem, attr) {
        scope.isModal = attr.agSubscribeForm === 'modal';
      }
    };
  };

  angular.module('AgoraApp').directive('agSubscribeForm', dirForm);
})(window.angular, window.ga);
