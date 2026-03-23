var app = angular.module('uldb');

// controllers:  mapping to templates
app.controller('ComponentEditController', [
    '$scope',
    'Server',
    '$http',
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
    function ($scope, Server, $http, MotherboardAvailable, CPUAvailable, MemoryAvailable, NICAvailable, RAIDAvailable, IPMIAvailable, DisksAvailable, $location, $resource, Motherboard, MotherboardModelFast, AlertService2, SearchService, AbstractControllerFactory, URLService) {

        //$scope.component = new Server();

        $scope.showcpu = false;
        $scope.showmemory = false;
        $scope.shownic = false;
        $scope.showraid = false;
        $scope.showipmi = false;
        $scope.showdisk = false;

        $scope.showrmvmb = true;
        $scope.showaddmb = false;

        $scope.cpu = [];
        $scope.disk = [];
        $scope.memory = [];
        $scope.nic = [];
        $scope.raidController = [];
        $scope.ipmi = [];

        var editURL = URLService.GetSetURL("");

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

        $scope.FillAssociate();

        $scope.FillMotherboard = function (url) {
            /*** fill  Motherboard Model list ***/

            MotherboardAvailable.get().$promise.then(function (response) {
                $scope.motherboard = response.motherboard;
                if (url != "") {
                    $scope.component = { motherboard: url };
                    //$scope.FillAssociate();
                }
            });
        };


        if (editURL && editURL != "") {
            /*** get system details ***/

            $http.get(editURL).then(function (response) {

                var system_name = response.data.system_name;
                var system_manufacturer = response.data.system_manufacturer;
                var system_assettag = response.data.system_assettag;

                /*** get motherboard ***/

                $http.get(editURL + "get_motherboard/").then(function (result) {

                    $scope.motherboard = result.data.motherboards;
                });

                $http.get(response.data.url + "get_mb_details/").then(function (result) {

                    var disks = [];
                    var cpu = [];
                    var memory = [];
                    var nic = [];
                    var ipmi = [];
                    var raidcontroller = [];

                    if (result.data.disks) {

                        $scope.avail_disk = result.data.disks;
                        for (var i = 0; i <= result.data.disks.length - 1; i++) {
                            disks.push(result.data.disks[i]);
                        }
                    }
                    if (result.data.cpu) {
                        $scope.avail_cpu = result.data.cpu;
                        for (var i = 0; i <= result.data.cpu.length - 1; i++) {
                            cpu.push(result.data.cpu[i]);
                        }

                    }
                    if (result.data.memory) {
                        $scope.avail_memory = result.data.memory;
                        for (var i = 0; i <= result.data.memory.length - 1; i++) {
                            memory.push(result.data.memory[i]);
                        }

                    }
                    if (result.data.nic) {
                        $scope.avail_nic = result.data.nic;
                        for (var i = 0; i <= result.data.nic.length - 1; i++) {
                            nic.push(result.data.nic[i]);
                        }

                    }
                    if (result.data.ipmi) {
                        $scope.avail_ipmi = result.data.ipmi;
                        for (var i = 0; i <= result.data.ipmi.length - 1; i++) {
                            ipmi.push(result.data.ipmi[i]);
                        }

                    }
                    if (result.data.raid) {
                        $scope.avail_raidController = result.data.raid;
                        for (var i = 0; i <= result.data.raid.length - 1; i++) {
                            raidcontroller.push(result.data.raid[i]);
                        }

                    }

                    var motherboard = "";

                    if (response.data.motherboard) {
                        motherboard = response.data.motherboard;
                    }

                    $scope.component = {
                        motherboard: motherboard,
                        id: response.data.id,
                        cpu: cpu,
                        memory: memory,
                        nic: nic,
                        ipmi: ipmi,
                        raid: raidcontroller,
                        disks: disks,
                        system_name: system_name,
                        system_manufacturer: system_manufacturer,
                        system_assettag: system_assettag
                    };

                    $("#id_cpu option").prop("selected", true);
                    $("#id_memory option").prop("selected", true);
                    $("#id_nic option").prop("selected", true);
                    $("#id_ipmi option").prop("selected", true);
                    $("#id_raidcontroller option").prop("selected", true);

                });


            });


        }

        $scope.showAvailableDisks = function () {
            $scope.showdisk = true;
        };

        $scope.CancelDisk = function () {
            $scope.showdisk = false;
        };

        $scope.showAvailableCPU = function () {
            $scope.showcpu = true;
        };

        $scope.CancelCPU = function () {
            $scope.showcpu = false;
        };

        $scope.showAvailableMemory = function () {
            $scope.showmemory = true;
        };

        $scope.CancelMemory = function () {
            $scope.showmemory = false;
        };

        $scope.showAvailableNIC = function () {
            $scope.shownic = true;
        };

        $scope.CancelNIC = function () {
            $scope.shownic = false;
        };

        $scope.showAvailableRAID = function () {
            $scope.showraid = true;
        };

        $scope.CancelRAID = function () {
            $scope.showraid = false;
        };

        $scope.showAvailableIPMI = function () {
            $scope.showipmi = true;
        };

        $scope.CancelIPMI = function () {
            $scope.showipmi = false;
        };

        $scope.SaveComponentEdit = function () {
            $("#id_disk option").prop("selected", true);
            $("#id_cpu option").prop("selected", true);
            $("#id_memory option").prop("selected", true);
            $("#id_nic option").prop("selected", true);
            $("#id_ipmi option").prop("selected", true);
            $("#id_raidcontroller option").prop("selected", true);


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
                $scope.component.Newdisks = undefined;
                $scope.component.Newcpu = undefined;
                $scope.component.Newipmi = undefined;
                $scope.component.Newmemory = undefined;
                $scope.component.Newnic = undefined;
                $scope.component.Newraidcontroller = undefined;

                $scope.component.cpu = $scope.component.cpu.length == 0 ? undefined : $scope.component.cpu;
                $scope.component.disks = $scope.component.disks.length == 0 ? undefined : $scope.component.disks;
                $scope.component.ipmi = $scope.component.ipmi.length == 0 ? undefined : $scope.component.ipmi;
                $scope.component.memory = $scope.component.memory.length == 0 ? undefined : $scope.component.memory;
                $scope.component.nic = $scope.component.nic.length == 0 ? undefined : $scope.component.nic;
                $scope.component.raid = $scope.component.raid.length == 0 ? undefined : $scope.component.raid;

                //$http.post(editURL + "components_edit/", {'components_edit':$scope.component}).then(function (response) {
                $http.post(editURL + "components_edit/", {
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


                    $location.path("/servers/").search({ param: "Component updated" });


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

        $scope.CancelComponentEdit = function () {
            $location.path("/servers");
        };

        $scope.ClearValidation = function () {
            $scope.motherboarderr = false;
            $scope.cpuerr = false;
            $scope.memoryerr = false;
        };

        $scope.AddDisk = function (curdisk, disk) {

            for (var j = 0; j <= curdisk.length - 1; j++) {
                for (var i = 0; i <= disk.length - 1; i++) {
                    if (curdisk[j] == disk[i].url) {

                        $scope.avail_disk.push(disk[i]);
                        $scope.component.disks.push(disk[i]);
                        var idx = $scope.disk.indexOf(disk[i]);
                        $scope.disk.splice(idx, 1);
                    }
                }
            }

        };


        $scope.AddCPU = function (curcpu, cpu) {

            for (var j = 0; j <= curcpu.length - 1; j++) {
                for (var i = 0; i <= cpu.length - 1; i++) {
                    if (curcpu[j] == cpu[i].url) {

                        $scope.avail_cpu.push(cpu[i]);
                        $scope.component.cpu.push(cpu[i]);
                        var idx = $scope.cpu.indexOf(cpu[i]);
                        $scope.cpu.splice(idx, 1);
                    }
                }
            }
        };

        $scope.AddMemory = function (curmemory, memory) {

            for (var j = 0; j <= curmemory.length - 1; j++) {
                for (var i = 0; i <= memory.length - 1; i++) {
                    if (curmemory[j] == memory[i].url) {

                        $scope.avail_memory.push(memory[i]);
                        $scope.component.memory.push(memory[i]);
                        var idx = $scope.memory.indexOf(memory[i]);
                        $scope.memory.splice(idx, 1);
                    }
                }
            }


        };

        $scope.AddNIC = function (curnic, nic) {

            for (var j = 0; j <= curnic.length - 1; j++) {
                for (var i = 0; i <= nic.length - 1; i++) {
                    if (curnic[j] == nic[i].url) {

                        $scope.avail_nic.push(nic[i]);
                        $scope.component.nic.push(nic[i]);
                        var idx = $scope.nic.indexOf(nic[i]);
                        $scope.nic.splice(idx, 1);
                    }
                }
            }


        };

        $scope.AddRAID = function (curraid, raid) {

            for (var j = 0; j <= curraid.length - 1; j++) {
                for (var i = 0; i <= raid.length - 1; i++) {
                    if (curraid[j] == raid[i].url) {
                        $scope.avail_raidController.push(raid[i]);
                        $scope.component.raid.push(raid[i]);
                        var idx = $scope.raidController.indexOf(raid[i]);
                        $scope.raidController.splice(idx, 1);
                    }
                }
            }


        };

        $scope.AddIPMI = function (curipmi, ipmi) {


            for (var j = 0; j <= curipmi.length - 1; j++) {
                for (var i = 0; i <= ipmi.length - 1; i++) {
                    if (curipmi[j] == ipmi[i].url) {

                        $scope.avail_ipmi.push(ipmi[i]);
                        $scope.component.ipmi.push(ipmi[i]);
                        var idx = $scope.ipmi.indexOf(ipmi[i]);
                        $scope.ipmi.splice(idx, 1);
                    }
                }
            }


        };


        /*** remove ***/

        $scope.RemoveDisk = function (curdisk, disk) {

            for (var j = 0; j <= curdisk.length - 1; j++) {
                for (var i = 0; i <= disk.length - 1; i++) {
                    if (curdisk[j].url == disk[i].url) {

                        $scope.disk.push(disk[i]);
                        var idx = $scope.avail_disk.indexOf(disk[i]);
                        $scope.avail_disk.splice(idx, 1);
                        $scope.component.disks.splice(idx, 1);
                    }
                }
            }
        };

        $scope.RemoveCPU = function (curcpu, cpu) {

            for (var j = 0; j <= curcpu.length - 1; j++) {
                for (var i = 0; i <= cpu.length - 1; i++) {
                    if (curcpu[j].url == cpu[i].url) {
                        $scope.cpu.push(cpu[i]);
                        var idx = $scope.avail_cpu.indexOf(cpu[i]);
                        $scope.avail_cpu.splice(idx, 1);
                        $scope.component.cpu.splice(idx, 1);
                    }
                }
            }
        };

        $scope.RemoveMemory = function (curmemory, memory) {

            for (var j = 0; j <= curmemory.length - 1; j++) {
                for (var i = 0; i <= memory.length - 1; i++) {
                    if (curmemory[j].url == memory[i].url) {
                        $scope.memory.push(memory[i]);
                        var idx = $scope.avail_memory.indexOf(memory[i]);
                        $scope.avail_memory.splice(idx, 1);
                        $scope.component.memory.splice(idx, 1);
                    }
                }
            }
        };

        $scope.RemoveNIC = function (curnic, nic) {

            for (var j = 0; j <= curnic.length - 1; j++) {
                for (var i = 0; i <= nic.length - 1; i++) {
                    if (curnic[j].url == nic[i].url) {
                        $scope.nic.push(nic[i]);
                        var idx = $scope.avail_nic.indexOf(nic[i]);
                        $scope.avail_nic.splice(idx, 1);
                        $scope.component.nic.splice(idx, 1);
                    }
                }
            }
        };

        $scope.RemoveRAID = function (curraid, raid) {

            for (var j = 0; j <= curraid.length - 1; j++) {
                for (var i = 0; i <= raid.length - 1; i++) {
                    if (curraid[j].url == raid[i].url) {
                        $scope.raidController.push(raid[i]);
                        var idx = $scope.avail_raidController.indexOf(raid[i]);
                        $scope.avail_raidController.splice(idx, 1);
                        $scope.component.raid.splice(idx, 1);
                    }
                }
            }
        };

        $scope.RemoveIPMI = function (curipmi, ipmi) {

            for (var j = 0; j <= curipmi.length - 1; j++) {
                for (var i = 0; i <= ipmi.length - 1; i++) {
                    if (curipmi[j].url == ipmi[i].url) {
                        $scope.ipmi.push(ipmi[i]);
                        var idx = $scope.avail_ipmi.indexOf(ipmi[i]);
                        $scope.avail_ipmi.splice(idx, 1);
                        $scope.component.ipmi.splice(idx, 1);
                    }
                }
            }
        };

        $scope.RemoveMB = function () {
            $http.get(editURL + "get_motherboard/").then(function (result) {

                $scope.motherboard = result.data.motherboards;
            });

            $scope.motherboard = $scope.motherboard[""];

            for (var i = 0; i <= $scope.avail_disk.length - 1; i++) {
                $scope.disk.push($scope.avail_disk[i]);
            }

            for (var i = 0; i <= $scope.avail_cpu.length - 1; i++) {
                $scope.cpu.push($scope.avail_cpu[i]);
            }

            for (var i = 0; i <= $scope.avail_memory.length - 1; i++) {
                $scope.memory.push($scope.avail_memory[i]);
            }

            for (var i = 0; i <= $scope.avail_nic.length - 1; i++) {
                $scope.nic.push($scope.avail_nic[i]);
            }

            for (var i = 0; i <= $scope.avail_raidController.length - 1; i++) {
                $scope.raidController.push($scope.avail_raidController[i]);
            }

            for (var i = 0; i <= $scope.avail_ipmi.length - 1; i++) {
                $scope.ipmi.push($scope.avail_ipmi[i]);
            }

            $scope.avail_disk = [];
            $scope.avail_cpu = [];
            $scope.avail_memory = [];
            $scope.avail_nic = [];
            $scope.avail_raidController = [];
            $scope.avail_ipmi = [];

            $scope.component.disks = undefined;
            $scope.component.cpu = undefined;
            $scope.component.memory = undefined;
            $scope.component.nic = undefined;
            $scope.component.raid = undefined;
            $scope.component.ipmi = undefined;

            $scope.component.disks = [];
            $scope.component.cpu = [];
            $scope.component.memory = [];
            $scope.component.nic = [];
            $scope.component.raid = [];
            $scope.component.ipmi = [];

            $scope.showrmvmb = false;
            $scope.showaddmb = true;
        };
    }
]);





