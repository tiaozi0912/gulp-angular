(function(angular, $) {
  'use strict';

  var module = angular.module('morph', []);

  var dir = function() {
    var options = {
      hoverState: {
        translateZ: '-1px'
      },
      hoverDuration: 400,
      clickState: {
        scale: 0.9
      },
      clickDuration: 200,
      openDuration: 400,
      openState: {
        width: '100%',
        height: '100%',
        translateZ: 0,
        scale: 1
      },
      bgClass: 'morph-bg'
    };

    /**
     * Get the initial values of all the properties
     *
     * @param  {Dict} options    - dict of properties and values
     * @param  {Dict} defaults   - dict of forced defaults
     * @return {Dict} resetOp
     */
    function _resetState(options, defaults) {
      var resetOp = {};

      $.each(options, function(prop) {
        resetOp[prop] = 0;
      });

      if (defaults) {
        $.extend(resetOp, defaults);
      }

      return resetOp;
    }

    return function(scope, elem, attrs) {
      var width = attrs.width,
          height = attrs.height,
          isOpen = false,
          hoverInitialState = _resetState(options.hoverState),
          openInitialState = _resetState(options.openState, {
            width: width,
            height: height,
            scale: 1
          }),
          $elem = $(elem),
          $bg = $('<div>')
            .addClass(options.bgClass)
            .prependTo($elem);

      // Hover effect:
      $elem.hover(function() {
        if (!isOpen) {
          $bg.velocity(options.hoverState);
        }
      }, function() {
        if (!isOpen) {
          $bg.velocity('stop', true)
            .velocity(hoverInitialState);
        }
      });

      // Click transition:
      $(elem).click(function() {
        if (isOpen) {

          // collapse
          $elem
            .velocity('reverse')     // back to the hover clicked state
            .velocity(openInitialState, {duration: options.openDuration});   // back to the initial state

          $bg
            .velocity({
              translateZ: 0
            });
        } else {

          // open
          $elem
            .velocity(options.clickState, {duration: options.clickDuration})  // to the clicked state
            .velocity(options.openState, {duration: options.openDuration}); // to the open state

          $bg
            .velocity(hoverInitialState);  // back to the initial state
        }

        isOpen = !isOpen;
      });
    };
  };

  module.directive('morphPage', dir);

})(window.angular, window.$);
