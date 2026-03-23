/**
 * Created by rt on 10/6/15.
 */
var app = angular.module('uldb');

// controllers:  mapping to templates
app.controller('CabinetAddController', [
    '$scope',
    'Cabinet',
    '$http',
    'CabinetModel',
    'CabinetType',
    'Cage',
    'DataCenter',
    'Organization',
    '$location',
    function ($scope, Cabinet, $http, CabinetModel, CabinetType, Cage, DataCenter, Organization, $location) {

        $scope.cabinet = new Cabinet();


        /*** load cabinet model list ***/

        CabinetModel.get().$promise.then(function (response) {
            $scope.cabinet_model = response.results;
        });

        /*** load Cabinet types list ***/

        CabinetType.get().$promise.then(function (response) {
            $scope.cabinet_type = response.results;
        });

        /*** load  Cage list ***/

        Cage.get().$promise.then(function (response) {
            $scope.cage = response.results;
        });

        /*** load Datacenter list ***/

        DataCenter.get().$promise.then(function (response) {
            $scope.datacenter = response.results;
        });

        /*** load Organization on type ***/

        $scope.getOrgs = function (val) {
            return Organization.get({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };

        $scope.saveCabAdd = function () {
            var cabvalidated = false;

            if ($scope.cabinet && $scope.cabinet.name) {
                $scope.nameerr = false;
                cabvalidated = true;
            }
            else {
                $scope.nameerr = true;
                cabvalidated = false;
                $scope.cabnameMsg = "This field is required";
            }

            if ($scope.cabinet && $scope.cabinet.datacenter) {
                $scope.dcerr = false;
                cabvalidated = true;
            }
            else {
                $scope.dcerr = true;
                cabvalidated = false;
                $scope.cabdcMsg = "This field is required";
            }


            if ($scope.cabinet && $scope.cabinet.cabinet_model) {
                $scope.cabmodelerr = false;
                cabvalidated = true;
            }
            else {
                $scope.cabmodelerr = true;
                cabvalidated = false;
                $scope.cabmodelMsg = "This field is required";
            }

            if ($scope.cabinet && $scope.cabinet.cabinet_type) {
                $scope.cabtypeerr = false;
                cabvalidated = true;
            }
            else {
                $scope.cabtypeerr = true;
                cabvalidated = false;
                $scope.cabtypeMsg = "This field is required";
            }

            if ($scope.cabinet && $scope.cabinet.customer) {
                $scope.cabcustomererr = false;
                cabvalidated = true;
            }
            else {
                $scope.cabcustomererr = true;
                cabvalidated = false;
                $scope.cabcustomerMsg = "This field is required";
            }

            if (cabvalidated) {

                /*$scope.cabinet.datacenter = $scope.cabinet.datacenter.url;
                 $scope.cabinet.cage = $scope.cabinet.cage.url;
                 $scope.cabinet.cabinet_model = $scope.cabinet.cabinet_model.url;
                 $scope.cabinet.cabinet_type = $scope.cabinet.cabinet_type.url;*/

                $scope.cabinet.customer = $scope.cabinet.customer.url;

                $scope.cabinet.$save().then(function (result) {
                    $location.path("/cabinet/").search({ param: "cabinet " + $scope.cabinet.name + " added successfully" });

                }, function (error) {

                    angular.element(document.querySelector("#id_name")).focus();

                    if (error.data.name) {
                        $scope.nameerr = true;
                        $scope.cabnameMsg = error.data.name[0];
                    }
                    else {
                        $scope.nameerr = false;
                    }

                    if (error.data.customer) {
                        $scope.cabcustomererr = true;
                        $scope.cabcustomerMsg = error.data.customer[0];
                    }
                    else {
                        $scope.cabcustomererr = false;
                        $scope.cabinet.customer = "";
                    }

                    if (error.data.datacenter) {
                        $scope.dcerr = true;
                        $scope.cabdcMsg = error.data.datacenter[0];
                    }
                    else {
                        $scope.dcerr = false;
                    }

                    if (error.data.cabinet_model) {
                        $scope.cabmodelerr = true;
                        $scope.cabmodelMsg = error.data.cabinet_model[0];
                    }
                    else {
                        $scope.cabmodelerr = false;
                    }

                    if (error.data.cage) {
                        $scope.cageerr = true;
                        $scope.cabcageMsg = error.data.cage[0];
                    }
                    else {
                        $scope.cageerr = false;
                    }

                    if (error.data.cabinet_type) {
                        $scope.cabtypeerr = true;
                        $scope.cabtypeMsg = error.data.cabinet_type[0];
                    }
                    else {
                        $scope.cabtypeerr = false;
                    }
                });
            }
            else {
                angular.element(document.querySelector("#id_name")).focus();
            }
        };

        $scope.cancelCabAdd = function () {
            $location.path("/cabinet");
        };

        $scope.ClearValidation = function () {
            $scope.nameerr = false;
            $scope.cabcustomererr = false;
            $scope.dcerr = false;
            $scope.cabmodelerr = false;
            $scope.cageerr = false;
            $scope.cabtypeerr = false;
        };

    }
]);





