/* jshint devel:true */
(function() {
  'use strict';

  var app = window.angular.module('AgoraApp', ['ui.router', 'templates', 'headroom', 'ngSanitize']);

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
            },
            controller: function($scope, $location) {
              $scope.navs = [
                {
                  label: 'product',
                  url: '/product'
                },
                {
                  label: 'solutions',
                  url: '/solutions/online_education'
                },
                {
                  label: 'pricing',
                  url: '/pricing'
                },
                {
                  label: 'docs',
                  url: '/docs/Android'
                },
                {
                  label: 'help',
                  url: '/help'
                }
              ];

              // Figure out the current page
              $scope.$on('$locationChangeSuccess', function() {
                $scope.page = $location.path();
              });
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
              $scope.featuresMore = {
                appCall: false,
                groupCall: false,
                integration: false
              };

              $scope.solutions = [
                {
                  title: 'Online education',
                  name: 'online_education',
                  img: '/images/homepage/online_education.jpg'
                },
                {
                  title: 'Social',
                  name: 'social',
                  img: '/images/homepage/social.jpg'
                },
                {
                  title: 'Dating',
                  name: 'dating',
                  img: '/images/homepage/dating.jpg'
                },
                {
                  title: 'Marketplace',
                  name: 'marketplace',
                  img: '/images/homepage/marketplace.jpg'
                },
                {
                  title: 'Gaming',
                  name: 'gaming',
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
      })
      .state('root.solution', {
        url: '/solutions/:name', // name: online_education, social, marketingplace, gaming, dating
        views: {
          'main@': {
            templateProvider: function($templateCache) {
              return $templateCache.get('solutions/show.html');
            },
            controller: function($scope, $stateParams, $templateCache) {
              var templateName = 'solutions/' + $stateParams.name + '.html';

              $scope.data = [
                {
                  name: 'online_education',
                  img: '/images/homepage/online_education.jpg'
                },
                {
                  name: 'social',
                  img: '/images/homepage/social.jpg'
                },
                {
                  name: 'marketplace',
                  img: '/images/homepage/marketplace.jpg'
                },
                {
                  name: 'gaming',
                  img: '/images/homepage/gaming.jpg'
                },
                {
                  name: 'dating',
                  img: '/images/homepage/dating.jpg'
                }
              ];

              $.each($scope.data, function(i, obj) {
                if (obj.name === $stateParams.name) {
                  $scope.currentTab = obj;
                }
              });

              $scope.currentTab.content = $templateCache.get(templateName);
            }
          }
        }
      })
      .state('root.docs', {
        url: '/docs/:name',
        views: {
          'main@': {
            templateProvider: function($templateCache) {
              return $templateCache.get('docs/show.html');
            },
            controller: function($scope, $stateParams, $templateCache) {
              var templateName = 'docs/' + $stateParams.name.toLowerCase() + '.html';

              $scope.data = [
                {
                  name: 'Android',
                  icon: 'fa-android'
                },
                {
                  name: 'iOS',
                  icon: 'fa-apple'
                },
                {
                  name: 'Windows',
                  icon: 'fa-windows'
                }
              ];

              $.each($scope.data, function(i, obj) {
                if (obj.name === $stateParams.name) {
                  $scope.currentTab = obj;
                }
              });

              $scope.currentTab.content = $templateCache.get(templateName);
            }
          }
        }
      })
      .state('root.product', {
        url: '/product',
        views: {
          'main@': {
            templateProvider: function($templateCache) {
              return $templateCache.get('product.html');
            }
          }
        }
      })
      .state('root.help', {
        url: '/help',
        views: {
          'main@': {
            templateProvider: function($templateCache) {
              return $templateCache.get('help.html');
            }
          }
        }
      })
      .state('root.about', {
        url: '/about',
        views: {
          'main@': {
            templateProvider: function($templateCache) {
              return $templateCache.get('about.html');
            }
          }
        }
      })
      .state('root.pricing', {
        url: '/pricing',
        views: {
          'main@': {
            templateProvider: function($templateCache) {
              return $templateCache.get('pricing.html');
            }
          }
        }
      })
      .state('root.career', {
        url: '/career',
        views: {
          'main@': {
            templateProvider: function($templateCache) {
              return $templateCache.get('career.html');
            },
            controller: function($scope) {
              $scope.navs = [
                {
                  label: 'Marketing',
                  link: '#marketing-jobs'
                },
                {
                  label: 'Engineering',
                  link: '#engineering-jobs'
                }
              ];

              $scope.selected = $scope.navs[0];

              $scope.select = function(nav, e) {
                e.preventDefault();
                $scope.selected = nav;
              };
            }
          }
        }
      })
      .state('root.privacy', {
        url: '/privacy',
        views: {
          'main@': {
            templateProvider: function($templateCache) {
              return $templateCache.get('privacy.html');
            }
          }
        }
      })
      .state('root.contact', {
        url: '/contact',
        views: {
          'main@': {
            templateProvider: function($templateCache) {
              return $templateCache.get('contact.html');
            }
          }
        }
      });
  });

})();
