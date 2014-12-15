(function(angular, $) {
  'use strict';

  /**
   * Define Morph class
   */
  var Morph = function($elem, width, height, options) {
    this.options = {
      hoverInitialState: {},
      hoverState: {
        translateZ: '-1px'
      },
      hoverDuration: 400,
      clickInitialState: {},
      clickState: {
        scale: 0.9
      },
      clickDuration: 200,
      openDuration: 400,
      openInitialState: {},
      openState: {
        width: '100%',
        height: '100%',
        translateZ: 0,
        scale: 1
      },
      openInitialStateBg: {
        translateZ: 0,
        scale: 1
      },
      bgClass: 'morph-bg'
    };

    this.options.hoverInitialState = this._resetState(this.options.hoverState);
    this.options.openInitialState = this._resetState(this.options.openState, {
      width: width,
      height: height
    });

    $.extend(this.options, options);

    this._isOpen = false;

    this._$elem = $elem;

    if (this.options.bgClass === false) {
      this._$bg = this._addBackground();
    }

    this._bindEvents();
  };

  /**
   * Binds hover and click event handlers
   */
  Morph.prototype._bindEvents = function() {
    var _this = this;

    this._$elem.hover(this._mouseenter.bind(_this), this._mouseleave.bind(_this));

    this._$elem.on('click', function() {
      if (_this._isOpen) {
        _this._close();
      } else {
        _this._open();
      }

      _this._isOpen = !_this._isOpen;
    });
  };

  /**
   * Transition effect when mouse enter
   */
  Morph.prototype._mouseenter = function() {
    if (!this._isOpen) {
      if (this._$bg) {
        this._$bg.velocity(this.options.hoverState);
      }
    }
  };

  /**
   * Transition effect when mouse leave
   */
  Morph.prototype._mouseleave = function() {
    if (!this._isOpen) {
      if (this._$bg) {
        this._$bg.velocity('stop', true)
          .velocity(this.options.hoverInitialState);
      }
    }
  };

  /**
   * Transition effect when the element opens
   */
  Morph.prototype._open = function() {
    this._$elem
      .velocity(this.options.clickState, {duration: this.options.clickDuration})  // to the clicked state
      .velocity(this.options.openState, {duration: this.options.openDuration}); // to the open state

    this._$bg
      .velocity(this.options.hoverInitialState);  // back to the initial state
  };

  /**
   * Transition effect when the element closes and back to the inital state
   */
  Morph.prototype._close = function() {
    this._$elem
      .velocity('reverse')     // back to the hover clicked state
      .velocity(this.options.openInitialState, {duration: this.options.openDuration});   // back to the initial state

    if (this._$bg) {
      this._$bg
        .velocity(this.options.openInitialStateBg);
    }
  };

 /**
   * Get the initial values of all the properties
   *
   * @param  {Dict} options    - dict of properties and values
   * @param  {Dict} defaults   - dict of forced defaults
   * @return {Dict} resetOp
   */
  Morph.prototype._resetState = function(options, defaults) {
    var resetOp = {};

    $.each(options, function(prop) {
      if (prop === 'scale') {
        resetOp[prop] = 1;
      } else {
        resetOp[prop] = 0;
      }
    });

    if (defaults) {
      $.extend(resetOp, defaults);
    }

    return resetOp;
  };

  /**
   * Add a background layer to visualize background
   */
  Morph.prototype._addBackground = function() {
    var $bg = $('<div>')
            .addClass(this.options.bgClass)
            .prependTo(this._$elem);

    return $bg;
  };

  /**
   * Angular plugin
   */
  var module = angular.module('morph', []);

  module.directive('morphPage', function() {
    return function(scope, elem, attrs) {
      new Morph($(elem), attrs.width, attrs.height);
    };
  });

})(window.angular, window.$);
