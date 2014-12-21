(function($) {
  'use strict';

  var dir = function() {
    var settings = {
      duration: 400,
      delay: 500
    };

    function animate($path, settings, $elem) {
      $path
        .velocity({
          'stroke-dashoffset': 0
        }, {duration: settings.duration})
        .velocity({
          'opacity': 0
        }, {
          duration: settings.duration,
          complete: function() {
            $elem.hide();
            $(document).trigger('agPulse:complete');
          }
        });
    }

    return {
      restrict: 'A',
      template: '<svg version="1.1" class="ag-pulse" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 266.6 127.4" enable-background="new 0 0 266.6 127.4" xml:space="preserve">' +
                  '<path class="ag-pulse-path" fill="none" stroke-miterlimit="10" filter="url(#pulse-glow)" d="M266.6,48.1l-128.7,2l-10,28.7l-24.7-52.7l-25.3,78l-22-91.3L20.5,125.3L0.5,0.1"/>' +
                '</svg>',
      link: function(scope, elem) {
          var $elem = $(elem[0]),
              path = $elem.find('.ag-pulse-path')[0],
              length = path.getTotalLength();

          path.style.strokeDasharray = length.toString();
          path.style.strokeDashoffset = -length.toString();

          setTimeout(function() {
            animate($(path), settings, $elem);
          }, settings.delay);
      }
    };
  };

  window.angular.module('AgoraApp').directive('agPulse', dir);

})(window.Zepto);
