var app = angular.module('uldb');

app.controller('VirtualServerAddController', [
    '$scope',
    'VirtualServer',
    'Hypervisor',
    'OS',
    'Organization',
    'CloudTypes',
    'ULAdmin',
    '$http',
    'SystemPowerSupplyPort',
    'URLService',
    '$filter',
    '$location',
    function ($scope, VirtualServer, Hypervisor, OS, Organization, CloudTypes, ULAdmin, $http, SystemPowerSupplyPort, URLService, $filter, $location) {

        $scope.vserver = new VirtualServer();

        $scope.vserver.instance = "";


        $scope.vserver.cloud_type = null;

        $scope.etherror = false;
        $scope.MACerror = false;
        $scope.hideETH = false;

        $scope.vserver.memory_measure_type = "GB";
        $scope.vserver.disk_measure_type = "GB";

        $scope.ethrequireerror = false;

        $scope.ETHAvailable = false;
        $scope.ETHNotAvailable = true;

        $scope.cloudtypedisable = false;

        /*** load Hypervisor list ***/

        Hypervisor.get().$promise.then(function (response) {

            $scope.systems = response.hypervisors;
        });

        /*** load OS list ***/

        OS.get().$promise.then(function (response) {
            $scope.os = response.results;
        });

        /*** load Organization on type ***/

        $scope.getOrgs = function (val) {
            return Organization.get({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };

        /*** load CloudTypes ***/

        CloudTypes.get().$promise.then(function (response) {
            //$scope.GetCloudValues(response.results[0].url);
            $scope.cloudtypes = response.results;

        });

        /** Get admin details ***/

        ULAdmin.get().$promise.then(function (response) {
            $scope.admin = response.admin_users;
        });

        /*** Get Cloud Values ***/

        $scope.GetCloudValues = function (url) {

            $http.get(url).then(function (result) {
                $scope.vserver.cloud_type = result.data;
                $scope.vserver.vcpu = result.data.vcpu;
                $scope.vserver.memory = result.data.memorysize;
                $scope.vserver.disk = result.data.disksize;
                $scope.vserver.no_of_ethernet = result.data.ethports;
                $scope.vserver.memory_measure_type = result.data.memory_measuretype;
                $scope.vserver.disk_measure_type = result.data.disk_measuretype;
                $scope.cloudtypedisable = true;
            });
        };

        $scope.GetCustom = function () {
            $scope.vserver.cloud_type = null;
            $scope.vserver.vcpu = "";
            $scope.vserver.memory = "";
            $scope.vserver.disk = "";
            $scope.vserver.no_of_ethernet = "";
            $scope.vserver.memory_measure_type = "GB";
            $scope.vserver.disk_measure_type = "GB";
            $scope.cloudtypedisable = false;

        };

        /*** save connection details ***/

        $scope.SaveVServerAdd = function () {

            var vservervalidated = true;

            if ($scope.vserver.customer && $scope.vserver.customer.url) {
                window.customer_name = $scope.vserver.customer.organization_name;
                window.customer_url = $scope.vserver.customer;
            }
            else {
                $scope.vserver.customer = window.customer_url;
            }

            if ($scope.vserver && $scope.vserver.name) {
                $scope.nameerr = false;
                if (vservervalidated)
                    vservervalidated = true;
            }
            else {
                $scope.nameerr = true;
                vservervalidated = false;
                $scope.nameMsg = "This field is required";
            }

            if ($scope.vserver && $scope.vserver.system) {
                $scope.hypervisorerr = false;
                if (vservervalidated)
                    vservervalidated = true;
            }
            else {
                $scope.hypervisorerr = true;
                vservervalidated = false;
                $scope.hypervisorMsg = "This field is required";
            }

            if ($scope.vserver && $scope.vserver.os_rootuser) {
                $scope.usernameerr = true;
                if (vservervalidated)
                    vservervalidated = true;
            }
            else {
                $scope.usernameerr = true;
                vservervalidated = false;
                $scope.usernameMsg = "This field is required";
            }

            if ($scope.vserver && $scope.vserver.os) {
                $scope.oserr = false;
                if (vservervalidated)
                    vservervalidated = true;
            }
            else {
                $scope.oserr = true;
                vservervalidated = false;
                $scope.OSMsg = "This field is required";
            }

            if ($scope.vserver && $scope.vserver.vcpu) {
                $scope.vcpuerr = false;
                if (vservervalidated)
                    vservervalidated = true;
            }
            else {
                $scope.vcpuerr = true;
                vservervalidated = false;
                $scope.vcpuMsg = "This field is required";
            }

            if ($scope.vserver && $scope.vserver.memory) {
                $scope.memorysizeerr = false;
                if (vservervalidated)
                    vservervalidated = true;
            }
            else {
                $scope.memorysizeerr = true;
                vservervalidated = false;
                $scope.memorysizeMsg = "This field is required";
            }

            if ($scope.vserver && $scope.vserver.disk) {
                $scope.disksizeerr = false;
                if (vservervalidated)
                    vservervalidated = true;
            }
            else {
                $scope.disksizeerr = true;
                vservervalidated = false;
                $scope.disksizeMsg = "This field is required";
            }

            if ($scope.vserver && $scope.vserver.no_of_ethernet) {
                $scope.NOEerr = false;
                if (vservervalidated)
                    vservervalidated = true;
            }
            else {
                $scope.NOEerr = true;
                vservervalidated = false;
                $scope.NOEMsg = "This field is required";
            }

            if ($scope.vserver) {
                $scope.customererr = true;
                if (vservervalidated)
                    vservervalidated = true;
            }
            else {
                $scope.customererr = true;
                vservervalidated = true;
                $scope.customerMsg = "This field is eeerequired";
            }

            if ($scope.vserver && $scope.vserver.admin) {
                $scope.adminnameerr = false;
                if (vservervalidated)
                    vservervalidated = true;
            }
            else {
                $scope.adminnameerr = true;
                vservervalidated = false;
                $scope.adminNameMsg = "This field is required";
            }

            if ($scope.vserver && $scope.vserver.ordered_date) {
                $scope.orddateerr = false;
                if (vservervalidated)
                    vservervalidated = true;
            }
            else {
                $scope.orddateerr = true;
                vservervalidated = false;
                $scope.ordDateMsg = "This field is required";
            }

            if (vservervalidated) {

                $scope.vserver.$save().then(function (result) {

                    window.customer_name = "";
                    window.customer_url = "";

                    $location.path("/virtualservers/").search({ param: "Virtual server " + $scope.vserver.name + " added successfully" });


                }, function (error) {

                    $scope.vserver.customer = window.customer_name;

                    if (error.data.name) {
                        $scope.nameerr = true;
                        $scope.nameMsg = error.data.name[0];
                    }
                    else {
                        $scope.nameerr = false;
                    }

                    if (error.data.system) {
                        $scope.hypervisorerr = true;
                        $scope.hypervisorMsg = error.data.system[0];
                    }
                    else {
                        $scope.hypervisorerr = false;
                    }

                    if (error.data.os_rootuser) {
                        $scope.usernameerr = true;
                        $scope.usernameMsg = error.data.os_rootuser[0];
                    }
                    else {
                        $scope.usernameerr = false;
                    }

                    if (error.data.os) {
                        $scope.oserr = true;
                        $scope.OSMsg = error.data.os[0];
                    }
                    else {
                        $scope.oserr = false;
                    }

                    if (error.data.vcpu) {
                        $scope.vcpuerr = true;
                        $scope.vcpuMsg = error.data.vcpu[0];
                    }
                    else {
                        $scope.vcpuerr = false;
                    }

                    if (error.data.memory) {
                        $scope.memorysizeerr = true;
                        $scope.memorysizeMsg = error.data.memory[0];
                    }
                    else {
                        $scope.memorysizeerr = false;
                    }

                    if (error.data.disk) {
                        $scope.disksizeerr = true;
                        $scope.disksizeMsg = error.data.disk[0];
                    }
                    else {
                        $scope.disksizeerr = false;
                    }

                    if (error.data.no_of_ethernet) {
                        $scope.NOEerr = true;
                        $scope.NOEMsg = error.data.no_of_ethernet[0];
                    }
                    else {
                        $scope.NOEerr = false;
                    }

                    if (error.data.customer) {
                        $scope.customererr = true;
                        $scope.customerMsg = error.data.customer[0];
                    }
                    else {
                        $scope.customererr = false;
                        $scope.vserver.customer = window.customer_name;
                    }

                    if (error.data.admin) {
                        $scope.adminnameerr = true;
                        $scope.adminNameMsg = error.data.admin[0];
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

        $scope.ClearValidation = function () {
            $scope.nameMsg = "";
            $scope.hypervisorMsg = "";
            $scope.usernameMsg = "";
            $scope.OSMsg = "";
            $scope.vcpuMsg = "";
            $scope.memorysizeMsg = "";
            $scope.disksizeMsg = "";
            $scope.NOEMsg = "";
            $scope.customerMsg = "";
            $scope.adminNameMsg = "";
            $scope.ordDateMsg = "";
        };


        /*** cancel vserver add ***/

        $scope.CancelVServerAdd = function () {
            $location.path("/virtualservers");
        };

        $scope.ValidateFloat = function (event) {
            var charCode = (event.which) ? event.which : event.keyCode;
            if (charCode == 46) {
                if (event.target.value.indexOf(".") >= 1) {
                    $(event.target).focus();
                    $(event.target).tooltip({
                        title: 'Invalid'
                    });
                    $(event.target).tooltip('show');
                    event.preventDefault();
                }
                else {
                    $(event.target).tooltip('destroy');
                    return true;
                }
            }
            else {
                $(event.target).tooltip('destroy');
                return true;
            }
        };

        $scope.minmax = function (event, min, max) {

            var value = $(event.target).val();

            $(event.target).tooltip('destroy');

            if (parseInt(value) < min || isNaN(value) || value.indexOf('.') > -1) {

                $(event.target).tooltip({
                    title: 'Only allow value between ' + min + ' and ' + max
                });
                $(event.target).tooltip('show');

                event.target.value = max;

            }
            else if (parseInt(value) > max) {
                $(event.target).tooltip({
                    title: 'Only allow value between ' + min + ' and ' + max
                });
                $(event.target).tooltip('show');

                event.target.value = max;
            }
            else {
                $(event.target).tooltip('destroy');
                return value;
            }
        };

        $scope.DestroyValMsg = function (event) {
            $(event.target).tooltip('destroy');
            return true;
        };
    }
]);



