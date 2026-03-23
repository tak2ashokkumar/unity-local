var app = angular.module('uldb');

app.controller('ServerEditController', [
    '$scope',
    'Instance',
    '$http',
    'InstanceType',
    'OS',
    'Organization',
    'URLService',
    'InstanceUpdate',
    '$filter',
    '$location',
    function ($scope, Instance, $http, InstanceType, OS, Organization, URLService, InstanceUpdate, $filter, $location) {

        $scope.instance = new Instance();

        var editURL = URLService.GetSetURL("");

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

        if (editURL && editURL != "") {
            $http.get(editURL).then(function (response) {

                /** Get admin details ***/

                $http.get(response.data.system.url + "get_uladmin/").then(function (result) {

                    $scope.admin = result.data.admin_users;
                });

                $http.get(response.data.url + "get_admin_user/").then(function (result) {

                    $scope.instance.admin_id = result.data.admin_user;
                });

                $scope.instance_customer = response.data.customer.organization_name;
                window.customer_name = response.data.customer.organization_name;
                window.customer = response.data.customer;

                $scope.instance = {
                    id: response.data.id,
                    system: response.data.system,
                    functional_hostname: response.data.functional_hostname,
                    name: response.data.name,
                    os_rootuser: response.data.os_rootuser,
                    uuid: response.data.uuid,
                    ulapi_uuid: response.data.ulapi_uuid,
                    ordered_date: response.data.ordered_date,
                    instance_type: response.data.instance_type,
                    os: response.data.os,
                    state: response.data.state,
                    admin_id: ""
                };

            });

        }


        /*** save instance details ***/

        $scope.saveInstanceEdit = function () {

            var insvalidated = false;

            if (window.customer == "") {
                if ($scope.instance.customer) {
                    window.customer_name = $scope.instance.customer.organization_name;
                    window.customer = $scope.instance.customer;
                }
                else {
                    $scope.instance.customer = null;
                }
            }
            else {
                $scope.instance.customer = window.customer;
            }

            if ($scope.instance && $scope.instance.name) {
                $scope.nameerr = false;
                insvalidated = true;
            }
            else {
                $scope.nameerr = true;
                insvalidated = false;
                $scope.insnameMsg = "This field is required";
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

            if (insvalidated) {

                if (angular.isUndefined($scope.instance.customer) == true || $scope.instance.customer == null) {
                    $scope.instance.customer = "";
                }


                if ($scope.instance.os_rootuser == "" || $scope.instance.os_rootuser == null) {
                    $scope.instance.os_rootuser = "";
                }

                if ($scope.instance.ordered_date == "" || $scope.instance.ordered_date == null) {
                    $scope.instance.ordered_date = "";
                }

                if ($scope.instance.state == "" || $scope.instance.state == null) {
                    $scope.instance.state = "";
                }

                InstanceUpdate.update({
                    'id': $scope.instance.id,
                    'system': $scope.instance.system,
                    'name': $scope.instance.name,
                    'functional_hostname': $scope.instance.functional_hostname,
                    'os_rootuser': $scope.instance.os_rootuser,
                    'uuid': $scope.instance.uuid,
                    'ulapi_uuid': $scope.instance.ulapi_uuid,
                    'ordered_date': $scope.instance.ordered_date,
                    'instance_type': $scope.instance.instance_type,
                    'os': $scope.instance.os,
                    'state': $scope.instance.state,
                    'admin_id': $scope.instance.admin_id,
                    'customer': $scope.instance.customer
                }).$promise.then(function (results) {

                    window.customer_name = "";
                    window.customer = "";
                    if (window.pagefrom) {
                        var page = window.pagefrom;
                        window.pagefrom = undefined;
                        $location.path(page).search({ param: "Server " + $scope.instance.name + " updated successfully" });
                    }
                    else {
                        $location.path("/servers/").search({ param: "Server " + $scope.instance.name + " updated successfully" });
                    }

                }, function (error) {


                    if (error.data.name) {
                        $scope.nameerr = true;
                        $scope.insnameMsg = error.data.name[0];
                    }
                    else {
                        $scope.nameerr = false;
                    }

                    if (error.data.functional_hostname) {
                        $scope.funchostnameerr = true;
                        $scope.funchostnameMsg = error.data.functional_hostname[0];
                    }
                    else {
                        $scope.funchostnameerr = false;
                    }

                    if (error.data.instance_type) {
                        $scope.typeerr = true;
                        $scope.insTypeMsg = error.data.instance_type[0];
                    }
                    else {
                        $scope.typeerr = false;
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


        };

        /*** cancel instance add ***/

        $scope.CancelInstanceEdit = function () {
            if (window.pagefrom) {
                var page = window.pagefrom;
                window.pagefrom = undefined;
                $location.path(page);
            }
            else {
                $location.path("/servers");
            }

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

        $scope.ClearURL = function () {

            if (window.customer) {
                window.customer = "";
            }
        };

    }
]);



