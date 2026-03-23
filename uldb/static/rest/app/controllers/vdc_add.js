var app = angular.module('uldb');

/*** VDC Add Controller ***/

app.controller('VDCAddController', [
    '$scope',
    'VirtualDataCenter',
    'Organization',
    'VCenter',
    'AvailableServer',
    'AvailableSAN',
    'AvailableFirewall',
    'AvailableLoadbalancer',
    'AvailableSwitch',
    '$http',
    'URLService',
    '$filter',
    '$location',
    function ($scope, VirtualDataCenter, Organization, VCenter, AvailableServer, AvailableSAN, AvailableFirewall, AvailableLoadbalancer, AvailableSwitch, $http, URLService, $filter, $location) {

        $scope.vdc = new VirtualDataCenter();

        window.customer_url = undefined;

        $scope.VisibleVCenter = false;
        $scope.AhowAddDiv = false;
        $scope.ShowServer = false;
        $scope.ShowSAN = false;
        $scope.ShowFirewall = false;
        $scope.ShowLoadbalancer = false;
        $scope.ShowSwitch = false;

        /*** Get vcenter server details ***/

        VCenter.get().$promise.then(function (response) {
            $scope.virtualcenter = response.results;
        });

        /*** load Organization on type ***/

        $scope.getOrgs = function (val) {
            return Organization.get({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };

        /*** Enable add divs  ***/

        $scope.ShowServerDiv = function () {
            $scope.ShowServer = !($scope.ShowServer);
            if ($scope.ShowServer) {
                AvailableServer.get().$promise.then(function (response) {
                    $scope.inv_servers = response.servers;
                });
            }
            else {
                $scope.vdc.servers = undefined;
            }
        };

        $scope.ShowSANDiv = function () {
            $scope.ShowSAN = !($scope.ShowSAN);
            if ($scope.ShowSAN) {
                AvailableSAN.get().$promise.then(function (response) {
                    $scope.inv_san = response.servers;
                });
            }
            else {
                $scope.vdc.storage_servers = undefined;
            }
        };

        $scope.ShowFirewallDiv = function () {
            $scope.ShowFirewall = !($scope.ShowFirewall);
            if ($scope.ShowFirewall) {
                AvailableFirewall.get().$promise.then(function (response) {
                    $scope.inv_firewall = response.firewalls;
                });
            }
            else {
                $scope.vdc.firewalls = undefined;
            }
        };

        $scope.ShowLBDiv = function () {
            $scope.ShowLoadbalancer = !($scope.ShowLoadbalancer);
            if ($scope.ShowLoadbalancer) {
                AvailableLoadbalancer.get().$promise.then(function (response) {
                    $scope.inv_loadbalancer = response.loadbalancers;
                });
            }
            else {
                $scope.vdc.loadbalancers = undefined;
            }
        };

        $scope.ShowSwitchDiv = function () {
            $scope.ShowSwitch = !($scope.ShowSwitch);
            if ($scope.ShowSwitch) {
                AvailableSwitch.get().$promise.then(function (response) {
                    $scope.inv_switch = response.switches;
                });
            }
            else {
                $scope.vdc.switches = undefined;
            }
        };

        $scope.AddVDCDet = function (customer) {
            if (customer) {
                $scope.AhowAddDiv = true;

            }
            else {
                $scope.AhowAddDiv = false;
            }
        };

        /*** show vcenter dropdown on select VMware ***/

        $scope.ShowVCenter = function (SelectedItem) {
            if (SelectedItem == "VMware") {
                $scope.VisibleVCenter = true;
            }
            else {
                $scope.VisibleVCenter = false;
            }
        };

        /*** save vdc details ***/

        $scope.SaveVDCAdd = function () {


            var vdcvalidated = true;

            if ($scope.vdc.customer && $scope.vdc.customer.url) {
                window.customer_name = $scope.vdc.customer.organization_name;
                window.customer_url = $scope.vdc.customer;
            }
            else {
                if (window.customer_url) {
                    $scope.vdc.customer = window.customer_url;
                }
            }

            if ($scope.vdc && $scope.vdc.name) {
                $scope.nameerr = false;
                if (vdcvalidated)
                    vdcvalidated = true;
            }
            else {
                $scope.nameerr = true;
                vdcvalidated = false;
                $scope.nameMsg = "This field is required";
            }

            if ($scope.vdc && $scope.vdc.cloud_type) {
                $scope.cloudtypeerr = false;
                if (vdcvalidated)
                    vdcvalidated = true;
            }
            else {
                $scope.cloudtypeerr = true;
                vdcvalidated = false;
                $scope.cloudtypeMsg = "This field is required";
            }

            if ($scope.vdc && $scope.vdc.customer) {
                $scope.customererr = false;
                if (vdcvalidated)
                    vdcvalidated = true;
            }
            else {
                $scope.customererr = true;
                vdcvalidated = false;
                $scope.customerMsg = "This field is required";
            }


            if (vdcvalidated) {

                $scope.vdc.$save().then(function (result) {

                    window.customer_name = "";
                    window.customer_url = "";

                    $location.path("/virtualdatacenter/").search({ param: "Virtual Data Center " + $scope.vdc.name + " added" });


                }, function (error) {

                    //angular.element(document.querySelector("#id_cloud_name")).focus();

                    $scope.vdc.customer = window.customer_name;

                    if (error.data.name) {
                        $scope.nameerr = true;
                        $scope.nameMsg = error.data.name[0];
                    }
                    else {
                        $scope.nameerr = false;
                    }

                    if (error.data.cloud_type) {
                        $scope.cloudtypeerr = true;
                        $scope.cloudtypeMsg = error.data.cloud_type[0];
                    }
                    else {
                        $scope.cloudtypeerr = false;
                    }


                    if (error.data.customer) {
                        $scope.customererr = true;
                        $scope.customerMsg = error.data.customer[0];
                    }
                    else {
                        $scope.customererr = false;
                        $scope.vdc.customer = window.customer_name;
                    }


                });
            }
            else {
                $scope.vdc.customer = window.customer_name;
                //angular.element(document.querySelector("#id_cloud_name")).focus();
            }
        };

        /*** clear all validation messages ***/

        $scope.ClearValidation = function () {
            $scope.nameMsg = "";
            $scope.cloudtypeMsg = "";
            $scope.customerMsg = "";

        };


        /*** cancel vdc add ***/

        $scope.CancelVDCAdd = function () {
            $location.path("/virtualdatacenter");
        };


    }
]);



