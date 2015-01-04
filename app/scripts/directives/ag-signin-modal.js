(function(angular) {
  'use strict';

  var ctrl = function($scope, AUTH_EVENTS) {
    function showModal() {
      $scope.visible = true;
    }

    function dismissModal() {
      $scope.visible = false;
    }

    $scope.visible = false;

    $scope.$on(AUTH_EVENTS.notAuthenticated, showModal);
    $scope.$on(AUTH_EVENTS.loginSuccess, dismissModal);
    $scope.$on('agAuthModal:show', showModal);
    $scope.$on('agAuthModal:dismiss', dismissModal);
  };

  var dir = function() {
    return {
      restrict: 'A',
      replace: true,
      template: '<div id="signin-modal" class="fade ag-modal modal" role="dialog" ng-class="{in:visible}" tabindex="-1" aria-labelledby="signinModal" aria-hidden="true">' +
          '<div class="modal-dialog">' +
            '<div ag-auth-form="modal" role="signin">SIGN IN</div>' +
          '</div>' +
        '</div>',
      controller: ctrl
    };
  };

  angular.module('AgoraApp').directive('agSigninModal', dir);
})(window.angular);
