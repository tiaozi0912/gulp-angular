(function() {
  'use strict';

  var filter = function() {
    return function(timestamp) {
      var format = 'l LT',  // 9/4/1986 8:30 PM
          m = moment.unix(timestamp);

      return m.format(format);
    };
  };

  angular.module('AgoraApp').filter('datetimeDisplay', filter);
})();
