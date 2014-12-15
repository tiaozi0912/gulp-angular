/* jshint devel:true */
(function() {
  'use strict';

  var app = window.angular.module('AgoraApp', ['ui.router', 'templates', 'morph']);

  // routes:
  app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });

    // for any unmatched url
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('root', {
        url: '',
        abstract: true,
        views: {
          header: {
            templateProvider: function($templateCache) {
              return $templateCache.get('header.html');
            }
          },
          footer: {
            templateProvider: function($templateCache) {
              return $templateCache.get('footer.html');
            }
          }
        }
      })
      .state('root.home', {
        url: '/',
        views: {
          'main@': {
            templateProvider: function($templateCache) {
              return $templateCache.get('home.html');
            },
            controller: function() {
              $('.section-a').click(function() {
                $(this).toggleClass('unfold');
              });
            }
          }
        }
      });
  });

})();
