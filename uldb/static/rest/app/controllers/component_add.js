var app = angular.module('uldb');

// controllers:  mapping to templates
app.controller('ComponentAddController', [
    '$scope',
    'Server',
    '$http',
    '$controller',
    'MotherboardAvailable',
    'CPUAvailable',
    'MemoryAvailable',
    'NICAvailable',
    'RAIDAvailable',
    'IPMIAvailable',
    'DisksAvailable',
    '$location',
    '$resource',
    'Motherboard',
    'MotherboardModelFast',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    'URLService',
    function ($scope, Server, $http, $controller, MotherboardAvailable, CPUAvailable, MemoryAvailable, NICAvailable, RAIDAvailable, IPMIAvailable, DisksAvailable, $location, $resource, Motherboard, MotherboardModelFast, AlertService2, SearchService, AbstractControllerFactory, URLService) {


        $scope.component = new Server();

        var cmpURL = URLService.GetSetURL("");

        $scope.resourceClass = Motherboard;
        // $scope.breadCrumb = { name: "Motherboard", url: "#/motherboard" };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "assettag");

        var MotherboardModelSearch = new SearchService(MotherboardModelFast);
        $scope.getMotherboardModels = MotherboardModelSearch.search;

        $scope.rows = [
            { name: "assettag", description: "Assettag", required: true },
            { name: "serialnumber", description: "Serial Number", required: true },
            {
                name: "mb_model", description: "Model", required: true,
                opaque: true,
                subfield: "model_name",
                read: function (result) {
                    if (result.mb_model && result.mb_model.model_name) {
                        return result.mb_model.model_name;
                    }
                    else if (result.mb_model !== null) {
                        return result.mb_model;
                    }
                    else {
                        return "";
                    }
                },
                edit: function (result) {
                    if (result.mb_model && result.mb_model.model_name) {
                        return result.mb_model.model_name;
                    }
                    else if (result.mb_model !== null) {
                        return result.mb_model;
                    }
                    else {
                        return "";
                    }
                },
                render: $scope.getMotherboardModels
            },
        ];
        $scope.title = {
            plural: "Motherboards",
            singular: "Motherboard"
        };

        $scope.AddMB = function () {
            $scope.component.add = true;
        };


        $http.get(cmpURL).then(function (response) {
            $scope.component.system_name = response.data.system_name;
            $scope.component.system_manufacturer = response.data.system_manufacturer;
            $scope.component.system_assettag = response.data.system_assettag;
        });


        /*var MotherboardNew = $scope.$new();

         $controller('MotherboardController',{$scope : MotherboardNew });*/

        $scope.FillMotherboard = function (url) {
            /*** fill  Motherboard Model list ***/

            MotherboardAvailable.get().$promise.then(function (response) {
                $scope.motherboard = response.motherboard;
                if (url != "") {
                    $scope.component = { motherboard: url };
                    $scope.FillAssociate();
                }
            });
        };

        $scope.FillMotherboard("");

        $scope.FillAssociate = function () {

            /*** fill CPU list ***/

            CPUAvailable.get().$promise.then(function (response) {
                $scope.cpu = response.cpu;
            });

            /*** fill Memory list ***/

            MemoryAvailable.get().$promise.then(function (response) {
                $scope.memory = response.memory;
            });

            /*** fill NIC list ***/

            NICAvailable.get().$promise.then(function (response) {
                $scope.nic = response.nic;
            });

            /*** fill RAIDController list ***/

            RAIDAvailable.get().$promise.then(function (response) {
                $scope.raidController = response.raid;
            });

            /*** fill IPMI list ***/

            IPMIAvailable.get().$promise.then(function (response) {
                $scope.ipmi = response.ipmi;
            });

            /*** load Disk list ***/

            DisksAvailable.get().$promise.then(function (response) {
                $scope.disk = response.disk;
            });
        };

        /*$scope.AddMotherboard = function()
         {
         MotherboardNew.ctrl.add();
         };*/

        $scope.SaveComponentAdd = function () {
            var compvalidated = true;

            if ($scope.component && $scope.component.motherboard) {
                $scope.motherboarderr = false;
                if (compvalidated)
                    compvalidated = true;
            }
            else {
                $scope.motherboarderr = true;
                compvalidated = false;
                $scope.motherboardMsg = "This field is required";
            }

            if (compvalidated) {
                //$http.post(cmpURL + "components_add/", {'components_add':$scope.component}).then(function (response) {
                $http.post(cmpURL + "components_add/", {
                    'motherboard': $scope.component.motherboard,
                    'cpu': $scope.component.cpu,
                    'disks': $scope.component.disks,
                    'ipmi': $scope.component.ipmi,
                    'memory': $scope.component.memory,
                    'nic': $scope.component.nic,
                    'raid': $scope.component.raid,
                    'system_name': $scope.component.system_name,
                    'system_assettag': $scope.component.system_assettag,
                    'system_manufacturer': $scope.component.system_manufacturer
                }).then(function (response) {

                    $location.path("/servers/").search({ param: response.data.detail });


                }, function (error) {


                    if (error.data.motherboard) {
                        $scope.motherboarderr = true;
                        $scope.motherboardMsg = error.data.motherboard[0];
                    }
                    else {
                        $scope.motherboarderr = false;
                    }

                });
            }

        };

        $scope.CancelComponentAdd = function () {
            $location.path("/servers");
        };

        $scope.ClearValidation = function () {
            $scope.motherboarderr = false;
            $scope.cpuerr = false;
            $scope.memoryerr = false;
        };


    }
]);





