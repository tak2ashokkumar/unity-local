var app = angular.module('uldb');

app.controller('ServerAddController', [
    '$scope',
    'Instance',
    '$http',
    'InstanceType',
    'OS',
    'Organization',
    'URLService',
    '$filter',
    '$location',
    function ($scope, Instance, $http, InstanceType, OS, Organization, URLService, $filter, $location) {

        $scope.instance = new Instance();

        $scope.system = URLService.GetSetURL("");

        /** Get admin details ***/

        $http.get($scope.system + "get_uladmin/").then(function (result) {

            $scope.admin = result.data.admin_users;
        });

        /** Get system details ***/

        $http.get($scope.system + "get_system/").then(function (result) {

            $scope.instance.system = result.data.system;
        });

        /*** load system manufacturer list ***/

        InstanceType.get().$promise.then(function (response) {
            $scope.instancetype = response.results;
        });

        /*** load chassis types list ***/

        OS.get().$promise.then(function (response) {
            $scope.os = response.results;
        });

        /*** load Organization on type ***/

        $scope.getOrgs = function (val) {
            return Organization.get({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };

        /*** save instance details ***/

        $scope.saveInstanceAdd = function () {

            var insvalidated = true;

            if ($scope.instance && $scope.instance.name) {
                $scope.nameerr = false;
                if (insvalidated)
                    insvalidated = true;
            }
            else {
                $scope.nameerr = true;
                insvalidated = false;
                $scope.insnameMsg = "This field is required";
            }

            if ($scope.instance && $scope.instance.instance_type) {
                $scope.typeerr = false;
                if (insvalidated)
                    insvalidated = true;
            }
            else {
                $scope.typeerr = true;
                insvalidated = false;
                $scope.insTypeMsg = "This field is required";
            }

            if ($scope.instance && $scope.instance.functional_hostname) {
                $scope.funchostnameerr = false;
                if (insvalidated)
                    insvalidated = true;
            }
            else {
                $scope.funchostnameerr = true;
                insvalidated = false;
                $scope.funchostnameMsg = "This field is required";
            }

            if ($scope.instance && $scope.instance.os) {
                $scope.oserr = false;
                if (insvalidated)
                    insvalidated = true;
            }
            else {
                $scope.oserr = true;
                insvalidated = false;
                $scope.OSMsg = "This field is required";
            }

            if ($scope.instance && $scope.instance.admin_id) {
                $scope.adminnameerr = false;
                if (insvalidated)
                    insvalidated = true;
            }
            else {
                $scope.adminnameerr = true;
                insvalidated = false;
                $scope.adminNameMsg = "This field is required";
            }

            /*if($scope.instance && $scope.instance.os_rootuser)
             {
             $scope.osrootusererr = false;
             insvalidated = true;
             }
             else
             {
             $scope.osrootusererr = true;
             insvalidated = false;
             $scope.OSruserMsg ="This field is required";
             }

             if($scope.instance && $scope.instance.state)
             {
             $scope.insstateerr = false;
             insvalidated = true;
             }
             else
             {
             $scope.insstateerr = true;
             insvalidated = false;
             $scope.insStateMsg ="This field is required";
             }

             if($scope.instance && $scope.instance.customer)
             {
             $scope.customererr = false;
             insvalidated = true;
             }
             else
             {
             $scope.customererr = true;
             insvalidated = false;
             $scope.customerMsg ="This field is required";
             }



             if($scope.instance && $scope.instance.ordered_date)
             {
             $scope.orddateerr = false;
             insvalidated = true;
             }
             else
             {
             $scope.orddateerr = true;
             insvalidated = false;
             $scope.ordDateMsg ="This field is required";
             }*/

            if (insvalidated) {


                if ($scope.instance.customer && $scope.instance.customer.url) {

                    window.customer_name = $scope.instance.customer.organization_name;
                    window.customer_url = $scope.instance.customer;
                }
                else {
                    $scope.instance.customer = window.customer_url;
                }


                $scope.instance.$save().then(function (result) {

                    window.customer_name = "";
                    window.customer_url = "";

                    $location.path("/servers/").search({ param: "Server " + $scope.instance.name + " added successfully" });


                }, function (error) {

                    angular.element(document.querySelector("#id_name")).focus();

                    if (error.data.name) {
                        $scope.nameerr = true;
                        $scope.insnameMsg = error.data.name[0];
                    }
                    else {
                        $scope.nameerr = false;
                    }

                    if (error.data.instance_type) {
                        $scope.typeerr = true;
                        $scope.insTypeMsg = error.data.instance_type[0];
                    }
                    else {
                        $scope.typeerr = false;
                    }

                    if (error.data.functional_hostname) {
                        $scope.funchostnameerr = true;
                        $scope.funchostnameMsg = error.data.functional_hostname[0];
                    }
                    else {
                        $scope.funchostnameerr = false;
                    }

                    if (error.data.customer) {
                        $scope.customererr = true;
                        $scope.customerMsg = error.data.customer[0];
                    }
                    else {
                        $scope.customererr = false;
                        $scope.instance.customer = window.customer_name;
                    }

                    if (error.data.os) {
                        $scope.oserr = true;
                        $scope.OSMsg = error.data.os[0];
                    }
                    else {
                        $scope.oserr = false;
                    }

                    if (error.data.os_rootuser) {
                        $scope.osrootusererr = true;
                        $scope.OSruserMsg = error.data.os_rootuser[0];
                    }
                    else {
                        $scope.osrootusererr = false;
                    }


                    if (error.data.state) {
                        $scope.insstateerr = true;
                        $scope.insStateMsg = error.data.state[0];
                    }
                    else {
                        $scope.insstateerr = false;
                    }

                    if (error.data.admin_id) {
                        $scope.adminnameerr = true;
                        $scope.adminNameMsg = error.data.admin_id[0];
                    }
                    else {
                        $scope.adminnameerr = false;
                    }

                    if (error.data.ordered_date) {
                        $scope.orddateerr = true;
                        $scope.ordDateMsg = error.data.ordered_date[0];
                    }
                    else {
                        $scope.orddateerr = false;
                    }

                });
            }
            else {
                angular.element(document.querySelector("#id_name")).focus();
            }

        };

        /*** cancel instance add ***/

        $scope.CancelInstanceAdd = function () {

            $location.path("/servers");
        };

        /** clear validations ***/

        $scope.ClearValidation = function () {
            $scope.insnameMsg = "";
            $scope.insTypeMsg = "";
            $scope.customerMsg = "";
            $scope.OSMsg = "";
            $scope.OSruserMsg = "";
            $scope.insStateMsg = "";
            $scope.adminNameMsg = "";
            $scope.ordDateMsg = "";
            $scope.funchostnameMsg = "";
        };

    }
]);



