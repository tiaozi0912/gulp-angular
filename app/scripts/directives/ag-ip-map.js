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

  var zoom = 4,
      circleOptions = {
        stroke: {
          color: '#08B21F',
          weight: 2,
          opacity: 1
        },
        fill: {
          color: '#08B21F',
          opacity: 0.5
        },
        geodesic: true, // optional: defaults to false
        clickable: true, // optional: defaults to true
        visible: true, // optional: defaults to true
        baseRadius: 5000
      };

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

  function setCirlce(location) {
    var circle = {
      id: location.id,
      center: {
        latitude: location.lat,
        longitude: location.long
      },
      radius: circleOptions.baseRadius * location.count
    };

    return _.extend(circle, circleOptions);
  }

  function updateMap(scope, ipLocations) {
    if (ipLocations && ipLocations.length) {
      scope.circles = ipLocations.map(setCirlce);

      scope.map = {
        center: calCenterLongAndLat(scope.circles),
        zoom: zoom
      };
    }
  }

  var ctrl = function($scope) {
    $scope.options = {scrollwheel: false};
    $scope.map = {
      center: {
        longitude: 0,
        latitude: 0
      },
      zoom: zoom
    };

    updateMap($scope, $scope.ipLocations);

    $scope.$watchCollection('ipLocations', function() {
      updateMap($scope, $scope.ipLocations);
      console.log('center position: long:' + $scope.map.center.longitude + ', lag:' + $scope.map.center.latitude);
    });
  };

  var dir = function() {
    return {
      restrict: 'A',
      scope: {
        ipLocations: '='
      },
      controller: ctrl,
      template: '<ui-gmap-google-map center="map.center" zoom="map.zoom" options="options" draggable="true">' +
                  '<ui-gmap-circle ng-repeat="c in circles" center="c.center" stroke="c.stroke" fill="c.fill" radius="c.radius" visible="c.visible" geodesic="c.geodesic" editable="c.editable" draggable="c.draggable" clickable="c.clickable">' +
                '</ui-gmap-google-map>'
    };
  };

  angular.module('AgoraApp').directive('agIpMap', dir);
})();
