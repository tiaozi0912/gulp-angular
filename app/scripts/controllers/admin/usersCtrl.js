(function() {
  'use strict';

  var usersCtrl = function($scope, $http) {
    $http.get('/api/admin/users')
      .success(function(res) {
        $scope.users = _.sortBy(res.data, function(u) {
          return -u.created_at;
        });
      });
  };

  angular.module('AgoraApp').controller('adminUsersCtrl', usersCtrl);
})();
