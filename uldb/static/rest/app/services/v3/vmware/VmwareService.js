'use strict';
var app = angular.module('uldb');
app.factory('VmwareService', [
    '$timeout',
    '$http',
    'RestService',
    'AdminApi',
    function ($timeout,
              $http,
              RestService,
              AdminApi) {

        return {
            //FOR GET REQUESTS

            get_vm_vcenters_data: function (url) {
                return RestService.get_data(url);
            },
            get_vm_status: function (url) {
                return RestService.get_data(url);
            },
            get_vmware_datacenter: function (url) {
                return RestService.get_data(url);
            },
            get_vmware_virtualmachines: function (url) {
                return RestService.get_data(url);
            },
            get_vmware_datastores: function (url) {
                return RestService.get_data(url);
            },
            get_vmware_hypervisors: function (url) {
                return RestService.get_data(url);
            },
            get_vmware_folders: function (url) {
                return RestService.get_data(url);
            },
            get_vmware_resource_pools: function (url) {
                return RestService.get_data(url);
            },
            get_vmware_snapshots: function (url) {
                return RestService.get_data(url);
            },
            get_vmware_clusters: function (url) {
                return RestService.get_data(url);
            },
            get_vmware_poweron: function (url) {
                return RestService.get_data(url);
            },
            get_vmware_poweroff: function (url) {

                return RestService.get_data(url);
            },
            get_vmware_deletevm: function (url) {
                return RestService.get_data(url);
            },
            get_vmware_delete_resourcepool: function (url) {
                return RestService.get_data(url);
            },
            get_vmware_listsnapshot: function (url) {
                return RestService.get_data(url);
            },
            //FOR POST REQUESTS
            send_modal_data: function (params, url) {
                return RestService._post_data(params, url);
            },

        };
    }]);
