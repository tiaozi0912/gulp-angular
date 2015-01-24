(function() {
  'use strict';

  var ctrl = function($scope, $http) {
    var url = '/api/auth/users/' + $scope.user.id;

    $scope.processing = false;

    $scope.submit = function(e) {
      e.preventDefault();
      $scope.processing = true;

      $http.put(url, $scope.user)
        .success(function(res) {
          console.log(res.message);
        })
        .error(function(res) {
          console.log(res.message);
        });
    };
  };

  angular.module('AgoraApp').controller('accountCtrl', ctrl);
})();
