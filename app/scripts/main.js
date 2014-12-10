/* jshint devel:true */
(function() {
  'use strict';

  var app = window.angular.module('AgoraApp', ['ui.router', 'templates', 'headroom']);

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
            controller: function($scope) {
              $scope.solutions = [
                {
                  title: 'Online education',
                  img: '/images/homepage/online_education.jpg'
                },
                {
                  title: 'Social',
                  img: '/images/homepage/social.jpg'
                },
                {
                  title: 'Dating',
                  img: '/images/homepage/dating.jpg'
                },
                {
                  title: 'Marketplace',
                  img: '/images/homepage/marketplace.jpg'
                },
                {
                  title: 'Gaming',
                  img: '/images/homepage/gaming.jpg'
                }
              ];

              $scope.docs = [
                {
                  title: 'iOS',
                  icon: 'fa-apple'
                },
                {
                  title: 'Android',
                  icon: 'fa-android'
                },
                {
                  title: 'Windows',
                  icon: 'fa-windows'
                }
              ];
            }
          }
        }
      });
  });

})();
