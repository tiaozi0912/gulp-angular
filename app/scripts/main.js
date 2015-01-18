/* jshint devel:true */
(function($, moment) {
  'use strict';

  // Config Chart global settings


  var isInit = true; // Flag the page is refreshed or loaded

  var app = angular.module('AgoraApp', ['ui.router', 'templates', 'headroom', 'ngSanitize', 'uiGmapgoogle-maps']);

  app.run(function($rootScope, AUTH_EVENTS, Auth, $state, siteResources) {
    function onNotAuthorized(event) {
      if (event) {
        event.preventDefault();
      }

      $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
    }

    $rootScope.$on('$stateChangeStart', function(event, next) {
      if (isInit) {
        // Handling page refresh
        event.preventDefault();
        Auth.reAuthorize().then(function(user) {
          if (user) {
            $rootScope.currentUser = user;
          }

          if (next.data && next.data.role === 'user' && !Auth.isAuthenticated()) {
            onNotAuthorized();
          } else {
            $state.go(next.name);
          }
        });
      } else {
        if (next.data && next.data.role === 'user' && !Auth.isAuthenticated()) {
          onNotAuthorized(event);
        }
      }

      isInit = false;

      // Set the current header nav
      siteResources.setCurrHeaderNav(next);

      // Set the current sidebar nav
      siteResources.setCurrSidebarNav(next);

      // Set the current layout name
      if (next.data && next.data.layout) {
        siteResources.currLayout.name = siteResources.layouts[next.data.layout];
      }
    });
  });

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
            controller: function($scope, $location, $rootScope, siteResources) {
              var $navbarToggleBtn = $('.navbar-header .navbar-toggle'),
                  $navbar = $('.site-header .header-collapse'),
                  hiddenCls = 'ag-hide';

              $scope.navs = siteResources.headerNavs;

              $scope.user = $rootScope.currentUser;

              $scope.showSigninModal = function() {
                $rootScope.$broadcast('agAuthModal:show');
              };

              // When page changes
              $scope.$on('$locationChangeSuccess', function() {

                // Hide the dropdown navs in mobile and scroll top
                if ($navbarToggleBtn.css('display') !== 'none') {
                  $navbar.addClass(hiddenCls);
                }

                $(window).scrollTop(0);
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
                  icon: 'fa-apple',
                  link: '/docs'
                },
                {
                  title: 'Android',
                  icon: 'fa-android',
                  link: '/docs'
                },
                {
                  title: 'Windows',
                  icon: 'fa-windows',
                  link: '/docs'
                }
              ];
            }
          }
        }
      })
      .state('root.solutions', {
        url: '/solutions',
        views: {
          'main@': {
            templateProvider: function($templateCache) {
              return $templateCache.get('solutions/list.html');
            },
            controller: function($scope) {
              $scope.navs = [
                {
                  label: 'Online education',
                  link: '#online-education'
                },
                {
                  label: 'Social',
                  link: '#social'
                },
                {
                  label: 'Marketplace',
                  link: '#marketplace'
                },
                {
                  label: 'Gaming',
                  link: '#gaming'
                },
                {
                  label: 'Dating',
                  link: '#dating'
                }
              ];

              $scope.selected = $scope.navs[0];

              $scope.select = function(nav) {
                $scope.selected = nav;
              };
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
        url: '/docs',
        views: {
          'main@': {
            templateProvider: function($templateCache) {
              return $templateCache.get('docs/list.html');
            }
          }
        }
      })
      .state('root.doc', {
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
            },
            controller: function($scope, $rootScope) {
              var showHero = function() {
                $('.banner-section .transparent').removeClass('transparent');
              };

              $(document).on('agPulse:complete', showHero);

              $scope.$on('$destroy', function() {
                $(document).off(showHero);
              });

              $scope.showAuthModal = function(e) {
                e.preventDefault();
                $rootScope.$broadcast('agAuthModal:show');
              };
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

              if ($(window).width() < 768) {
                $scope.isMobile = true;
              }

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
      })
      .state('root.dashboard', {
        url: '/dashboard',
        data: {
          role: 'user',
          layout: 'dashboard'
        },
        views: {
          'main@': {
            templateProvider: function($templateCache) {
              return $templateCache.get('dashboard/index.html');
            },
            controller: function($scope, $rootScope) {
              $scope.user = $rootScope.currentUser;
            }
          },
          'site-sidebar@root.dashboard': {
            templateProvider: function($templateCache) {
              return $templateCache.get('dashboard/sidebar.html');
            },
            controller: function($scope, $rootScope, siteResources) {
              $scope.navs = siteResources.sidebarNavs;
            }
          }
        }
      })
      .state('root.dashboard.overview', {
        url: '/overview',
        templateProvider: function($templateCache) {
          return $templateCache.get('dashboard/overview.html');
        },
        controller: 'overviewCtrl'
      })
      .state('root.dashboard.participants', {
        url: '/participants',
        templateProvider: function($templateCache) {
          return $templateCache.get('dashboard/participants.html');
        },
        controller: 'participantsCtrl'
      })
      .state('root.dashboard.calls', {
        url: '/calls',
        templateProvider: function($templateCache) {
          return $templateCache.get('dashboard/calls.html');
        },
        controller: 'callsCtrl'
      });
  });

})(window.Zepto, window.moment);
