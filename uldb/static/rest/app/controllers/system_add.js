/**
 * Created by rt on 10/6/15.
 */
var app = angular.module('uldb');

// controllers:  mapping to templates
app.controller('SystemAddController', [
    '$scope',
    'Server',
    '$http',
    'ServerManufacturer',
    'SystemType',
    'Organization',
    'ChassisModel',
    '$location',
    '$resource',
    function ($scope, Server, $http, ServerManufacturer, SystemType, Organization, ChassisModel, $location, $resource) {

        $scope.server = new Server();

        /*** load system manufacturer list ***/

        ServerManufacturer.get().$promise.then(function (response) {
            $scope.system_manufacturer = response.results;
        });

        /*** load System type list ***/

        SystemType.get().$promise.then(function (response) {
            $scope.system_type = response.results;
        });

        /*** load chassis types ***/

        ChassisModel.get().$promise.then(function (response) {
            $scope.chassistype = response.results;
        });

        /*** load Organization on type ***/

        $scope.getOrgs = function (val) {
            return Organization.get({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };

        $scope.SaveSystemAdd = function () {
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
                $scope.server.$save().then(function (result) {
                    $location.path("/servers/").search({ param: "System " + $scope.server.system_name + " added successfully" });
                }, function (error) {

                    if (error.data.system_name) {
                        $scope.nameerr = true;
                        $scope.sysnameMsg = error.data.system_name[0];
                    }
                    else {
                        $scope.nameerr = false;
                    }

                    if (error.data.chassis) {
                        $scope.chassiserr = true;
                        $scope.chassisMsg = error.data.chassis[0];
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

        $scope.CancelSystemAdd = function () {
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

    }
]);





