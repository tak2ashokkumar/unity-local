var app = angular.module('uldb');
app.controller('vmwareviewController', [
    '$scope',
    '$rootScope',
    '$q',
    '$filter',
    '$routeParams',
    '$location',
    '$http',
    'CustomDataService',
    'AdminApi',
    'DataFormattingService',
    'VmwareService',
    'TaskService',
    'TableHeaders',
    'RestService',
    'AlertService2',
    'ValidationService',
    function ($scope,
              $rootScope,
              $q,
              $filter,
              $routeParams,
              $location,
              $http,
              CustomDataService,
              AdminApi,
              DataFormattingService,
              VmwareService,
              TaskService,
              TableHeaders,
              RestService,
              AlertService2,
              ValidationService) {

        var vcenter_id = $routeParams.id;
        var url = AdminApi.vm_get_validation.replace(":vcenter_id", vcenter_id);
        VmwareService.get_vm_status(url).then(function (result) {
            if (result.data.info.state === "True") {
                var vcenter_name = $routeParams.vcenter_name;
                var datacenter_id = "";
                var vm_id = "";
                var cluster_id = "";
                $scope.alertService = AlertService2;
                $scope.vmware_datacenters_headers = TableHeaders.vm_datacenters_header;
                $scope.vmware_datastores_headers = TableHeaders.vm_datastores_header;
                $scope.vmware_hypervisors_headers = TableHeaders.vm_hypervisors_header;
                $scope.vmware_virtual_machines_headers = TableHeaders.vm_virtual_machines_header;
                $scope.vmware_folders_headers = TableHeaders.vm_folders_header;
                $scope.vmware_resource_pool_headers = TableHeaders.vm_resource_pool_header;
                $scope.vmware_snapshot_headers = TableHeaders.vm_snapshot_header;
                $scope.vmware_clusters_headers = TableHeaders.vm_clusters_header;
                $scope.vmware_customers_headers = TableHeaders.vm_customers_header;

                $scope.vmware_folders = {};
                $scope.vmware_resource_pool = {};
                $scope.vmware_snapshot = {};
                $scope.vmware_datacenter = {};
                $scope.vmware_hypervisors = {};
                $scope.vmware_datastores = {};
                $scope.vmware_virtualmachines = {};
                $scope.vmware_clusters = {};
                $scope.title = { plural: vcenter_name, singular: vcenter_name };
                if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;


                var getVmwareTemplate = function (name) {
                    return AdminApi.create_vmware_modal.replace(":name", name);
                };
                var load_vmware_folders = function () {
                    var url = AdminApi.vm_get_folder.replace(":vcenter_id", vcenter_id);
                    VmwareService.get_vmware_folders(url).then(function (result) {
                        $scope.vmware_folders = result;
                    });
                };
                var load_vmware_datacenters = function () {
                    var url = AdminApi.vm_get_datacenter.replace(":vcenter_id", vcenter_id);
                    VmwareService.get_vmware_datacenter(url).then(function (result) {
                        $scope.vmware_datacenter = result;
                    });
                };
                var load_vmware_resource_pools = function () {
                    var url = AdminApi.vm_get_resource_pool.replace(":vcenter_id", vcenter_id);
                    VmwareService.get_vmware_resource_pools(url).then(function (result) {
                        $scope.vmware_resource_pool = result;
                    });
                };
                var load_vmware_snapshots = function () {
                    var url = AdminApi.vm_get_snapshot.replace(":vcenter_id", vcenter_id);
                    VmwareService.get_vmware_snapshots(url).then(function (result) {
                        $scope.vmware_snapshot = result;
                    });
                };
                var load_vmware_hypervisors = function () {
                    var url = AdminApi.vm_get_hypervisor.replace(":vcenter_id", vcenter_id);
                    VmwareService.get_vmware_hypervisors(url).then(function (result) {
                        $scope.vmware_hypervisors = result;
                    });
                };
                var load_vmware_datastores = function () {
                    var url = AdminApi.vm_get_datastore.replace(":vcenter_id", vcenter_id);
                    VmwareService.get_vmware_datastores(url).then(function (result) {
                        $scope.vmware_datastores = result;
                    });
                };
                var load_vmware_virtualmachines = function () {
                    var url = AdminApi.vm_get_virtualmachine.replace(":vcenter_id", vcenter_id);
                    VmwareService.get_vmware_virtualmachines(url).then(function (result) {
                        $scope.vmware_virtualmachines = result;
                    });
                };
                var load_vmware_clusters = function () {
                    var url = AdminApi.vm_get_cluster.replace(":vcenter_id", vcenter_id);
                    VmwareService.get_vmware_clusters(url).then(function (result) {
                        $scope.vmware_clusters = result;
                    });
                };
                load_vmware_datacenters();
                load_vmware_hypervisors();
                load_vmware_datastores();
                load_vmware_virtualmachines();
                load_vmware_folders();
                load_vmware_resource_pools();
                load_vmware_snapshots();
                load_vmware_clusters();
                CustomDataService.get_vmware_customers().then(function (result) {
                    $scope.vmware_customers = DataFormattingService.formatTableData(result);
                });
                $scope.vmware_global_switches = function (args) {
                    datacenter_id = args.id;
                    vm_id = args.id;
                    cluster_id = args.id;
                    var resource_pool_id = args.id;
                    if (args.switche == "power_on") {
                        var url = AdminApi.vm_power_on.replace(":vcenter_id", vcenter_id).replace(":virtual_machine_id", args.id);
                        VmwareService.get_vmware_poweron(url).then(function (result) {
                            if (result.data.hasOwnProperty("celery_task")) {
                                TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                    if (celery_response.state == "SUCCESS") {
                                        AlertService2.addAlert({ msg: celery_response.result.message, severity: 'success' });
                                        $scope.vmware_virtualmachines = "";
                                        load_vmware_virtualmachines();
                                    }
                                    else {
                                        AlertService2.addAlert({ msg: celery_response.result.message, severity: 'danger' });
                                        $scope.vmware_virtualmachines = "";
                                        load_vmware_virtualmachines();
                                    }
                                }, function (error) {
                                    AlertService2.addAlert({ msg: error.data.result.message, severity: 'danger' });
                                    $scope.vmware_virtualmachines = "";
                                    load_vmware_virtualmachines();
                                });
                            }
                        });
                    }
                    else if (args.switche == "power_off") {
                        var url = AdminApi.vm_power_off.replace(":vcenter_id", vcenter_id).replace(":virtual_machine_id", args.id);
                        VmwareService.get_vmware_poweroff(url).then(function (result) {
                            if (result.data.hasOwnProperty("celery_task")) {
                                TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                    if (celery_response.state == "SUCCESS") {
                                        AlertService2.addAlert({ msg: celery_response.result.message, severity: 'success' });
                                        $scope.vmware_virtualmachines = "";
                                        load_vmware_virtualmachines();
                                    }
                                    else {
                                        AlertService2.addAlert({ msg: celery_response.result.message, severity: 'danger' });
                                        $scope.vmware_virtualmachines = "";
                                        load_vmware_virtualmachines();
                                    }
                                }, function (error) {
                                    AlertService2.addAlert({ msg: error.data.result.message, severity: 'danger' });
                                    $scope.vmware_virtualmachines = "";
                                    load_vmware_virtualmachines();
                                });
                            }
                        });
                    }
                    else if (args.switche == "delete_vm") {
                        $scope.vmware_virtualmachines = "";
                        var url = AdminApi.vm_delete_vm.replace(":vcenter_id", vcenter_id).replace(":virtual_machine_id", args.id);
                        VmwareService.get_vmware_deletevm(url).then(function (result) {
                            if (result.data.hasOwnProperty("celery_task")) {
                                TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                    if (celery_response.state == "SUCCESS") {
                                        load_vmware_virtualmachines();
                                        AlertService2.addAlert({ msg: celery_response.result.message, severity: 'success' });
                                    }
                                    else {
                                        load_vmware_virtualmachines();
                                        AlertService2.addAlert({ msg: celery_response.result.message, severity: 'danger' });
                                    }
                                }, function (error) {
                                    load_vmware_virtualmachines();
                                    AlertService2.addAlert({ msg: error.data.result.message, severity: 'danger' });
                                });
                            }
                        });
                    }
                    else if (args.switche == "delete_resourcepool") {
                        $scope.vmware_resource_pool = "";
                        var url = AdminApi.vm_delete_resourcepool.replace(":vcenter_id", vcenter_id).replace(":resource_pool_id", args.id);
                        VmwareService.get_vmware_delete_resourcepool(url).then(function (result) {
                            if (result.data.hasOwnProperty("celery_task")) {
                                TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                    if (celery_response.state == "SUCCESS") {
                                        load_vmware_resource_pools();
                                        AlertService2.addAlert({ msg: celery_response.result.message, severity: 'success' });
                                    }
                                    else {
                                        load_vmware_resource_pools();
                                        AlertService2.addAlert({ msg: celery_response.result.message, severity: 'danger' });
                                    }
                                }, function (error) {
                                    load_vmware_resource_pools();
                                    AlertService2.addAlert({ msg: error.data.result.message, severity: 'danger' });
                                });
                            }
                        });
                    }
                    else if (args.switche == "list_snapshot") {
                        var key = "list_snapshot";
                        vcenter_id;
                        $location.path('/vmware_view_detail/' + vcenter_id + '/' + key + '/' + args.id);
                    }
                };
                $scope.vmware_resource_pool_add = function (params) {
                    if (!(params.memory_level == undefined)) {
                        var temp1 = params.memory_level;
                        params.memory_shares = params.memory_level.value;
                        params.memory_level = params.memory_level.label;
                    }
                    if (!(params.cpu_level == undefined)) {
                        var temp2 = params.cpu_level;
                        params.cpu_shares = params.cpu_level.value;
                        params.cpu_level = params.cpu_level.label;
                    }
                    $scope.obj = params;
                    var valid = ValidationService.validate_data(params, $scope.vmware_resource_pool_rows);
                    if (!valid.is_validated) {
                        console.log(JSON.stringify(valid));
                        params.memory_level = temp1;
                        params.cpu_level = temp2;
                        return valid;
                    } else if ((params.memory_reservation > params.memory_limit) || (params.cpu_reservation > params.cpu_limit)) {
                        params.memory_level = temp1;
                        params.cpu_level = temp2;
                        if (params.memory_reservation > params.memory_limit) {
                            params.is_validated = false;
                            params["memory_limiterr"] = true;
                            params["memory_limitMsg"] = "Value of Memory Limit cannot be less then Memory Reservation";
                        }
                        if (params.cpu_reservation > params.cpu_limit) {
                            params.is_validated = false;
                            params["cpu_limiterr"] = true;
                            params["cpu_limitMsg"] = "Value of CPU Limit cannot be less then CPU Reservation";
                        }
                        return params;
                    }
                    else {
                        $scope.vmware_resource_pool = "";
                        var url = AdminApi.vm_add_resourcepool.replace(":vcenter_id", vcenter_id).replace(":cluster_id", cluster_id);
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                if (celery_response.state == "SUCCESS") {
                                    load_vmware_resource_pools();
                                    AlertService2.addAlert({ msg: celery_response.result.message, severity: 'success' });
                                }
                                else {
                                    load_vmware_resource_pools();
                                    AlertService2.addAlert({ msg: celery_response.result.message, severity: 'danger' });
                                }
                            }, function (error) {
                                load_vmware_resource_pools();
                                AlertService2.addAlert({ msg: error.data.result.message, severity: 'danger' });
                            });
                        });
                        var response_obj = { "success": "Added Successfuly" };
                        return response_obj;
                    }
                };
                $scope.vmware_datacenter_add = function (params) {
                    $scope.obj = params;
                    var valid = ValidationService.validate_data(params, $scope.vmware_datacenter_rows);
                    if (!valid.is_validated) {
                        return valid;
                    }
                    else {
                        $scope.vmware_datacenter = "";
                        var url = AdminApi.vm_add_datacenter.replace(":vcenter_id", vcenter_id);
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                if (celery_response.state == "SUCCESS") {
                                    load_vmware_datacenters();
                                    AlertService2.addAlert({ msg: celery_response.result.message, severity: 'success' });
                                } else {
                                    load_vmware_datacenters();
                                    AlertService2.addAlert({ msg: celery_response.result.message, severity: 'danger' });
                                }
                            }, function (error) {
                                load_vmware_datacenters();
                                AlertService2.addAlert({ msg: error.data.result.message, severity: 'danger' });
                            });
                        });
                        var response_obj = { "success": "Added Successfuly" };
                        return response_obj;
                    }
                };

                $scope.vmware_hypervisors_add = function (params) {
                    if (($("#ip_field_1").val() == "") || ($("#ip_field_2").val() == "") || ($("#ip_field_3").val() == "") || ($("#ip_field_4").val() == "")) {
                        params.host = "";
                    }
                    else {
                        params.host = $("#ip_field_1").val() + "." + $("#ip_field_2").val() + "." + $("#ip_field_3").val() + "." + $("#ip_field_4").val();
                    }
                    $scope.obj = params;
                    var valid = ValidationService.validate_data(params, $scope.vmware_hypervisors_rows);
                    if (!valid.is_validated) {
                        params.host = $("#ip_field_1").val();
                        return valid;
                    }
                    else {
                        delete params.ip2;
                        delete params.ip3;
                        delete params.ip4;
                        $scope.vmware_folders = "";
                        $scope.vmware_resource_pool = "";
                        $scope.vmware_clusters = "";
                        $scope.vmware_datacenter = "";
                        $scope.vmware_hypervisors = "";
                        $scope.vmware_virtualmachines = "";
                        $scope.vmware_snapshot = "";
                        var url = AdminApi.vm_add_hypervisor.replace(":vcenter_id", vcenter_id).replace(":cluster_id", cluster_id);
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                if (celery_response.state == "SUCCESS") {
                                    load_vmware_datacenters();
                                    load_vmware_hypervisors();
                                    load_vmware_datastores();
                                    load_vmware_virtualmachines();
                                    load_vmware_folders();
                                    load_vmware_resource_pools();
                                    load_vmware_snapshots();
                                    load_vmware_clusters();
                                    AlertService2.addAlert({ msg: celery_response.result.message, severity: 'success' });
                                } else {
                                    load_vmware_datacenters();
                                    load_vmware_hypervisors();
                                    load_vmware_datastores();
                                    load_vmware_virtualmachines();
                                    load_vmware_folders();
                                    load_vmware_resource_pools();
                                    load_vmware_snapshots();
                                    load_vmware_clusters();
                                    AlertService2.addAlert({ msg: celery_response.result.message, severity: 'danger' });
                                }
                            }, function (error) {
                                load_vmware_datacenters();
                                load_vmware_hypervisors();
                                load_vmware_datastores();
                                load_vmware_virtualmachines();
                                load_vmware_folders();
                                load_vmware_resource_pools();
                                load_vmware_snapshots();
                                load_vmware_clusters();
                                AlertService2.addAlert({ msg: error.data.result.message, severity: 'danger' });
                            });
                        });
                        var response_obj = { "success": "Added Successfuly" };
                        return response_obj;
                    }
                };
                $scope.vmware_cluster_add = function (params) {
                    $scope.obj = params;
                    var valid = ValidationService.validate_data(params, $scope.vmware_cluster_rows);
                    if (!valid.is_validated) {
                        return valid;
                    }
                    else {
                        var url = AdminApi.vm_add_cluster.replace(":vcenter_id", vcenter_id).replace(":datacenter_id", datacenter_id);
                        $scope.vmware_clusters = "";
                        $scope.vmware_datacenter = "";
                        $scope.vmware_folders = "";
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                if (celery_response.state == "SUCCESS") {
                                    load_vmware_folders();
                                    load_vmware_datacenters();
                                    load_vmware_clusters();
                                    AlertService2.addAlert({ msg: celery_response.result.message, severity: 'success' });
                                } else {
                                    load_vmware_folders();
                                    load_vmware_datacenters();
                                    load_vmware_clusters();
                                    AlertService2.addAlert({ msg: celery_response.result.message, severity: 'danger' });
                                }
                            }, function (error) {
                                load_vmware_folders();
                                load_vmware_datacenters();
                                load_vmware_clusters();
                                AlertService2.addAlert({ msg: error.data.result.message, severity: 'danger' });
                            });
                        });
                        var response_obj = { "success": "Added Successfuly" };
                        return response_obj;
                    }
                };
                $scope.vmware_virtualmachines_add = function (params) {
                    $scope.obj = params;
                    var valid = ValidationService.validate_data(params, $scope.vmware_virtualmachines_rows);
                    if (!valid.is_validated) {
                        return valid;
                    }
                    else {
                        $scope.vmware_resource_pool = "";
                        $scope.vmware_clusters = "";
                        $scope.vmware_datacenter = "";
                        $scope.vmware_hypervisors = "";
                        $scope.vmware_virtualmachines = "";
                        $scope.vmware_snapshot = "";
                        var url = AdminApi.vm_add_virtualmachine.replace(":vcenter_id", vcenter_id).replace(":cluster_id", cluster_id);
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                if (celery_response.state == "SUCCESS") {
                                    load_vmware_datacenters();
                                    load_vmware_hypervisors();
                                    load_vmware_datastores();
                                    load_vmware_virtualmachines();
                                    load_vmware_folders();
                                    load_vmware_resource_pools();
                                    load_vmware_snapshots();
                                    load_vmware_clusters();
                                    AlertService2.addAlert({ msg: celery_response.result.message, severity: 'success' });
                                } else {
                                    load_vmware_datacenters();
                                    load_vmware_hypervisors();
                                    load_vmware_datastores();
                                    load_vmware_virtualmachines();
                                    load_vmware_folders();
                                    load_vmware_resource_pools();
                                    load_vmware_snapshots();
                                    load_vmware_clusters();
                                    AlertService2.addAlert({ msg: celery_response.result.message, severity: 'danger' });
                                }
                            }, function (error) {
                                load_vmware_datacenters();
                                load_vmware_hypervisors();
                                load_vmware_datastores();
                                load_vmware_virtualmachines();
                                load_vmware_folders();
                                load_vmware_resource_pools();
                                load_vmware_snapshots();
                                load_vmware_clusters();
                                AlertService2.addAlert({ msg: error.data.result.message, severity: 'danger' });
                            });
                        });
                        var response_obj = { "success": "Added Successfuly" };
                        return response_obj;
                    }
                };
                $scope.vmware_snapshot_add = function (params) {
                    $scope.obj = params;
                    var valid = ValidationService.validate_data(params, $scope.vmware_snapshot_rows);
                    if (!valid.is_validated) {
                        return valid;
                    }
                    else {
                        $scope.vmware_snapshot = "";
                        var url = AdminApi.vm_snapshot_add.replace(":vcenter_id", vcenter_id).replace(":vm_id", vm_id);
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                if (celery_response.state == "SUCCESS") {
                                    load_vmware_snapshots();
                                    AlertService2.addAlert({ msg: celery_response.result.message, severity: 'success' });
                                } else {
                                    load_vmware_snapshots();
                                    AlertService2.addAlert({ msg: celery_response.result.message, severity: 'danger' });
                                }
                            }, function (error) {
                                load_vmware_snapshots();
                                AlertService2.addAlert({ msg: error.data.result.message, severity: 'danger' });
                            });
                        });
                        var response_obj = { "success": "Added Successfuly" };
                        return response_obj;
                    }
                };
                $scope.vmware_virtualmachines_actions = [
                    { "name": "Power On", "button": "power_on" },
                    { "name": "Power Off", "button": "power_off" },
                    { "name": "Remove", "button": "delete_vm" },
                    { "name": "Create Snapshot", "button": "create_snapshot" },
                    { "name": "List Snapshot", "button": "list_snapshot" }
                ];
                $scope.vmware_resource_pool_actions = [
                    { "name": "Remove", "button": "delete_resourcepool" }
                ];
                $scope.vmware_datacenter_actions = [
                    { "name": "Create Cluster", "button": "create_cluster" }
                ];
                $scope.vmware_hypervisors_actions = [
                    { "name": "Create VM", "link": "#" }
                ];
                $scope.vmware_clusters_actions = [
                    { "name": "Create VM", "button": "create_vm" },
                    { "name": "Create Resource Pool", "button": "create_resource_pool" },
                    { "name": "Add Host", "button": "create_hypervisor" }
                ];
                $scope.vmware_virtualmachines_modeldata5 = {
                    "title": "Create VM",
                    "page": getVmwareTemplate('create_vm')
                };
                $scope.vmware_resource_pool_modeldata = {
                    "title": "Create Resource Pool",
                    "page": getVmwareTemplate('resource_pool')
                };
                $scope.vmware_virtualmachines_modeldata = {
                    "title": "Add Virtual Server",
                    "page": getVmwareTemplate('create')
                };
                $scope.vmware_snapshot_modeldata4 = {
                    "title": "Create Snapshot",
                    "page": getVmwareTemplate('create_snapshot')
                };
                $scope.vmware_datacenter_modeldata = {
                    "title": "Create Datacenter",
                    "page": getVmwareTemplate('create')
                };
                $scope.vmware_hypervisors_modeldata = {
                    "title": "Add Host",
                    "page": getVmwareTemplate('create')
                };
                $scope.vmware_hypervisors_modeldata1 = {
                    "title": "Add Host",
                    "page": getVmwareTemplate('create_hypervisor')
                };
                $scope.vmware_cluster_modeldata3 = {
                    "title": "Create Cluster",
                    "page": getVmwareTemplate('create_cluster')
                };
                $scope.vmware_snapshot_rows = [
                    DataFormattingService.generate_row(["text", "name_of_snapshot", "Name", "required", "128"])
                ];
                $scope.vmware_clusters_rows = [
                    DataFormattingService.generate_row("text", "cluster_name")
                ];
                var listing_cpu = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];
                var listing_memory = ["0.5", "1", "2", "3", "4", "6", "8", "16", "32", "64", "128", "256"];
                var listing_os = ["dosGuest"];
                $scope.vmware_virtualmachines_rows = [
                    DataFormattingService.generate_row(["text", "name_of_vm", "Name", "required", "128"]),
                    DataFormattingService.generate_row(["select", "cpu", "CPU", listing_cpu, "required"]),
                    DataFormattingService.generate_row(["select", "memory", "Memory (GB)", listing_memory, "required"]),
                    DataFormattingService.generate_row(["text", "storage", "Storage", "required", "128"]),
                    DataFormattingService.generate_row(["select", "os_name", "Guest OS Name", listing_os, "required"])
                ];
                $scope.vmware_datacenter_rows = [
                    DataFormattingService.generate_row(["text", "datacenter_name", "Name", "required", "128"])
                ];
                $scope.vmware_hypervisors_rows = [
                    DataFormattingService.generate_row(["text", "host", "Host IP", "required"]),
                    DataFormattingService.generate_row(["text", "username", "Username", "required", "32"]),
                    DataFormattingService.generate_row(["password", "password", "Password", "required", "32"])
                ];
                $scope.vmware_cluster_rows = [
                    DataFormattingService.generate_row(["text", "name_of_cluster", "Name", "required", "128"])
                ];
                var get_listing_cpu_memory_reservation = function () {
                    return DataFormattingService.get_cpu_memory_reservation();
                };
                var get_listing_memory_level = function () {
                    return DataFormattingService.get_memory_level();
                };
                var get_listing_cpu_level = function () {
                    return DataFormattingService.get_cpu_level();
                };
                $scope.vmware_resource_pool_rows = [
                    DataFormattingService.generate_row(["text", "name_of_resourcepool", "Name", "required", "128"]),
                    DataFormattingService.generate_row(["number", "memory_reservation", "Memory Reservation (MB)", "required"]),
                    DataFormattingService.generate_row(["number", "memory_limit", "Memory Limit (MB)", "required"]),
                    DataFormattingService.generate_row(["select", "memory_expandable_reservation", "Memory Expandable Reservation", get_listing_cpu_memory_reservation(), "required"]),
                    DataFormattingService.generate_row(["select", "memory_level", "Memory Level", get_listing_memory_level(), "required"]),
                    DataFormattingService.generate_row(["text", "memory_shares", "Memory Shares", "required"]),
                    DataFormattingService.generate_row(["number", "cpu_reservation", "CPU Reservation (MHz)", "required"]),
                    DataFormattingService.generate_row(["number", "cpu_limit", "CPU Limit (MHz)", "required"]),
                    DataFormattingService.generate_row(["select", "cpu_expandable_reservation", "CPU Expandable Reservation", get_listing_cpu_memory_reservation(), "required"]),
                    DataFormattingService.generate_row(["select", "cpu_level", "CPU Level", get_listing_cpu_level(), "required"]),
                    DataFormattingService.generate_row(["text", "cpu_shares", "CPU Shares", "required"])
                ];
            }
            else {
                AlertService2.addAlert({ msg: "Invalid Access", severity: 'danger' });
                return $location.path("/vmware-dashboard");
            }
        });
    }
]);
