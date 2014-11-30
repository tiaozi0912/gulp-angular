/* jshint devel:true */
(function() {
  'use strict';

  var app = window.angular.module('AgoraApp', ['ui.router', 'templates']);

  // route:
  app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });

    // for any unmatched url
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        controller: function($scope) {
          $scope.a = 'a';
          window.console.log('home page');
        },
        templateProvider: function($templateCache) {
          return $templateCache.get('home.html');
        }
      })
      .state('docs', {
        url: '/docs',
        templateProvider: ['$templateCache', function($templateCache) {
          return $templateCache.get('docs.html');
        }]
      })
      .state('help', {
        url: '/help',
        templateProvider: ['$templateCache', function($templateCache) {
          return $templateCache.get('help.html');
        }]
      });
  });

})();
