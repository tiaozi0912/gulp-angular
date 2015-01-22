(function($) {
  'use strict';

  /**
   * Borrowed form Bootstrap scrollspy.js
   */

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    var process  = $.proxy(this.process, this);

    this.$body          = $('body');
    this.$scrollElement = $(element).is('body') ? $(window) : $(element);
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options);

    if (!this.options.target || typeof this.options.target === 'string') {
      this.selector = (this.options.target || '') + ' .nav li > a';
      this.selector = $(this.selector);
    } else {
      this.selector = this.options.target.find('li > a');
    }

    this.offsets        = [];
    this.targets        = [];
    this.activeTarget   = null;
    this.scrollHeight   = 0;

    //this.$scrollElement.on('scroll.bs.scrollspy', process);
    this.$scrollElement.on('scroll', process);
    this.refresh();
    this.process();
  }

  ScrollSpy.VERSION  = '3.3.1';

  ScrollSpy.DEFAULTS = {
    offset: 10
  };

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight);
  };

  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = 'offset';
    var offsetBase   = 0;

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position';
      offsetBase   = this.$scrollElement.scrollTop();
    }

    this.offsets = [];
    this.targets = [];
    this.scrollHeight = this.getScrollHeight();

    var self     = this;

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this);
        var href  = $el.data('target') || $el.attr('href');
        var $href = /^#./.test(href) && $(href);

        return ($href && $href.length && [[$href[offsetMethod]().top + offsetBase, href]]) || null;
      })
      .sort(function (a, b) { return a[0] - b[0]; })
      .each(function () {
        self.offsets.push(this[0]);
        self.targets.push(this[1]);
      });
  };

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset;
    var scrollHeight = this.getScrollHeight();
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height();
    var offsets      = this.offsets;
    var targets      = this.targets;
    var activeTarget = this.activeTarget;
    var i;

    if (this.scrollHeight !== scrollHeight) {
      this.refresh();
    }

    if (scrollTop >= maxScroll) {
      return activeTarget !== (i = targets[targets.length - 1]) && this.activate(i);
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null;
      return this.clear();
    }

    for (i = offsets.length; i--;) {
      if (activeTarget !== targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1])) {
        this.activate(targets[i]);
      }
    }
  };

  ScrollSpy.prototype.activate = function (target) {
    var active;

    this.activeTarget = target;

    this.clear();

    this.selector.each(function() {
      if ($(this).data('target') === target || $(this).attr('href') === target) {
        active = $(this);
      }
    });

    active.parents('li').addClass('active');

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active');
    }

    active.trigger('activate.bs.scrollspy');
  };

  ScrollSpy.prototype.clear = function () {
    var $parent = this.selector.parent();

    if ($parent.hasClass('active')) {
      $parent.removeClass('active');
    }
  };

  var dir = function($timeout) {
    return function(scope, elem) {
      $timeout(function() {
        new ScrollSpy(window, {
          target: $(elem[0]),
          offset: $('.site-header').height() * 1.1
        });
      }, 500);
    };
  };

  angular.module('AgoraApp').directive('agScrollSpy', dir);
})(window.Zepto);
