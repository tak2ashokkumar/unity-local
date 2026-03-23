/**
 * Created by rt on 10/6/15.
 */
var app = angular.module('uldb');

// controllers:  mapping to templates
app.controller('SystemEditController', [
    '$scope',
    'Server',
    '$http',
    'ServerManufacturer',
    'ChassisModel',
    'Chassis',
    'SystemType',
    'Organization',
    '$location',
    '$resource',
    'SystemUpdate',
    'URLService',
    function ($scope, Server, $http, ServerManufacturer, ChassisModel, Chassis, SystemType, Organization, $location, $resource, SystemUpdate, URLService) {

        var system_name = "";

        var editURL = URLService.GetSetURL("");

        $scope.DisableChassis = false;

        /*** load system manufacturer list ***/

        ServerManufacturer.get().$promise.then(function (response) {
            $scope.system_manufacturer = response.results;
        });

        /*** load System type list ***/

        SystemType.get().$promise.then(function (response) {
            $scope.system_type = response.results;
        });

        /*** load Chassis list ***/

        Chassis.get().$promise.then(function (response) {
            $scope.chassis = response.results;
        });

        /*** load Organization on type ***/

        $scope.getOrgs = function (val) {
            return Organization.get({ search: val }).$promise.then(function (response) {
                return response.results;
            });
        };

        /*** load System type list ***/

        SystemType.get().$promise.then(function (response) {

            $scope.system_type = response.results;
        });

        /*** load chassis types ***/

        ChassisModel.get().$promise.then(function (response) {
            $scope.chassistype = response.results;
        });

        if (editURL && editURL != "") {
            /*** get system details ***/

            $http.get(editURL).then(function (response) {

                var serialnumber = "";
                var salesforce_id = "";
                var system_type = "";
                var chassistype = "";

                var chassis;

                if (response.data.serialnumber) {
                    serialnumber = response.data.serialnumber.toString();
                }

                if (response.data.salesforce_id) {
                    salesforce_id = response.data.salesforce_id.toString();
                }

                if (response.data.customer) {
                    $scope.system_customer = response.data.customer.organization_name;
                    window.customer = response.data.customer;
                }
                else {
                    window.customer = "";
                }

                if (response.data.system_type) {

                    system_type = response.data.system_type;
                }

                if (response.data.chassis) {
                    chassis = response.data.chassis;
                }

                $scope.server = {
                    id: response.data.id,
                    system_name: response.data.system_name.toString(),
                    system_assettag: response.data.system_assettag.toString(),
                    serialnumber: serialnumber,
                    salesforce_id: salesforce_id,
                    system_manufacturer: response.data.system_manufacturer,
                    system_type: system_type,
                    chassis: chassis
                };

                $scope.DisableChassis = true;
            });
        }

        $scope.SaveSystemEdit = function () {
            if (angular.isUndefined(window.customer) == false && !$scope.server.customer) {
                if (window.customer == "" && window.isDeleted) {
                    console.log($scope.server.customer);
//                    $scope.server.customer = $scope.server.customer;
                }
                else {
                    $scope.server.customer = window.customer;
                }
            }

            var sysvalidated = false;

            if ($scope.server && $scope.server.system_name) {
                $scope.nameerr = false;
                sysvalidated = true;
            }
            else {
                $scope.nameerr = true;
                sysvalidated = false;
                $scope.sysnameMsg = "This field is required";
            }

            if ($scope.server && $scope.server.system_assettag) {
                $scope.assettagerr = false;
                sysvalidated = true;
            }
            else {
                $scope.assettagerr = true;
                sysvalidated = false;
                $scope.assettagMsg = "This field is required";
            }

            if ($scope.server && $scope.server.system_manufacturer) {
                $scope.manufacturererr = false;
                sysvalidated = true;
            }
            else {
                $scope.manufacturererr = true;
                sysvalidated = false;
                $scope.manufacturerMsg = "This field is required";
            }

            if (sysvalidated) {

                if ($scope.server.chassis == "") {
                    $scope.server.chassis = undefined;
                }

                if ($scope.server.system_type == "") {
                    $scope.server.system_type = null;
                }

                if ($scope.server.customer) {
//                    $scope.server.customer = $scope.server.customer;
                    console.log("Server Customer :",$scope.server.customer);
                }
                else {
                    $scope.server.customer = null;
                }

                $scope.DisableChassis = false;

                Server.update({
                    'id': $scope.server.id,
                    'system_name': $scope.server.system_name,
                    'system_assettag': $scope.server.system_assettag,
                    'system_manufacturer': $scope.server.system_manufacturer,
                    'serialnumber': $scope.server.serialnumber,
                    'system_type': $scope.server.system_type,
                    'chassis': $scope.server.chassis,
                    'customer': $scope.server.customer,
                    'salesforce_id': $scope.server.salesforce_id
                }).$promise.then(function (results) {


                    $location.path("/servers/").search({ param: "System " + $scope.server.system_name + " updated successfully" });


                }, function (error) {

                    $scope.DisableChassis = true;

                    if (error.data.system_name) {
                        $scope.nameerr = true;
                        $scope.sysnameMsg = error.data.system_name[0];
                    }
                    else {
                        $scope.nameerr = false;
                    }

                    if (error.data.chassistype) {
                        $scope.chassiserr = true;
                        $scope.chassisMsg = error.data.chassistype[0];
                    }
                    else {
                        $scope.chassiserr = false;
                    }

                    if (error.data.customer) {
                        $scope.customererr = true;
                        $scope.customerMsg = error.data.customer[0];
                    }
                    else {
                        $scope.customererr = false;
                        $scope.server.customer = "";
                    }

                    if (error.data.system_assettag) {
                        $scope.assettagerr = true;
                        $scope.assettagMsg = error.data.system_assettag[0];
                    }
                    else {
                        $scope.assettagerr = false;
                    }

                    if (error.data.system_manufacturer) {
                        $scope.manufacturererr = true;
                        $scope.manufacturerMsg = error.data.system_manufacturer[0];
                    }
                    else {
                        $scope.manufacturererr = false;
                    }

                    if (error.data.system_type) {
                        $scope.typeerr = true;
                        $scope.typeMsg = error.data.system_type[0];
                    }
                    else {
                        $scope.typeerr = false;
                    }


                });
            }
        };

        $scope.CancelSystemEdit = function () {
            $location.path("/servers");
        };

        $scope.ClearValidation = function () {
            $scope.nameerr = false;
            $scope.chassiserr = false;
            $scope.customererr = false;
            $scope.assettagerr = false;
            $scope.manufacturererr = false;
            $scope.typeerr = false;
        };

        $scope.ClearURL = function () {
            if (window.customer) {

                window.customer = "";
                window.isDeleted = true;
            }
        };

    }]);





