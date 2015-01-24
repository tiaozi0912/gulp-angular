/**
 * Simple notification service
 */

(function() {
  'use strict';

  var service = function($rootScope, $compile) {
    var Notification = function(msg, options) {
      this.settings = {
        type: 'success',
        duration: 3000
      };

      this.$element = null;

      this.template = '<div class="alert alert-{{notification.type}} site-alert">{{notification.msg}}</div>';

      this.msg = msg;
      _.extend(this.settings, options);

      this._bindScope();

      this.show();
    };

    Notification.prototype._bindScope = function() {
      $rootScope.notification = {
        msg: this.msg
      };

      _.extend($rootScope.notification, this.settings);
    };

    Notification.prototype.show = function() {
      var _this = this;

      this.$element = $($compile(this.template)($rootScope)[0]);

      console.log(this.$element[0]);

      this.$element.appendTo('body');

      setTimeout(function() {
        _this.dismiss();
      }, _this.settings.duration);
    };

    Notification.prototype.dismiss = function() {
      this.$element.remove();
    };

    return Notification;
  };

  angular.module('AgoraApp').factory('agNotification', service);
})();
