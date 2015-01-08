/* jshint devel:true */
(function($, moment, Chart) {
  'use strict';

  var isInit = true; // Flag the page is refreshed or loaded

  var app = window.angular.module('AgoraApp', ['ui.router', 'templates', 'headroom', 'ngSanitize']);

  app.run(function($rootScope, AUTH_EVENTS, Auth, $state, sidebarNavs) {
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

      // Set the active sidebar nav
      $.each(sidebarNavs.data, function(i, nav) {
        if (nav.url === next.url) {
          nav.active = true;
        } else {
          nav.active = false;
        }
      });
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
            controller: function($scope, $location, $rootScope) {
              var $navbarToggleBtn = $('.navbar-header .navbar-toggle'),
                  $navbar = $('.site-header .header-collapse'),
                  hiddenCls = 'ag-hide';

              $scope.navs = [
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

              $scope.user = $rootScope.currentUser;

              $scope.showSigninModal = function() {
                $rootScope.$broadcast('agAuthModal:show');
              };

              // When page changes
              $scope.$on('$locationChangeSuccess', function() {
                // Figure out the current page
                $scope.page = $location.path();

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
          role: 'user'
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
            controller: function($scope, $rootScope, sidebarNavs) {
              $scope.navs = sidebarNavs.data;
            }
          }
        }
      })
      .state('root.dashboard.overview', {
        url: '/overview',
        templateProvider: function($templateCache) {
          return $templateCache.get('dashboard/overview.html');
        },
        controller: function($scope, $rootScope, $http, agTime, agChart) {
          var url = '/api/dashboard/voice_usage',
              params = {
                start: new Date('2014-12-01').getTime() / 1000,//moment().startOf('month').unix(),
                end: new Date('2014-12-31').getTime() / 1000//moment().endOf('month').unix()
              },
              ctx = document.getElementById("overview-chart").getContext("2d"),
              getMinutes = function(d) {
                return d.usage / 60;
              };

          $scope.user = $rootScope.currentUser;

          $http.get(url, {params: params})
            .success(function(res) {
              agChart.drawLineChart(ctx, moment.unix(params.start), moment.unix(params.end), res.data, getMinutes);
            });
        }
      })
      .state('root.dashboard.participants', {
        url: '/participants',
        templateProvider: function($templateCache) {
          return $templateCache.get('dashboard/participants.html');
        },
        controller: function($scope, $rootScope) {
          $scope.user = $rootScope.currentUser;
        }
      });
  });

})(window.Zepto, window.moment, window.Chart);
