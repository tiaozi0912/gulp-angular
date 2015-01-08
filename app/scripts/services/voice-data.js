(function(moment) {
  'use strict';

  var voiceData = function($http) {
    /**
     * Cache data
     * @todo: set expiration
     */
    this.data = {
      usage: { day: null, hourly: null },
      channelUsers: { day: null, hourly: null },
    };

    this.resources = {
      getVoiceUsage: function(params) {
        var url = '/api/dashboard/voice_usage';

        return $http.get(url, {params: params});
      },
      getChannelUsersInfo: function(params) {

      }
    };

    return this;
  };

  angular.module('AgoraApp').service('voiceData', voiceData);
})(window.moment);
