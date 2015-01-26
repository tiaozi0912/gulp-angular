(function() {
  'use strict';

  var Auth = function($http, Session) {
    this.signup = function(user) {
      return $http
        .post('/api/signup', {user: user})
        .then(function(res) {
          Session.create(res.data.user, res.data.id, r.id);
          return res.data.user;
        });
    };

    this.signin = function (credentials) {
      return $http
        .post('/api/signin', {user: credentials})
        .then(function (res) {
          Session.create(res.data.user, res.data.id);
          return res.data.user;
        });
    };

    this.reAuthorize = function() {
      return $http
        .get('/api/reauthorize')
        .then(function (res) {
          Session.create(res.data.user, res.data.id);
          return res.data.user;
        }, function() {
          return false;
        });
    };

    this.signout = function() {
      return $http
        .get('/api/signout').then(function() {
          Session.destroy();

          return true;
        }, function() {
          return false;
        });
    };

    this.isAuthenticated = function () {
      return Session.currentUser !== null && typeof Session.currentUser !== 'undefined';
    };

    this.isAuthorized = function (authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }

      return (this.isAuthenticated() && authorizedRoles.indexOf(Session.currentUser.role) !== -1);
    };

    return this;
  };

  angular.module('AgoraApp').service('Auth', Auth);
})();
