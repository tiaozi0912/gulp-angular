(function() {
  'use strict';

  var dir = function(Auth, $rootScope, $state, agNotification, AUTH_EVENTS) {
    return function(scope, element) {
    	element.on('click', function(e) {
    		e.preventDefault();

    		Auth.signout().then(function(res) {
          if (res) {
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);

            $state.go('root.home');
            new agNotification('Signed out successfully.');
          } else {
            new agNotification('Something went wrong. Please try later.', { type:'error' });
          }
    		});
    	});
    };
  };

  angular.module('AgoraApp').directive('agSignoutLink', dir);
})();
