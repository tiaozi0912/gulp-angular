/**
 * @name agIpMap
 *
 * @description
 * Display google maps with circle marked representing the ips
 *
 * <div ag-ip-map data-ip-locations="ipLocations"></div>
 */

(function() {
  'use strict';

  function calCenterLongAndLat(circles) {
    var center = {
          longitude: 0,
          latitude: 0
        },
        len = circles.length,
        sortedCircles;

    if (circles.length === 0) {
      return center;
    }

    center = circles[parseInt(len / 2)].center;

    return center;
  }

  var ctrl = function($scope) {
    var center = calCenterLongAndLat($scope.circles),
        zoom = 4;

    $scope.map = {
      center: center,
      zoom: zoom
    };

    $scope.options = {scrollwheel: false};

    $scope.$watchCollection('circles', function() {
      $scope.map.center = calCenterLongAndLat($scope.circles);
      console.log('center position: long:' + $scope.map.center.longitude + ', lag:' + $scope.map.center.latitude);
    });
  };

  var dir = function() {
    return {
      restrict: 'A',
      scope: {
        circles: '='
      },
      controller: ctrl,
      template: '<ui-gmap-google-map center="map.center" zoom="map.zoom" options="options" draggable="true">' +
                  '<ui-gmap-circle ng-repeat="c in circles" center="c.center" stroke="c.stroke" fill="c.fill" radius="c.radius" visible="c.visible" geodesic="c.geodesic" editable="c.editable" draggable="c.draggable" clickable="c.clickable">' +
                '</ui-gmap-google-map>'
    };
  };

  angular.module('AgoraApp').directive('agCircleMap', dir);
})();
