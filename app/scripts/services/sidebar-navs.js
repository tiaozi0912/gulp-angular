(function() {
  'use strict';

  var navsService = function() {
    this.data = [{
                  name: 'overview',
                  url: '/overview',
                  state: 'overview'
                },
                {
                  name: 'participants',
                  url: '/participants',
                  state: 'participants'
                },
                {
                  name: 'calls',
                  url: '/calls',
                  state: 'calls'
                },
                {
                  name: 'ip',
                  url: '/ip',
                  state: 'ip'
                },
                {
                  name: 'account',
                  url: '/account',
                  state: 'account'
                }];

    return this;
  };

  window.angular.module('AgoraApp').service('sidebarNavs', navsService);
})();
