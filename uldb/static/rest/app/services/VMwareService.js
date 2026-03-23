'use strict';
var app = angular.module('uldb');
app.factory('VMwareService', [
    '$http',
    '$q',
    function ($http, $q) {
        return {
            get_vmware_vcenter: function find_vcenter_data() {
                var obj = { vcenter_data: null };
                $http({
                    method: 'GET',
                    url: '/static/custom_data/vcenter.json'
                }).then(function successCallback(response) {
                    obj.vcenter_data = response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
                return obj;
            },
            get_vmware_datacenter: function find_vmware_datacenter() {
                var obj = { datacenter_data: null };
                $http({
                    method: 'GET',
                    url: '/static/custom_data/Datacenters.json'
                }).then(function successCallback(response) {
                    obj.datacenter_data = response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
                return obj;
            },
            get_vmware_datastores: function find_vmware_datastores() {
                var obj = { datastores_data: null };
                $http({
                    method: 'GET',
                    url: '/static/custom_data/Datastores.json'
                }).then(function successCallback(response) {
                    obj.datastores_data = response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
                return obj;
            },
            get_vmware_hypervisors: function find_vmware_hypervisors() {
                var obj = { hypervisors_data: null };
                $http({
                    method: 'GET',
                    url: '/static/custom_data/VirtualMachines.json'
                }).then(function successCallback(response) {
                    obj.hypervisors_data = response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
                return obj;
            },
            get_vmware_virtualmachines: function find_vmware_virtualmachines() {
                var obj = { virtualmachines_data: null };
                $http({
                    method: 'GET',
                    url: '/static/custom_data/VirtualMachines.json'
                }).then(function successCallback(response) {
                    obj.virtualmachines_data = response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
                return obj;
            },
            get_vmware_vswitches: function find_vmware_vswitches() {
                var obj = { vswitches_data: null };
                $http({
                    method: 'GET',
                    url: '/static/custom_data/Vswitches.json'
                }).then(function successCallback(response) {
                    obj.vswitches_data = response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
                return obj;
            },
            get_vmware_customers: function find_vmware_customers() {
                var obj = { customers_data: null };
                $http({
                    method: 'GET',
                    url: '/static/custom_data/Customers.json'
                }).then(function successCallback(response) {
                    obj.customers_data = response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
                return obj;
            },

            get_alerts_data: function find_alerts_data() {
                var obj = { alerts_data: null };
                $http({
                    method: 'GET',
                    url: '/static/custom_data/alerts_data.json'
                }).then(function successCallback(response) {
                    obj.alerts_data = response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
                return obj;
            },

            get_tickets_data: function find_tickets_data() {
                var obj = { tickets_data: null };
                $http({
                    method: 'GET',
                    url: '/static/custom_data/tickets_data.json'
                }).then(function successCallback(response) {
                    obj.tickets_data = response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
                return obj;
            },

            get_ms_data: function find_ms_data() {
                var obj = { ms_data: null };
                $http({
                    method: 'GET',
                    url: '/static/custom_data/ms_data.json'
                }).then(function successCallback(response) {
                    obj.ms_data = response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
                return obj;
            }

        };
    }]);
