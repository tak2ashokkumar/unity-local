'use strict';
var app = angular.module('uldb');
app.factory('AzureService', [
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
            get_azure_content_data: function (url) {
                return RestService.get_data(ClientApi.azure_account);
            },
            get_resource_group_data: function (url) {
                var results = [
                    {
                        location: "centralus",
                        name: "Unity_test",
                        tag: "type:test"

                    },
                    {
                        location: "centralus",
                        name: "Unity_dev",
                        tag: "type:dev"

                    },
                    {
                        location: "centralus",
                        name: "Unity_prod",
                        tag: "type:prod"

                    },
                ];
                return results;
            },
            get_resource_data: function (url) {
                var results = [
                    {
                        name: 'Virtual Machine 1',
                        resource_group: 'Unity_test',
                        tags: 'type:test',
                        kind: 'blank',
                        properties: 'N/A',
                        managed_by: 'N/A',
                        plan: 'N/A',
                        type: 'N/A',
                        identity: 'N/A',
                        location: 'centralus',

                    },
                    {
                        name: 'Virtual Machine 2',
                        resource_group: 'Unity_prod',
                        tags: 'type:none',
                        kind: 'blank',
                        properties: 'N/A',
                        managed_by: 'N/A',
                        plan: 'N/A',
                        type: 'N/A',
                        identity: 'N/A',
                        location: 'centralus',
                    },

                ];
                return results;
            },
        };
    }
]);
