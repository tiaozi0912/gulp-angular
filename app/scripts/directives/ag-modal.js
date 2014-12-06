(function(angular, $) {
  'use strict';

  var dir = function() {
    return function(scope, elem, attr) {
      var MODAL_SHOW_CLS = 'in',
         target = attr.target || $(elem[0]).attr('href');

      if (attr.agModal === 'dismiss') {                     // dismiss modal button
        var $modal = $(elem[0]).parents('.ag-modal');

        elem.on('click', function(e) {
          e.preventDefault();

          $modal.removeClass(MODAL_SHOW_CLS);
        });
      } else {                                              // toggle modal button
        $(document).ready(function() {
          if (!$(target).length) {
            return;
          }

          elem.on('click', function(e) {
            e.preventDefault();

            $(target).toggleClass(MODAL_SHOW_CLS);
          });
        });
      }
    };
  };

  angular.module('AgoraApp').directive('agModal', dir);
})(window.angular, window.Zepto);
