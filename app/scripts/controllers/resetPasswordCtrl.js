(function() {
  'use strict';

  var ctrl = function($scope, $http) {
  	var sendCodeUrl = '/api/reset_password_code',
  	    resetPasswordUrl = 'api/reset_password';
    
    $scope.user = {};
  	$scope.message = {};
  	$scope.processing = false;
  	$scope.requestedCode = false;

  	function onRequestCode() {
  		$scope.requestedCode = true;
  		$scope.processing = false;
  	}

  	function onResetPasswordSuccess() {

  	}

  	function onResetPasswordError() {

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

      $scope.processing = true;
      
      $http.post(sendCodeUrl, {email: $scope.user.email})
        .success(onRequestCode)
        .error(onRequestCode);
    };

    $scope.resetPassword = function(e) {
      e.preventDefault();

      $scope.message = {};
      $scope.processing = true;

      $http.post(resetPasswordUrl, {password: $scope.user.password})
        .success(onResetPasswordSuccess)
        .error(onResetPasswordError);
    };
  };

  angular.module('AgoraApp').controller('resetPasswordCtrl', ctrl);
})();