
var app = angular.module('uldb');
app.controller('GCPVirtualMachinesController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$q',
    '$window',
    '$location',
    '$filter',
    '$timeout',
    '$http',
    'BreadCrumbService',
    'ClientDashboardService',
    'GCPService',
    '$uibModal',
    'TaskService',
    'ClientApi',
    'TableHeaders',
    'DataFormattingService',
    'RestService',
    'AlertService2',
    'ValidationService',
    'SearchService',
    'TaskService2',
    function (
        $scope,
        $rootScope,
        $state,
        $stateParams,
        $q,
        $window,
        $location,
        $filter,
        $timeout,
        $http,
        BreadCrumbService,
        ClientDashboardService,
        GCPService,
        $uibModal,
        TaskService,
        ClientApi,
        TableHeaders,
        DataFormattingService,
        RestService,
        AlertService2,
        ValidationService,
        SearchService,
        TaskService2) {

        $scope.account_id = angular.copy($stateParams.uuidp);

        var intialParams = {'page': 1, 'page_size': 10, 'account_id': $stateParams.uuidp};
        var modalInstance = null;

        $scope.setGCPPowerState = function () {
            angular.forEach($scope.gcp_result, function (value, key) {
                if (value.status == "RUNNING") {
                    value.power = true;
                } else {
                    value.power = false;
                }
            });
        };

        $scope.confirmationCheck = function (index, vm_uuid, status) {
            console.log("Status..."+status);
            if (status === "RUNNING") {
                $scope.action = 'POWER OFF';
            }
            else {
                $scope.action = 'POWER ON';
            }

            $scope.vm_uuid = vm_uuid;
            $scope.status = status;

            modalInstance = $uibModal.open({
                templateUrl: 'confirmationCheck.html',
                scope: $scope,
                size: 'md'
            });
            $scope.cancel = function () {
                modalInstance.close();
            };
            $scope.confirm = function(params, action) {
                $scope.powerStatusToggle(index, vm_uuid, status);
            };

        };


        $scope.powerStatusToggle = function (index, vm_uuid, status) {
            console.log("Status..."+status);
            if (status === "RUNNING") {
                var url = '/customer/gcp/instances/'+vm_uuid+'/power_off/';
                var msg_alert = 'VM Powered Off';
            } else {
                var url = '/customer/gcp/instances/'+vm_uuid+'/power_on/';
                var msg_alert = 'VM Powered On';
            }
            $scope.gcp_result[index].powerStateLoading = true;

            return $http({
                url: url,
                method: 'GET'
            }).then(function (response) {
                modalInstance.close();
                if (response.data.hasOwnProperty('task_id')) {
                    AlertService2.success('Request has been submitted. It will take few mins to complete.');
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            console.log("Result.......");
                            $scope.gcp_result[index].powerStateLoading = false;
                            $scope.get_synced_vms();
                            AlertService2.success(msg_alert);
                        }
                        
                    }).catch(function (error) {
                        $scope.gcp_result[index].powerStateLoading = false;
                        AlertService2.danger("Server Error");
                        modalInstance.close();
                        $scope.loader = false;
                    });
                } else {
                    AlertService2.success(msg_alert);
                }
            }).catch(function (response) {
                AlertService2.danger(response.data);
                $scope.gcp_result[index].powerStateLoading = false;
                modalInstance.close();
                $scope.loader = false;
            });
        };

        var defineGCPformElements = function () {
            $scope.gcp_rows = [
                {name: 'name', description: "Name", required: true},
                {name: 'status', description: "Status", required: true, is_sort_disabled: true},
                {name: 'zone', description: "Zone", required: true},
                {name: 'cpu_platform', description: "CPU Platform", required: true},
                // {name: 'machine_type', description: "Machine", required: true},
                {name: 'operating_system', description: "OS", required: true},
                {name: 'internal_ip', description: "Internal IP", required: true, is_sort_disabled: true},
                {name: 'external_ip', description: "External IP", required: true, is_sort_disabled: true},
                // {name: 'management_ip', description: "Management IP", required: true},
            ];
        };

        $scope.show_gcp_device_statistics = function (device_id) {
            $state.go('devices.vms.gcpvm', {uuidq: device_id}, {reload: false});
        };

        $scope.getSearchResults = function(searchKeyword){
            var params = {
                'account_id': $stateParams.uuidp,
                'page': 1,
                'search': searchKeyword
            };
            $scope.get_synced_vms(params);
        };


        $scope.get_synced_vms = function(params){
             $http({
                url: '/customer/gcp/instances/',
                params: params,
                method: 'GET',
            }).then(function (response) {
                $scope.gcp_result = response.data.results;
                $scope.model_count = response.data.count;
                $scope.gcp_loaded = true;
                $scope.setGCPPowerState();
            });
        };

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        $scope.close_modal = function () {
            modalSupport.dismiss('cancel');
        };

        // Mange by creating support request
        var modalSupport = null;
        var showModal = function (template, controller) {
            if (modalSupport !== null) {
                modalSupport.dismiss('cancel');
            }
            $scope.loader = false;
            modalSupport = $uibModal.open({
                templateUrl: template,
                controller: controller,
                scope: $scope,
            });

            modalSupport.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
            });
        };

        $scope.getSortingResults = function (sort) {
            $scope.sortingColumn = sort.sortingColumn;
            $scope.sortkey = sort.sortingColumn;
            $scope.page = 1;
            var params = {
                'account_id': $stateParams.uuidp,
                'page': $scope.page,
                'ordering': sort.sortingColumn,
                'search': $scope.searchKeyword
            };
            $scope.get_synced_vms(params);
        };

        $scope.manage_request_vm = function (device_name, device_type, result) {
            console.log("Manage by ticket called.....");
            $scope.device_type = device_type;
            $scope.device_name = device_name;
            $scope.description = 
                "Device Type: " + device_type + "\n" +
                "Device Name: " + device_name + "\n" +
                "Operating System: " + result.operating_system + "\n" +
                "CPU Platform: " + result.cpu_platform + "\n" +
                "Machine Type: " + result.machine_type + "\n" +
                "Power State: " + result.status;
            showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };

        var load_virtual_machines = function(){

            // $scope.$on('$destroy', function () {
            //     BreadCrumbService.pushIfTop({ name: "GCP ", url: '#/gcp-dasboard' }, $scope);
            // });

            $http({
                url: '/customer/gcp/instances/sync_vms',
                method: 'GET',
                params: {
                    account_id: $stateParams.uuidp,
                },
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 1000).then(function (result) {
                        if (result) {
                            $scope.get_synced_vms(intialParams);
                        }

                    }).catch(function (error) {
                        AlertService2.danger("Error while fetching GCP virtual machines:");
                        $scope.gcp_result = [];
                        $scope.gcp_loaded = true;
                    });
                } else {
                    $scope.gcp_result = response.data;
                    $scope.gcp_loaded = true;
                    $scope.platform_type = response.data.platform_type;
                    $scope.setGCPPowerState();
                }

            });
            defineGCPformElements();
        };

        load_virtual_machines();


        $scope.get_vms = function(){
            $http({
                url: '/customer/gcp/instances/sync_vms',
                method: 'GET',
                params: {
                    account_id: $stateParams.uuidp,
                },
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $scope.get_synced_vms(intialParams);
                        }

                    }).catch(function (error) {
                        AlertService2.danger("Error while fetching GCP virtual machines:");
                        $scope.gcp_result = [];
                        $scope.gcp_loaded = true;
                    });
                } else {
                    $scope.gcp_result = response.data;
                    $scope.gcp_loaded = true;
                    $scope.platform_type = response.data.platform_type;
                    $scope.setGCPPowerState();
                }

            });
            defineGCPformElements();
        };

        $scope.invokeVirtualMachineForm = function(account_id){

            $scope.widgetLoading = $scope.getVMMetaData(account_id);
            showModal('inputVirtualMachineForm.html');
            $scope.zone_images_loader = true;

        };



        $scope.getVMMetaData = function(account_id){


            $http({
                url: '/customer/gcp/account/'+account_id+'/get_vm_create_metadata/',
                method: 'GET',
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    $scope.widgetLoading = TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            console.log("result : ",angular.toJson(result));
                            $scope.images_list = result.images;
                            $scope.zones_list = result.zones;
                            $scope.zone_images_loader = false;
                        }

                    }).catch(function (error) {
                        $scope.images_list = {};
                        $scope.zones_list = [];
                        AlertService2.danger("Error while fetching GCP vm meta data:");
                        $scope.zone_images_loader = false;
                    });
                } else {
                    $scope.images_list = {};
                    $scope.zones_list = [];
                    $scope.zone_images_loader = false;
                }

            });

        };


        $scope.loadZoneSpecificMachines = function(account_id, zone){

            $scope.machine_loader = true;

            // console.log("Selected Zone :"+zone);
            $http({
                url: '/customer/gcp/account/'+account_id+'/get_machine_types/',
                method: 'GET',
                params: {
                    zone: zone,
                },
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    $scope.widgetLoading = TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            console.log("result : ",angular.toJson(result));
                            $scope.machine_list = result;
                            $scope.machine_loader = false;
                        }

                    }).catch(function (error) {
                        $scope.machine_loader = false;
                        $scope.machine_list = {};
                        AlertService2.danger("Error while fetching GCP vm meta data:");
                    });
                } else {
                    $scope.machine_loader = false;
                    $scope.machine_list = {};
                }

            });

        };


        $scope.create_instance = function(account_id, params){

            console.log("Selected account :"+account_id);

            var formdata = new FormData();
            formdata.append('name', params.name);
            formdata.append('zone', params.zone);
            formdata.append('image', params.image);
            formdata.append('machine_type', params.machine_type);

            $http.post('/customer/gcp/account/'+account_id+'/create_virtual_machine/',
                formdata, {
                    headers: {
                        'Content-Type' : undefined
                    },
                    transformRequest: angular.identity,
            }).then(function (response) {
                $scope.close_modal();
                AlertService2.success("Request for VM creation has been submitted. It will take few minutes.");
                if (response.data.hasOwnProperty('task_id')) {
                    $scope.widgetLoading = TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            AlertService2.success("VM has been created successfully");
                            $scope.get_vms();
                        }

                    }).catch(function (error) {
                        AlertService2.danger("Error while creating GCP vm");
                    });
                } else {
                    $scope.close_modal();
                    $scope.get_vms();
                }
            }).catch(function(error){
                $scope.close_modal();
                $scope.addRGErrors = error;
                AlertService2.danger(error);
             });

        };


    }
]);
