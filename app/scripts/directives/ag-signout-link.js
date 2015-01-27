(function() {
  'use strict';

  var dir = function(Auth, $state, agNotification) {
    return function(scope, element) {
    	element.on('click', function(e) {
    		e.preventDefault();

    		Auth.signout().then(function(res) {
          if (res) {
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
