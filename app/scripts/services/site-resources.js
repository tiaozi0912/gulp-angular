/**
 * Defines site global resources
 * Change corresponding to the state / location change
 */
(function() {
  'use strict';

  var sideBarNavs = [{
                      name: 'overview',
                      url: '/overview',
                      state: 'overview',
                      icon: 'fa-bar-chart'
                    },
                    {
                      name: 'users',
                      url: '/participants',
                      state: 'participants',
                      icon: 'fa-users'
                    },
                    {
                      name: 'calls',
                      url: '/calls',
                      state: 'calls',
                      icon: 'fa-comments-o'
                    },
                    {
                      name: 'account',
                      url: '/account',
                      state: 'account',
                      icon: 'fa-gear'
                    }];

  var headerNavs = [
                      {
                        label: 'product',
                        url: '/product'
                      },
                      {
                        label: 'solutions',
                        url: '/solutions'
                      },
                      {
                        label: 'pricing',
                        url: '/pricing'
                      },
                      {
                        label: 'docs',
                        url: '/docs'
                      },
                      {
                        label: 'help',
                        url: '/help'
                      }
                    ];

  var siteResources = function() {
    this.sidebarNavs = sideBarNavs;
    this.headerNavs = headerNavs;

    this.layouts = {
      marketing: 'marketing-layout',
      dashboard: 'dashboard-layout'
    };
    this.currLayout = {
      name: this.layouts.marketing
    };

    this._setCurrNav = function(state, navs) {
      _.each(navs, function(nav) {
        if (nav.url === state.url) {
          nav.active = true;
        } else {
          nav.active = false;
        }
      });
    };

    this.setCurrHeaderNav = function(state) {
      this._setCurrNav(state, this.headerNavs);
    };

    this.setCurrSidebarNav = function(state) {
      this._setCurrNav(state, this.sidebarNavs);
    };

    return this;
  };

  angular.module('AgoraApp').service('siteResources', siteResources);
})();
