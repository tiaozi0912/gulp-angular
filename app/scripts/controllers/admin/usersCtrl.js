(function() {
  'use strict';

  var usersCtrl = function($scope, $http) {
    $http.get('/api/admin/users')
      .success(function(res) {
        $scope.users = res.data;
      });
  };

  angular.module('AgoraApp').controller('adminUsersCtrl', usersCtrl);
})();