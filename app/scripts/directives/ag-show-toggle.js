(function($) {
  'use strict';

  var dir = function() {
    return {
      scope: {
        target: '@' // id or class or tag
      },
      link: function(scope, elem) {
        var TOGGLE_CLASS = 'ag-show-toggle',
            HIDE_CLASS = 'ag-hide';

        var state = 0, // 0: hide, 1: show
            $target;

        if (!scope.target) {
          return;
        }

        if (scope.target[0] === '#') { // id
          $target = $(scope.target);
        } else { // class or tag: search in siblings
          $target = $(elem[0]).parent().find(scope.target);
        }

        if ($target) {
          $target.addClass(TOGGLE_CLASS);
          $target.addClass(HIDE_CLASS);
          elem.on('click', function() {
            $target.toggleClass(HIDE_CLASS);
            state = state === 1 ? 0 : 1;
          });
        }
      }
    };
  };

  angular.module('AgoraApp').directive('agShowToggle', dir);

})(window.Zepto);
