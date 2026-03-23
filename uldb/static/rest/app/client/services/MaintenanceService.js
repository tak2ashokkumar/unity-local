'use strict';
var app = angular.module('uldb');
app.factory('MaintenanceService', [
    '$timeout',
    '$http',
    'RestService',
    'ClientApi',
    function ($timeout,
              $http,
              RestService,
              ClientApi) {
        var getJsonfilePath = function (name) {
            return ClientApi.custom_data_url.replace(':filename', name);
        };
        return {
            get_mschedules_content_data: function () {
                return RestService.get_data('/customer/mschedules/');
            }
        };
    }
]);
