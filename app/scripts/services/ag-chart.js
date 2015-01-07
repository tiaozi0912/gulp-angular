(function(moment, $) {
  'use strict';

  var chart = function(agTime) {
    this.config = {
      fillColor: "rgba(220,220,220,0.2)",
      strokeColor: "rgba(220,220,220,1)",
      pointColor: "rgba(220,220,220,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(220,220,220,1)"
    };

    this.drawLineChart = function(ctx, start, end, rawData, interval) {
      var datesDomain = agTime.getDatesRange(start, end),
          data = {
            datasets: []
          },
          rawDataHash = {},
          d, completedData;

      datesDomain = datesDomain.map(function(m) {
        return m.format(agTime.dateFormat);
      });

      data.labels = datesDomain;

      // Turn raw data into hash
      $.each(rawData, function(i, d) {
        rawDataHash[d.datetime] = d;
      });

      completedData = datesDomain.map(function(date) {
        d = rawDataHash[date];

        if (d) {
          return d.usage / 60;  // NOTES: not general
        } else {
          return 0;
        }
      });

      data.datasets.push({
        data: completedData
      });

      $.extend(data.datasets[0], this.config);

      return new Chart(ctx).Line(data);
    };

    return this;
  };

  angular.module('AgoraApp').service('agChart', chart);
})(window.moment, window.Zepto);
