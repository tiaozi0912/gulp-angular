(function() {
  'use strict';

  var filter = function() {
    return function(interval) {
      var mapping = {
        day: '30 days',
        hourly: '24 hours'
      };

      return mapping[interval];
    };
  };

  angular.module('AgoraApp').filter('intervalDisplay', filter);
})();
