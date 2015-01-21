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

  var zoom = 8,
      circleOptions = {
        stroke: {
          color: '#1aa1e5',
          weight: 2,
          opacity: 1
        },
        fill: {
          color: '#1aa1e5',
          opacity: 0.95
        },
        geodesic: true, // optional: defaults to false
        clickable: true, // optional: defaults to true
        visible: true, // optional: defaults to true
        baseRadius: 10000
      };

  /**
   * Not used
   */
  // function calCenterLongAndLat(circles) {
  //   var center = {
  //         longitude: 0,
  //         latitude: 0
  //       },
  //       len = circles.length,
  //       sortedCircles;

  //   if (circles.length === 0) {
  //     return center;
  //   }

  //   //center = circles[parseInt(len / 2)].center;

  //   // average longitutde and latitude
  //   sortedCircles = _.sortBy(circles, function(c) {
  //     return c.center.longitude;
  //   });

  //   center.longitude = (sortedCircles[0].center.longitude + sortedCircles[len - 1].center.longitude);

  //   sortedCircles = _.sortBy(circles, function(c) {
  //     return c.center.latitude;
  //   });

  //   center.latitude = (sortedCircles[0].center.latitude + sortedCircles[len - 1].center.latitude) / 2;

  //   console.log('latitude:' + center.latitude + ' longitude:' + center.longitude) / 2;

  //   return center;
  // }

  function fitBounds(map, bounds, circle) {
    if (bounds && !_.isEmpty(map) && circle) {
      var latLng = new google.maps.LatLng(circle.center.latitude, circle.center.longitude);
      bounds.extend(latLng);
      map.fitBounds(bounds);
    }
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

      // scope.map = {
      //   center: calCenterLongAndLat(scope.circles),
      //   zoom: zoom
      // };
    }
  }

  var ctrl = function($scope) {
    var bounds = new google.maps.LatLngBounds(),
        mapInstance;

    $scope.options = {scrollwheel: false};
    $scope.map = {
      center: {
        longitude: 0,
        latitude: 0
      },
      zoom: zoom
    };

    $scope.googleMap = {};

    function getMapInstance() {
      if ($scope.googleMap.getGMap) {
        return $scope.googleMap.getGMap();
      }
      return null;
    }

    $scope.$watchCollection('ipLocations', function() {
      mapInstance = mapInstance || getMapInstance();

      updateMap($scope, $scope.ipLocations);

      _.each($scope.circles, function(c) {
        fitBounds(mapInstance, bounds, c);
      });
    });
  };

  var dir = function() {
    return {
      restrict: 'A',
      scope: {
        ipLocations: '='
      },
      controller: ctrl,
      template: '<ui-gmap-google-map center="map.center" zoom="map.zoom" options="options" draggable="true" control="googleMap">' +
                  '<ui-gmap-circle ng-repeat="c in circles" stroke="c.stroke" fill="c.fill" radius="c.radius" visible="c.visible" geodesic="c.geodesic" editable="c.editable" draggable="c.draggable" clickable="c.clickable" center="c.center">' +
                '</ui-gmap-google-map>'
    };
  };

  angular.module('AgoraApp').directive('agIpMap', dir);
})();
