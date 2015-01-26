(function() {
  'use strict';

  var Session = function($rootScope) {
    this.create = function (user, sessionId) {
      $rootScope.currentUser = user;
      this.sessionId = sessionId;
      this.currentUser = user;
    };
    this.destroy = function () {
      $rootScope.currentUser = null;
      this.sessionId = null;
      this.currentUser = null;
    };
    return this;
  };

  angular.module('AgoraApp').service('Session', Session);
})();
