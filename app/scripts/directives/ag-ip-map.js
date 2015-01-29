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

  function setMarker(location) {
    var marker = {
      id: location.id,
      latitude: location.lat,
      longitude: location.long,
      title: location.count || 1,
      options: {
        labelContent: location.count || 1,
        labelAnchor: '0 60'
      }
    };

    return marker;
  };

  function updateMap(scope, ipLocations) {
    if (ipLocations && ipLocations.length) {
      //scope.circles = ipLocations.map(setCirlce);
      scope.markers = ipLocations.map(setMarker);

      // scope.map = {
      //   center: calCenterLongAndLat(scope.circles),
      //   zoom: zoom
      // };
    }
  }

  var ctrl = function($scope) {
    var bounds = new google.maps.LatLngBounds(),
        mapInstance;

    $scope.map = {
      center: {
        longitude: 0,
        latitude: 0
      },
      zoom: zoom,
      options: {scrollwheel: false}
    };

    $scope.markers = [];

    $scope.googleMap = {};

    $scope.cluster = {
      options: {
        averageCenter: true
      }
    };

    function getMapInstance() {
      if ($scope.googleMap.getGMap) {
        return $scope.googleMap.getGMap();
      }
      return null;
    }

    $scope.$watchCollection('ipLocations', function() {
      mapInstance = mapInstance || getMapInstance();

      updateMap($scope, $scope.ipLocations);

      // _.each($scope.circles, function(c) {
      //   fitBounds(mapInstance, bounds, c);
      // });
    });
  };

  var dir = function() {
    return {
      restrict: 'A',
      scope: {
        ipLocations: '='
      },
      controller: ctrl,
      // template: '<ui-gmap-google-map center="map.center" zoom="map.zoom" options="options" draggable="true" control="googleMap">' +
      //             '<ui-gmap-circle ng-repeat="c in circles" stroke="c.stroke" fill="c.fill" radius="c.radius" visible="c.visible" geodesic="c.geodesic" editable="c.editable" draggable="c.draggable" clickable="c.clickable" center="c.center">' +
      //           '</ui-gmap-google-map>'
      template: '<ui-gmap-google-map center="map.center" zoom="map.zoom" options="map.options" draggable="true">' +
                  '<ui-gmap-markers models="markers" coords="\'self\'" fit="true" options="\'options\'" doCluster="true" clusterOptions="cluster.options">' +
                '</ui-gmap-google-map>'
    };
  };

  angular.module('AgoraApp').directive('agIpMap', dir);
})();
