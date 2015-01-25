/**
 * Signup or signin form
 *
 * role: signup, signin
 *
 * Usage:
 * <div ag-auth-form data-role="signup">Sign up</div>
 */
(function() {
  'use strict';

  var ctrl = function($scope, $rootScope, Auth, AUTH_EVENTS, $state) {
    function onSignupSuccess(user) {
      $rootScope.currentUser = user;
      $scope.processing = false;
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      window.console.log('signup successfully. set user:');
      window.console.log(user);
      $state.go('root.dashboard.verify_email');
    }

    function onSignupError(res) {
      $scope.processing = false;
      window.console.log(res.data.message);
    }

    function onSigninSuccess(user) {
      $scope.processing = false;
      $rootScope.currentUser = user;
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      $state.go('root.dashboard.overview');
    }

    function onSigninError(res) {
      $scope.processing = false;
      window.console.log(res.data.message);
    }

    $scope.processing = false;

    $scope.submit = function() {
      if (!$scope.processing) {
        $scope.processing = true;

        if ($scope.role === 'signup') {
          Auth.signup($scope.user).then(onSignupSuccess, onSignupError);
        }

        if ($scope.role === 'signin') {
          Auth.signin($scope.user).then(onSigninSuccess, onSigninError);
        }
      }
    };

    $scope.dismiss = function() {
      $rootScope.$broadcast('agAuthModal:dismiss');
    };
  };

  var dirForm = function($templateCache) {
    return {
      restrict: 'A',
      template: $templateCache.get('directives/auth_form.html'),
      transclude: true,
      scope: {
        role: '@'
      },
      controller: ctrl,
      link: function(scope, elem, attr) {
        scope.isModal = attr.agAuthForm === 'modal';
      }
    };
  };

  angular.module('AgoraApp').directive('agAuthForm', dirForm);
})();
