(function() {
  'use strict';

  var ctrl = function($scope, $location, $rootScope, siteResources, AUTH_EVENTS) {
    var $navbarToggleBtn = $('.navbar-header .navbar-toggle'),
        $navbar = $('.site-header .header-collapse'),
        $secondaryNav,
        hiddenCls = 'ag-hide';

    $scope.user = $rootScope.currentUser;

    $scope.navs = siteResources.headerNavs;

    $scope.showSigninModal = function() {
      $rootScope.$broadcast('agAuthModal:show');
    };

    // When page changes
    // @todo: move this to app.run()
    $scope.$on('$locationChangeSuccess', function() {

      // Hide the dropdown navs in mobile and scroll top
      if ($navbarToggleBtn.css('display') !== 'none') {
        $navbar.addClass(hiddenCls);
      }

      $(window).scrollTop(0);

      // Hide the dropdown in the secondary nav
      if (!$secondaryNav || !$secondaryNav.length) {
        $secondaryNav = $('.site-header .secondary-nav .dropdown');
      }

      if ($secondaryNav.length) {
        $secondaryNav.find('.dropdown-menu').addClass(hiddenCls);
      }
    });

    $scope.$on(AUTH_EVENTS.logoutSuccess, function() {
      $scope.user = {};
    });

    $scope.$on(AUTH_EVENTS.loginSuccess, function() {
      $scope.user = $rootScope.currentUser;
    });
  };

  angular.module('AgoraApp').controller('siteHeaderCtrl', ctrl);
})();

