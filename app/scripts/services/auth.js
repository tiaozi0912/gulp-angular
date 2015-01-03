(function(angular) {
  'use strict';

  var Auth = function($http, Session) {
    this.signup = function(user) {
      return $http
        .post('/api/signup', {user: user})
        .then(function(res) {
          window.console.log(res);

          Session.create(res.id, res.user.id,
                         res.user.role);
          return res.user;
        });
    };

    this.signin = function (credentials) {
      return $http
        .post('/api/signin', credentials)
        .then(function (res) {
          Session.create(res.id, res.user.id,
                         res.user.role);
          return res.user;
        });
    };

    this.isAuthenticated = function () {
      return Session.userId !== null && typeof Session.userId !== 'undefined';
    };

    this.isAuthorized = function (authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }

      return (this.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
    };

    return this;
  };

  angular.module('AgoraApp').service('Auth', Auth);
})(window.angular);
