(function() {
  'use strict';

  var ctrl = function($scope, $http, agNotification) {
    var editableProperties = ['name', 'email', 'company_name', 'phone'],
        url = '/api/auth/users/' + $scope.user.id,
        data;

    $scope.processing = false;

    $scope.submit = function(e) {
      e.preventDefault();
      $scope.processing = true;

      data = _.pick($scope.user, editableProperties);

      $http.put(url, data)
        .success(function(res) {
          $scope.processing = false;
          new agNotification(res.message);
        })
        .error(function(res) {
          $scope.processing = false;
          new agNotification(res.message, {type: 'danger'});
        });
    };
  };

  angular.module('AgoraApp').controller('accountCtrl', ctrl);
})();
