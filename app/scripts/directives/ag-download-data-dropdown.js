(function() {
  'use strict';

  var ctrl = function($scope, $http) {
    var getPeriod = {
          yesterday: function() {
            return this._getStartEnd({
              value: 1,
              name: 'd'
            });
          },
          past_7_days: function() {
            return this._getStartEnd({
              value: 7,
              name: 'd'
            });
          },
          past_30_days: function() {
            return this._getStartEnd({
              value: 30,
              name: 'd'
            });
          },
          'past_12_months-monthly': function() {
            return this['past_12_months-yearly'];
          },
          'past_12_months-yearly': function() {
            return this._getStartEnd({
              value: 12,
              name: 'm'
            });
          },
          _getStartEnd: function(interval) {
            var yesterday = moment().subtract(1, 'd'),
                dt = moment().subtract(interval.value, interval.name);

            return {
              start: dt.startOf().unix(),
              end: yesterday.endOf().unix()
            };
          }
        },
        url = '/api/auth/data_download',
        MESSAGES = {
          downloaded: 'Dowloaded.',
          downloading: 'Downloading',
          noData: 'No data to download',
          error: 'Sorry but an error occurs. Please try later.'
        };

    $scope.periodOptions = [
      { value: 'yesterday', label: 'yesterday' },
      { value: 'past_7_days', label: 'past 7 days' },
      { value: 'past_30_days', label: 'past 30 days' },
      { value: 'past_12_months-monthly', label: 'past 12 months - monthly' },
      { value: 'past_12_months-yearly', label: 'past 12 months - yearly' }
    ];

    $scope.form = {};
    $scope.message = null;

    $scope.showDropdownMenu = false;

    function reset() {
      $scope.form = {};
      $scope.message = null;
    }

    $scope.toggleDropdownMenu = function() {
      $scope.showDropdownMenu = !$scope.showDropdownMenu;
      reset();
    };

    $scope.select = function() {
      if ($scope.form.period) {
        $scope.message = {
          content: MESSAGES.downloading,
          type: 'info'
        };

        _.extend($scope.form, getPeriod[$scope.form.period]());

        $http.get(url, {params: $scope.form})
          .success(function(res) {
            if (res.data && !res.data.length) {
              $scope.message = {
                content: MESSAGES.noData,
                type: 'warning'
              };
            } else {
              $scope.message = {
                content: MESSAGES.Dowloaded,
                type: 'success'
              };
            }
          })
          .error(function() {
            $scope.message = {
              content: MESSAGES.error,
              type: 'danger'
            };
          });
      } else {
        $scope.message = null;
      }
    };
  };

  var dir = function($templateCache) {
    return {
      restrict: 'A',
      replace: true,
      scope: {},
      template: $templateCache.get('directives/download_data_dropdown.html'),
      controller: ctrl
    };
  };

  angular.module('AgoraApp').directive('agDownloadDataDropdown', dir);
})();
