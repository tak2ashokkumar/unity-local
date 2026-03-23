var app = angular.module('uldb');

/*** VDC Edit Controller ***/

app.controller('VDCEditController', [
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

        // arrow-circle-left
        // arrow-circle-right
        // forward
        // backward

        //vdc/1/get_customer_servers - get customer details

        $scope.vdc = new VirtualDataCenter();

        window.customer_url = undefined;

        $scope.VisibleVCenter = false;
        $scope.VisibleVDCdet = false;

        $scope.vdc.servers = [];
        $scope.vdc.storage_Servers = [];
        $scope.vdc.firewalls = [];
        $scope.vdc.loadbalancers = [];
        $scope.vdc.switches = [];

        $scope.vdc.inv_servers = [];
        $scope.vdc.inv_storage_Servers = [];
        $scope.vdc.inv_firewalls = [];
        $scope.vdc.inv_loadbalancers = [];
        $scope.vdc.inv_switches = [];


        var editURL = URLService.GetSetURL("");

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

        AvailableServer.get().$promise.then(function (response) {

            $scope.inv_servers = response.servers;
        }, function (error) {
            $scope.inv_servers = [];
        });

        AvailableSAN.get().$promise.then(function (response) {

            $scope.inv_san = response.servers;
        }, function (error) {
            $scope.inv_san = [];
        });

        AvailableFirewall.get().$promise.then(function (response) {

            $scope.inv_firewall = response.firewalls;
        }, function (error) {
            $scope.inv_firewall = [];
        });

        AvailableLoadbalancer.get().$promise.then(function (response) {

            $scope.inv_loadbalancer = response.loadbalancers;
        }, function (error) {

            $scope.inv_loadbalancer = [];
        });

        AvailableSwitch.get().$promise.then(function (response) {

            $scope.inv_switch = response.switches;
        }, function (error) {
            $scope.inv_switch = [];
        });


        if (editURL && editURL != "") {
            /*** get vdc details ***/

            $http.get(editURL).then(function (response) {


                $scope.vdc.id = response.data.id;
                $scope.vdc.name = response.data.name;
                $scope.vdc.cloud_type = response.data.cloud_type;

                if (response.data.vcenter) {
                    $scope.vdc.vcenter = response.data.vcenter;
                    $scope.VisibleVCenter = true;
                }
                else {
                    $scope.VisibleVCenter = false;
                }

                $scope.DisableCustomer = true;
                $scope.DisableCloudType = true;
                $scope.DisableVCenter = true;
            });

            $http.get(editURL + "get_customer_servers/").then(function (response) {

                var cust_servers = [];
                var cust_san = [];
                var cust_firewall = [];
                var cust_loadbalancer = [];
                var cust_switch = [];

                if (response.data.customer) {
                    $scope.vdc_customer = response.data.customer[0].organization_name;
                    window.customer_name = response.data.customer[0].organization_name;
                    window.customer = response.data.customer[0];
                }
                else {
                    window.customer = "";
                }

                if (response.data.servers) {

                    $scope.cust_servers = response.data.servers;
                    for (var i = 0; i <= response.data.servers.length - 1; i++) {
                        cust_servers.push(response.data.servers[i]);
                    }
                    $scope.vdc.servers = cust_servers;
                }


                if (response.data.storage_servers) {
                    $scope.cust_san = response.data.storage_servers;
                    for (var i = 0; i <= response.data.storage_servers.length - 1; i++) {
                        cust_san.push(response.data.storage_servers[i]);
                    }
                    $scope.vdc.storage_Servers = cust_san;
                }

                if (response.data.firewalls) {
                    $scope.cust_firewall = response.data.firewalls;
                    for (var i = 0; i <= response.data.firewalls.length - 1; i++) {
                        cust_firewall.push(response.data.firewalls[i]);
                    }
                    $scope.vdc.firewalls = cust_firewall;
                }

                if (response.data.loadbalancers) {
                    $scope.cust_loadbalancer = response.data.loadbalancers;
                    for (var i = 0; i <= response.data.loadbalancers.length - 1; i++) {
                        cust_loadbalancer.push(response.data.loadbalancers[i]);
                    }
                    $scope.vdc.loadbalancers = cust_loadbalancer;
                }

                if (response.data.switches) {
                    $scope.cust_switch = response.data.switches;
                    for (var i = 0; i <= response.data.switches.length - 1; i++) {
                        cust_switch.push(response.data.switches[i]);
                    }
                    $scope.vdc.switches = cust_switch;
                }


            });
        }

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

        $scope.SaveVDCEdit = function () {

            $scope.DisableCustomer = false;
            $scope.DisableCloudType = false;
            $scope.DisableVCenter = false;

            var vdcvalidated = true;

            if (angular.isUndefined(window.customer) == false) {
                if (window.customer === "" && window.isDeleted) {
//                    $scope.vdc.customer = $scope.vdc.customer;
                    console.log("Customer VDC :",$scope.vdc.customer);
                }
                else {
                    $scope.vdc.customer = window.customer;
                }
            }
            else {
                if ($scope.vdc.customer) {
                    console.log("Customer VDC :",$scope.vdc.customer);
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

                VirtualDataCenter.update({
                    'id': $scope.vdc.id,
                    'name': $scope.vdc.name,
                    'cloud_type': $scope.vdc.cloud_type,
                    'vcenter': $scope.vdc.vcenter,
                    'customer': $scope.vdc.customer,
                    'servers': $scope.vdc.servers,
                    'storage_servers': $scope.vdc.storage_Servers,
                    'firewalls': $scope.vdc.firewalls,
                    'loadbalancers': $scope.vdc.loadbalancers,
                    'switches': $scope.vdc.switches
                }).$promise.then(function (results) {

                    window.customer_name = "";
                    window.customer_url = "";

                    $location.path("/virtualdatacenter/").search({ param: "Virtual Data Center " + $scope.vdc.name + " Updated" });


                }, function (error) {


                    $scope.DisableCustomer = true;
                    $scope.DisableCloudType = true;
                    $scope.DisableVCenter = true;

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
                $scope.DisableCustomer = true;
                $scope.DisableCloudType = true;
                $scope.DisableVCenter = true;

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

        $scope.CancelVDCEdit = function () {
            $location.path("/virtualdatacenter");
        };


        $scope.AddServer = function (curservers, servers) {

            for (var j = 0; j <= curservers.length - 1; j++) {
                for (var i = 0; i <= servers.length - 1; i++) {
                    if (curservers[j].url == servers[i].url) {

                        $scope.cust_servers.push(servers[i]);
                        $scope.vdc.servers.push(servers[i]);
                        var idx = $scope.inv_servers.indexOf(servers[i]);
                        $scope.inv_servers.splice(idx, 1);
                    }
                }
            }
        };

        $scope.RemoveServer = function (curservers, servers) {

            for (var j = 0; j <= curservers.length - 1; j++) {
                for (var i = 0; i <= servers.length - 1; i++) {
                    if (curservers[j].url == servers[i].url) {

                        $scope.inv_servers.push(servers[i]);
                        $scope.vdc.inv_servers.push(servers[i]);
                        var idx = $scope.cust_servers.indexOf(servers[i]);
                        $scope.cust_servers.splice(idx, 1);
                    }
                }
            }
        };

        /*** san ***/

        $scope.AddSANS = function (cursan, san) {

            for (var j = 0; j <= cursan.length - 1; j++) {
                for (var i = 0; i <= san.length - 1; i++) {
                    if (cursan[j].url == san[i].url) {

                        $scope.cust_san.push(san[i]);
                        $scope.vdc.storage_Servers.push(san[i]);
                        var idx = $scope.inv_san.indexOf(san[i]);
                        $scope.inv_san.splice(idx, 1);
                    }
                }
            }
        };

        $scope.RemoveSANS = function (cursan, san) {

            for (var j = 0; j <= cursan.length - 1; j++) {
                for (var i = 0; i <= san.length - 1; i++) {
                    if (cursan[j].url == san[i].url) {

                        $scope.inv_san.push(san[i]);
                        $scope.vdc.inv_storage_Servers.push(san[i]);
                        var idx = $scope.cust_san.indexOf(san[i]);
                        $scope.cust_san.splice(idx, 1);
                    }
                }
            }
        };

        /*** firewall ***/

        $scope.AddFirewall = function (curfirewall, firewall) {

            for (var j = 0; j <= curfirewall.length - 1; j++) {
                for (var i = 0; i <= firewall.length - 1; i++) {
                    if (curfirewall[j].url == firewall[i].url) {

                        $scope.cust_firewall.push(firewall[i]);
                        $scope.vdc.firewalls.push(firewall[i]);
                        var idx = $scope.inv_firewall.indexOf(firewall[i]);
                        $scope.inv_firewall.splice(idx, 1);
                    }
                }
            }
        };

        $scope.RemoveFirewall = function (curfirewall, firewall) {

            for (var j = 0; j <= curfirewall.length - 1; j++) {
                for (var i = 0; i <= firewall.length - 1; i++) {
                    if (curfirewall[j].url == firewall[i].url) {

                        $scope.inv_firewall.push(firewall[i]);
                        $scope.vdc.inv_firewalls.push(firewall[i]);
                        var idx = $scope.cust_firewall.indexOf(firewall[i]);
                        $scope.cust_firewall.splice(idx, 1);
                    }
                }
            }
        };

        /*** loadbalancer ***/

        $scope.AddLoadbalancer = function (curloadbalancer, loadbalancer) {

            for (var j = 0; j <= curloadbalancer.length - 1; j++) {
                for (var i = 0; i <= loadbalancer.length - 1; i++) {
                    if (curloadbalancer[j].url == loadbalancer[i].url) {

                        $scope.cust_loadbalancer.push(loadbalancer[i]);
                        $scope.vdc.loadbalancers.push(loadbalancer[i]);
                        var idx = $scope.inv_loadbalancer.indexOf(loadbalancer[i]);
                        $scope.inv_loadbalancer.splice(idx, 1);
                    }
                }
            }
        };

        $scope.RemoveLoadbalancer = function (curloadbalancer, loadbalancer) {

            for (var j = 0; j <= curloadbalancer.length - 1; j++) {
                for (var i = 0; i <= loadbalancer.length - 1; i++) {
                    if (curloadbalancer[j].url == loadbalancer[i].url) {

                        $scope.inv_loadbalancer.push(loadbalancer[i]);
                        $scope.vdc.inv_loadbalancers.push(loadbalancer[i]);
                        var idx = $scope.cust_loadbalancer.indexOf(loadbalancer[i]);
                        $scope.cust_loadbalancer.splice(idx, 1);
                    }
                }
            }
        };

        /*** switch ***/

        $scope.AddSwitch = function (curswitch, switches) {

            for (var j = 0; j <= curswitch.length - 1; j++) {
                for (var i = 0; i <= switches.length - 1; i++) {
                    if (curswitch[j].url == switches[i].url) {

                        $scope.cust_switch.push(switches[i]);
                        $scope.vdc.switches.push(switches[i]);
                        var idx = $scope.inv_switch.indexOf(switches[i]);
                        $scope.inv_switch.splice(idx, 1);
                    }
                }
            }
        };

        $scope.RemoveSwitch = function (curswitch, switches) {

            for (var j = 0; j <= curswitch.length - 1; j++) {
                for (var i = 0; i <= switches.length - 1; i++) {
                    if (curswitch[j].url == switches[i].url) {

                        $scope.inv_switch.push(switches[i]);
                        $scope.vdc.inv_switches.push(switches[i]);
                        var idx = $scope.cust_switch.indexOf(switches[i]);
                        $scope.cust_switch.splice(idx, 1);
                    }
                }
            }
        };


    }
]);



