/**
 * Created by rt on 10/6/15.
 */
var app = angular.module('uldb');

// controllers:  mapping to templates
app.controller('CabinetEditController', [
    '$scope',
    'Cabinet',
    '$http',
    'CabinetModel',
    'CabinetType',
    'Cage',
    'DataCenter',
    'Organization',
    '$location',
    'CabinetUpdate',
    'URLService',
    function ($scope, Cabinet, $http, CabinetModel, CabinetType, Cage, DataCenter, Organization, $location, CabinetUpdate, URLService) {

        $scope.cabinet = new Cabinet();

        var editURL = URLService.GetSetURL("");

        if (editURL && editURL != "") {

            $http.get(editURL).then(function (response) {

                var salesforce_id = "";
                var cage = "";

                if (response.data.salesforce_id) {
                    salesforce_id = response.data.salesforce_id.toString();
                }

                $("#id_datacenter").find('option:selected').removeAttr("selected");
                $("#id_datacenter option[value='string:" + response.data.datacenter.toString() + "']").attr("selected", "selected");

                if (response.data.cage) {
                    $("#id_cage").find('option:selected').removeAttr("selected");
                    $("#id_cage option[value='string:" + response.data.cage.toString() + "']").attr("selected", "selected");
                    cage = response.data.cage.toString();
                }

                $("#id_cabinet_model").find('option:selected').removeAttr("selected");
                $("#id_cabinet_model option[value='string:" + response.data.cabinet_model.toString() + "']").attr("selected", "selected");

                $("#id_cabinet_type").find('option:selected').removeAttr("selected");
                $("#id_cabinet_type option[value='string:" + response.data.cabinet_type.toString() + "']").attr("selected", "selected");
                $http.get(response.data.url + "get_customer_details/").then(function (result) {
                    if (result.data.customer) {
                        $scope.cabinet_customer = result.data.customer.organization_name;
                        window.customer = result.data.customer.url;
                    }
                    else {
                        window.customer = "";
                    }
                });
                $scope.cabinet = {
                    name: response.data.name.toString(),
                    salesforce_id: salesforce_id,
                    datacenter: response.data.datacenter.toString(),
                    cage: cage,
                    cabinet_model: response.data.cabinet_model.toString(),
                    cabinet_type: response.data.cabinet_type.toString(),
                    id: response.data.id
                };
            });
        }


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

        $scope.saveCabEdit = function () {
            var cabvalidated = false;


            if (window.customer == "") {

                $scope.cabinet.customer = $scope.cabinet.customer.url;
            }
            else {
                $scope.cabinet.customer = window.customer;
            }

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

                //$scope.cabinet.customer = $scope.cabinet.customer.url;

                //$scope.cabinet.$save().then(function (result) {
                CabinetUpdate.update({
                    'id': $scope.cabinet.id,
                    'name': $scope.cabinet.name,
                    'datacenter': $scope.cabinet.datacenter,
                    'customer': $scope.cabinet.customer,
                    'cage': $scope.cabinet.cage,
                    'cabinet_model': $scope.cabinet.cabinet_model,
                    'cabinet_type': $scope.cabinet.cabinet_type,
                    'salesforce_id': $scope.cabinet.salesforce_id,
                }).$promise.then(function (results) {
                    $location.path("/cabinet/").search({ param: "cabinet " + $scope.cabinet.name + " updated successfully" });

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

        $scope.cancelCabEdit = function () {
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

        $scope.ClearURL = function () {
            if (window.customer) {
                window.customer = "";
            }
        };

    }
]);





