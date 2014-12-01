(function($) {
  'use strict';

  function smoothScroll(to, duration) {
    duration = duration || 400;

    var difference = to - $(window).scrollTop(),
        interval = 10,
        perTick = difference / duration * interval,
        $window = $(window),
        loop;

    window.scrollTo(0, $window.scrollTop() + perTick);

    loop = setInterval(function() {
      if (duration > 0) {
        duration -= interval;
        window.scrollTo(0, $window.scrollTop() + perTick);
      } else {
        clearInterval(loop);
      }
    }, interval);
  }

  var dir = function() {
    return function(scope, elem) {
      var $header = $('.site-header'),
          offset = 0,
          scrollTo = 0,
          $target;

      if ($header.length) {
        //offset = $header.height();
      }

      elem.on('click', function(e) {
        e.preventDefault();

        $target = $target || $($(this).attr('href'));

        if ($target.length) {
          scrollTo = scrollTo || $target.offset().top - offset;
          smoothScroll(scrollTo);
        }
      });
    };
  };

  window.angular.module('AgoraApp').directive('agLinkScroll', dir);

})(window.Zepto);
