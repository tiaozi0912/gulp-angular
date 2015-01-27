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
    var settings = {
      signin: {
        reverse: 'signup',
        title: 'Sign in your account',
        actionBtn: 'Sign in'
      },
      signup: {
        reverse: 'signin',
        title: 'Create an account for free',
        actionBtn: 'Sign up'
      }
    },
    initialRole;

    function onSignupSuccess(user) {
      $scope.processing = false;
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      window.console.log('signup successfully. set user:');
      window.console.log(user);
      $state.go('root.dashboard.verify_email');
    }

    function onSignupError(res) {
      $scope.processing = false;
      $scope.message.content = res.data.message;
      $scope.message.type = 'danger';
    }

    function onSigninSuccess(user) {
      console.log(user);
      $scope.processing = false;
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      $state.go('root.dashboard.overview');
    }

    function onSigninError(res) {
      $scope.processing = false;
      $scope.message.content = res.data.message;
      $scope.message.type = 'danger';
    }

    function reset() {
      $scope.message = {};
      $scope.processing = false;
    }

    initialRole = $scope.role;

    $scope.message = {};
    $scope.processing = false;

    if ($scope.title) {
      settings[$scope.role].title = $scope.title;
    }

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
      $scope.role = initialRole;
      $scope.title = settings[initialRole].title;
      reset();
      $rootScope.$broadcast('agAuthModal:dismiss');
    };

    $scope.authSwitch = function() {
      $scope.role = settings[$scope.role].reverse;
      $scope.title = settings[$scope.role].title;
      reset();
    };

    $scope.actionBtn = function() {
      return settings[$scope.role].actionBtn;
    };

    $scope.reversedActionBtn = function() {
      var reversedRole = settings[$scope.role].reverse;

      return settings[reversedRole].actionBtn;
    };
  };

  var dirForm = function($templateCache) {
    return {
      restrict: 'A',
      template: $templateCache.get('directives/auth_form.html'),
      scope: {
        role: '@',
        title: '@'
      },
      controller: ctrl,
      link: function(scope, elem, attr) {
        scope.isModal = attr.agAuthForm === 'modal';
      }
    };
  };

  angular.module('AgoraApp').directive('agAuthForm', dirForm);
})();
