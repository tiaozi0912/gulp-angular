(function() {
  'use strict';

  var ctrl = function($scope, $http, $rootScope, Session, AUTH_EVENTS, $state, $interval) {
  	var sendCodeUrl = '/api/reset_password_code',
  	    resetPasswordUrl = '/api/reset_password';

    $scope.user = {};
  	$scope.message = {};
  	$scope.processing = false;
  	$scope.requestedCode = false;

  	function onRequestCode() {
  		$scope.requestedCode = true;
  		$scope.message = {
        type: 'success',
        content: 'The security code is sent your email.'
      };

      $interval(function() {
        $scope.message = {};
      }, 3000);
  	}

  	function onResetPasswordSuccess(res) {
      $scope.message = {
        type: 'success',
        content: res.message
      };

      // Login and redirect after 1 sec
      $interval(function() {
        $scope.processing = false;
        Session.create(res.user, res.id);
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        $state.go('root.dashboard.overview');
      }, 1000);
  	}

  	function onResetPasswordError(res) {
      $scope.processing = false;
      $scope.message = {
        type: 'danger',
        content: res.message
      };
  	}

    $scope.sendCode = function(e) {
      e.preventDefault();

      $scope.message = {};

      $scope.user.email = $scope.user.email && $scope.user.email.trim();

      if (!$scope.user.email) {
      	$scope.message = {
      		type: 'danger',
      		content: 'Please enter a valid email.'
      	}

      	return;
      }

      onRequestCode();

      $http.post(sendCodeUrl, {email: $scope.user.email});
    };

    $scope.resetPassword = function(e) {
      e.preventDefault();

      $scope.message = {};

      $scope.user.access_token = $scope.user.access_token && $scope.user.access_token.trim();

      if (!$scope.user.access_token) {
      	$scope.message = {
      		type: 'danger',
      		content: 'Please enter the security code sent to your email.'
      	}

      	return;
      }

      if (!$scope.processing) {
        $scope.processing = true;
        $http.post(resetPasswordUrl, $scope.user)
          .success(onResetPasswordSuccess)
          .error(onResetPasswordError);
      }
    };
  };

  angular.module('AgoraApp').controller('resetPasswordCtrl', ctrl);
})();
