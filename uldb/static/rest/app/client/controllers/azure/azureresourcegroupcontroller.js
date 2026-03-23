var app = angular.module('uldb');
app.controller('AzureResourceGroupController', [
    '$scope',
    '$stateParams',
    '$rootScope',
    '$q',
    '$window',
    '$location',
    '$filter',
    '$timeout',
    'BreadCrumbService',
    'ClientDashboardService',
    'AzureService',
    'TaskService',
    'ClientApi',
    'TableHeaders',
    'DataFormattingService',
    'RestService',
    'AlertService2',
    'ValidationService',
    'SearchService',
    '$http',
    function ($scope,
              $stateParams,
              $rootScope,
              $q,
              $window,
              $location,
              $filter,
              $timeout,
              BreadCrumbService,
              ClientDashboardService,
              AzureService,
              TaskService,
              ClientApi,
              TableHeaders,
              DataFormattingService,
              RestService,
              AlertService2,
              ValidationService,
              SearchService,
              $http) {

        var account_id = '';

        $scope.alertService = AlertService2;
        $scope.resource_list = false;
        $scope.vm_list = false;
        $scope.loader = true;

        $scope.azure_resource_group_headers = TableHeaders.azure_resource_group_headers;
        $scope.azure_resource_headers = TableHeaders.azure_resource_headers;
        $scope.azure_vm_headers = TableHeaders.azure_vm_headers;

        $scope.default_error_msg = "Something went wrong, please try again later.";
        $scope.title = {
            plural: "Azure Resource Group",
            singular: "Azure Resource Groups"
        };
        $scope.bread = BreadCrumbService;
        var location_list = [];
        $scope.customers = [];

        var get_aws_template = function (name) {
            return ClientApi.create_modal.replace(":name", name);
        };

        $scope.azure_resource_group_modeldata = {
            "title": "Add Resource group",
            "page": "/static/rest/app/templates/v3/azure/create_account.html"
        };

        $scope.azure_attach_load_balancer = {
            "title": "Attach Load Balancer",
            "page": "/static/rest/app/templates/v3/azure/create_nic.html"
        };

        $scope.azure_create_virtual_machine = {
            "title": "Create Virtual Machine",
            "page": "/static/rest/app/templates/v3/azure/create_vm.html"
        };

        $scope.azure_create_nic_modeldata = {
            "title": "Create Network Interface",
            "page": "/static/rest/app/templates/v3/azure/create_nic.html"
        };

        $scope.azure_resource_group_delete_modal = {
            "title": "Delete Resource Group ",
            "alertMsg": "Are you Sure you want to delete?"
        };

        $scope.azure_resource_group_vm_delete_modal = {
            "title": "Delete Virtual Machine ",
            "alertMsg": "Are you Sure you want to delete?"
        };

        $scope.azure_vm_power_toggle_modal = {
            "title": "Azure Virtual Machine",
            "alertMsg": "Are you sure you want to continue with this action?"
        };

        $scope.get_azure_location_list = function(){
            $http({
                method: "GET",
                url: '/customer/azure_locations/'
            }).then(function (result) {
                var location_formatted_list = [];
                angular.forEach(result.data.results, function(v, k){
                    location_formatted_list.push({long: v.name, short: v.name});
                });
                $scope.location_list = location_formatted_list;
            }).catch(function (error) {});
        }();

        var load_dashboard = function load_dashboard() {
            $scope.loader = true;
            $scope.azure_resource_group = {};
            $scope.azure_create_vm_rows = '';
            $scope.azure_create_nic_rows = '';
            $scope.azure_atach_lb_rows = '';
            $http({
                method: "GET",
                url: '/customer/azure/' + account_id + '/resource_group/'
            }).then(function (result) {
                var tag_value = '';
                angular.forEach(result.data, function (v, k){
                    if(v.tags !== null){
                        angular.forEach(result.data[k].tags, function (value, key) {
                            if (tag_value.length > 1) {
                                tag_value = tag_value + " , " + key + " : " + value;
                            }else {
                                tag_value = tag_value + key + " : " + value;
                            }
                        });
                        result.data[k].tags.display = tag_value;
                    }
                });
                $scope.azure_resource_group.data = result.data;
                $scope.azure_resource_group.actions = [
                    { "name": "View Resources", "button": "view_resource" },
                    { "name": "Create Virtual Machine", "button": "create_vm" },
                    { "name": "View Virtual Machines", "button": "view_vm" },
                    { "name": "Create Nic", "button": "create_nic" },
                    { "name": "Delete", "button": "delete" }
                ];
                $scope.azure_resource_group_rows = [
                    DataFormattingService.generate_row(["text", "resource_grp_name", "Resource group Name", "required"]),
                    DataFormattingService.generate_row(["select", "location", "Location", $scope.location_list, "required"]),
                    DataFormattingService.generate_row(["text", "tag", "Tag"]),
                ];
                $scope.azure_create_vm_rows = [
                    DataFormattingService.generate_row(["text", "name", "VM Name", "required"]),
                    DataFormattingService.generate_row(["text", "username", "VM login User", "required"]),
                    DataFormattingService.generate_row(["password", "password", "Password", "required"]),
                    DataFormattingService.generate_row(["select", "location", "Location", $scope.location_list, "required"]),
                    DataFormattingService.generate_row(["select", "storage_account", "Storage Account", $scope.azure_storage_accounts, "required"]),
                    DataFormattingService.generate_row(["select", "availability_set", "Availability Set", $scope.availability_set, "required"]),
                    DataFormattingService.generate_row(["select", "os_type", "OS Type", $scope.os_types, "required"]),
                    DataFormattingService.generate_row(["select", "nic", "NIC", $scope.nic_list, "required"]),

                ];
                $scope.azure_create_nic_rows = [
                    DataFormattingService.generate_row(["text", "name", "Nic name", "required"]),
                    DataFormattingService.generate_row(["select", "vnet", "Virtual Network", $scope.vnet_list, "required"]),
                    DataFormattingService.generate_row(["select", "subnet", "subnet", $scope.subnet_list_options, "required"]),
                ];
                $scope.azure_atach_lb_rows = [
                    DataFormattingService.generate_row(["select", "loadbalancer", "Load Balancer", $scope.load_balancer_list, "required"]),
                    DataFormattingService.generate_row(["select", "backendpool", "Backend address Pool", $scope.back_end_pool, "required"]),
                ];
                $scope.loader = false;
            }).catch(function (error) {
                $scope.loader = false;
                AlertService2.addAlert({ msg: error.data.slice(0, 200), severity: 'error' });
                return error;
            });
        };

        $scope.$watch(function(){
            return $location.path();
        }, function(value){
            account_id = value.split('/').slice(0, -1).pop();
            if($stateParams.uuidc === account_id){
                load_dashboard();
            }else{
                return;
            }
        });

        $scope.obj = {};

        $scope.azure_resource_group_add = function (params) {
            var valid = ValidationService.validate_data(params, $scope.azure_resource_group_rows);
            if (!valid.is_validated) {
                $scope.addRGErrors = params;
                return valid;
            }
            delete params.is_validated;
            var url = ClientApi.azure_resource_group.replace(":account_id", account_id);
            params.account = account_id;
            params.account_id = account_id;
            params.location = params.location.short;
            params.name = params.resource_grp_name;
            console.log("azure params" + angular.toJson(params));
            $scope.loader = true;
            RestService.send_modal_data(params, url).then(function (result) {
                if (result.status == 201) {
                    AlertService2.addAlert(
                        { msg: "Deployment of new resource group started. Process will take few mins", severity: 'success' }
                    );
                    $scope.azure_resource_group = "";
                    load_dashboard();
                }
                else {
                    load_dashboard();
                    AlertService2.addAlert({ msg: result.statusText, severity: 'error' });
                }
                $scope.loader = false;
            });
            $scope.cancel();
        };

        $scope.add = function () {
            $scope.azure_resource_group_add(angular.copy($scope.obj));
        };

        $scope.cancel = function (method) {
            $scope.showModal = !$scope.showModal;
        };

        $scope.add_rsgroup__model = function(){
            $scope.method = 'Add';
            $scope.rows = $scope.azure_resource_group_rows;
            $scope.showModal = !$scope.showModal;
        };

        $scope.azure_resource_group_delete = function (params) {
            var url = '/customer/azure/' + params.account_id + '/resource_group/' + params.name +'/delete_resource_group';
            $scope.loader = true;
            $http.get(url).success(function (response) {
                if (response == "success") {
                    AlertService2.addAlert({ msg: "Account Deleted Successfully", severity: 'success' });
                    $scope.loader = false;
                    load_dashboard();
                }
                else {
                    $scope.loader = false;
                    load_dashboard();
                    AlertService2.addAlert({ msg: response.data, severity: 'error' });
                }
            });
            $scope.cancel_delete();
        };

        $scope.delete_rsgroup_model = function(rs_group){
            $scope.method = 'Delete';

            $scope.obj = {};
            $scope.obj.account_id = rs_group.account_id;
            $scope.obj.name = rs_group.name;
            $scope.obj.id = rs_group.id;

            $scope.deleteconfirm = angular.copy($scope.azure_resource_group_delete_modal);
            $scope.showDeleteConfirm = !$scope.showDeleteConfirm;
        };

        $scope.azure_add_nic = function (params) {
            var valid = ValidationService.validate_data(params, $scope.azure_create_nic_rows);
            if (!valid.is_validated) {
                $scope.addNicErrors = params;
                return valid;
            }

            var url = '/customer/azure/' + account_id + '/nic/';
            $scope.loader = true;
            delete params.is_validated;

            // NIC task Service
            $http({
                method: "POST",
                url: '/customer/azure/' + account_id + '/nic/',
                data: params,
            }).then(function (result) {
                if (result.data.hasOwnProperty('task_id')) {
                    TaskService.processTaskv3(result.data.task_id, function (result) {
                        $scope.loader = false;
                        if (result.result.success) {
                            AlertService2.success("Nic created Successfully");
                        }
                        else {
                            AlertService2.danger('Error ::' + result.result.error);
                        }
                    }, function (error) {
                        $scope.loader = false;
                    });
                }else {
                    $scope.loader = false;
                }

            }).catch(function (error) {
                $scope.loader = false;
            });
            $scope.cancel2();
        };

        $scope.load_vnet = function load_vnet(res_grp_name) {
            //there was some issue in clearing the array due to that used this.
            $scope.vnet_list.length = 0;
            $http({
                method: "GET",
                url: '/customer/azure/' + account_id + '/resource_group/' + res_grp_name + '/virtual_network'
            }).then(function (result) {
                angular.forEach(result.data, function (value, key) {
                    //TODO provsioning for all regions
                    $scope.vnet_list.push({ short: value.name, long: value.name, location: value.location });
                });
                if ($scope.vnet_list.length == 0) {
                    $scope.vnet_list.push({ short: '', long: "Virtual network not available in this resource group" });
                }
            });
        };

        $scope.create_nic_model = function(rs_group){
            $scope.method = 'Add';

            $scope.load_vnet(rs_group.name);

            $scope.obj = {};
            $scope.obj.resource_grp_name = angular.copy(rs_group.name);
            $scope.rows2 = $scope.azure_create_nic_rows;

            $scope.showModal2 = !$scope.showModal2;
        };

        $scope.load_resources = function load_resources(params) {
            $scope.vm_list = false;
            $scope.loader = true;
            $scope.azure_resource_content = "";
            $http({
                method: "GET",
                url: '/customer/azure/' + account_id + '/resource_group/' + params.name + '/resources/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                $scope.resource_list = true;
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            $scope.loader = false;
                            if (!/false,/.exec(result.result)) {
                                AlertService2.addAlert("Task Service");
                            } else {
                                AlertService2.addAlert({ msg: result.data.result.message[0], severity: 'error' });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'error' });
                        $scope.azure_resource_content = error;
                    });
                }else {
                    $scope.azure_resource_content = result.data;
                    $scope.loader = false;
                }

            }).catch(function (error) {
                $scope.loader = false;
                AlertService2.addAlert({ msg: error.message, severity: 'error' });
            });
        };

        $scope.view_resources = function(rs_group){
            $scope.method = 'view_resource';

            $scope.obj = {};
            $scope.obj.id = rs_group.id;
            $scope.obj.name = rs_group.name;
            $scope.load_resources(angular.copy($scope.obj));
        };

        $scope.hideresourcetable = function () {
            $scope.resource_list = false;
        };

        $scope.setLocationvalues = function(location){
            $scope.azure_storage_accounts.length = 0;
            $scope.availability_set.length = 0;
            $scope.nic_list.length = 0;

            for (var i=0; i<$scope.azure_storage_accounts_all.length; i++){
                if (location.short_name===$scope.azure_storage_accounts_all[i].location){
                    $scope.azure_storage_accounts.push($scope.azure_storage_accounts_all[i]);
                }
            }
            for (var i=0; i<$scope.availability_set_all.length; i++){
                if (location.short_name===$scope.availability_set_all[i].location){
                    $scope.availability_set.push($scope.availability_set_all[i]);
                }
            }
            for (var i=0; i<$scope.nic_list_all.length; i++){
                if (location.short_name===$scope.nic_list_all[i].location){
                    $scope.nic_list.push($scope.nic_list_all[i]);
                }
            }
        };

        $scope.loadsubnetlist = function(v_net){
            $scope.subnet_list_options.length = 0;
            $http({
                method: "GET",
                url: '/customer/azure/' + account_id + '/resource_group/' + $scope.obj.resource_grp_name + '/' + v_net.short + '/subnet'
            }).then(function (result) {
                angular.forEach(result.data, function (value, key) {
                    //TODO provsioning for all regions
                    // if (value.location==='centralus'){
                        $scope.subnet_list_options.push({ short: value.id, long: value.name });
                    // }
                });
                if ($scope.subnet_list_options.length == 0) {
                    $scope.subnet_list_options.push({ short: '', long: "Subnet not available in this resource group" });
                }
            });

        };

        $scope.azure_create_vm = function (params) {
            var valid = ValidationService.validate_data(params, $scope.azure_create_vm_rows);
            if (!valid.is_validated) {
                $scope.azure_vm_errors = params;
                return valid;
            }

            $scope.azure_vm_errors = params;
            if (!(/^([a-zA-Z0-9]+)$/.test(params.name) ) || params.name.length < 6) {
                $scope.azure_vm_errors['nameerr'] = true;
                $scope.azure_vm_errors['nameMsg'] = 'VM name should contain only numbers & character and at least 6 character in length';
            }
            if (params.username == 'admin' || params.username == 'root') {
                $scope.azure_vm_errors['usernameerr'] = true;
                $scope.azure_vm_errors['usernameMsg'] = 'VM username cannot be admin or root';
            }
            if (!(/^([a-zA-Z0-9]+)$/.test(params.username)) || params.username.length < 4) {
                $scope.azure_vm_errors['usernameerr'] = true;
                $scope.azure_vm_errors['usernameMsg'] = 'VM username should contain only numbers & character and at least 4 character in length';
            }
            if (!(  /^(?=.*[a-z])(?=.{8,})(?=.*[A-Z])(?=.*\d)(?=.*[_\W]).+$/.test(params.password)
                ) || params.password.length < 8) {
                $scope.azure_vm_errors['passworderr'] = true;
                $scope.azure_vm_errors['passwordMsg'] = 'Password should contain one number, one lowercase character, one uppercase character and one special character and at least 8 character in length';
            }
            if ($scope.azure_vm_errors['nameerr'] == true || $scope.azure_vm_errors['usernameerr'] == true || $scope.azure_vm_errors['passworderr'] == true) {
                return;
            }

            params.resource_group = params.resource_name;
            params.account = account_id;

            // TODO hardcoded for demo
            params.os_disk = 'vm_disk';

            params.location = params.location.short_name;
            params.os_type = params.os_type.short;
            params.nic = params.nic.short;
            params.storage_account = params.storage_account.short;
            params.availability_set = params.availability_set.short;
            var url = '/customer/azure/' + account_id + '/virtual_machines/';
            var paramdata = {};
            paramdata.name = params.resource_name;

            // $scope.loader = true;
            AlertService2.success('Deployment of new virtual machine started. Process will take few mins.');
            
            // Create VM task Service
            $http({
                method: "POST",
                url: url,
                data: params,
            }).then(function (result) {
                if (result.data.hasOwnProperty('task_id')) {
                    TaskService.processTaskv3(result.data.task_id, function (result) {
                        load_dashboard();
                        if (result.result.success) {
                            AlertService2.success(result.result.success);
                        }else {
                            AlertService2.danger("Error during deployment:  " + result.result.error);
                        }
                    }, function (error) {
                        console.log("create vm error", error);
                        $scope.loader = false;
                    });
                }else {
                    $scope.loader = false;
                }

            }).catch(function (error) {
                $scope.loader = false;
            });
            $scope.cancel1();
        };

        $scope.add1 = function () {
            $scope.azure_create_vm(angular.copy($scope.obj));
        };

        $scope.cancel1 = function (method) {
            $scope.showModal1 = !$scope.showModal1;
        };

        $scope.load_nic = function load_nic(res_grp_name) {
            $scope.load_storage_account(res_grp_name);
            $scope.load_availability_set(res_grp_name);
            $http({
                method: "GET",
                url: '/customer/azure/' + account_id + '/resource_group/' + res_grp_name + '/nic'
            }).then(function (result) {
                $scope.nic_list_all.length = 0;
                angular.forEach(result.data, function (value, key) {
                    //TODO provsioning for all regions
                    // value.virtual_machine == false means no vm assigned
                    if (value.virtual_machine == false) {
                        var nic = {};
                        nic["short"] = value.name;
                        nic["long"] = value.name;
                        nic['location'] = value.location;
                        $scope.nic_list_all.push(nic);
                    }
                });
                if ($scope.nic_list_all.length == 0) {
                    $scope.nic_list_all.push({ short: '', long: "NIC unavailable in selected combination" });
                }

            });
        };

        $scope.create_vm_model = function(rs_group){
            $scope.method = 'Add';
            $scope.load_nic(angular.copy(rs_group.name));

            $scope.obj = {};
            $scope.obj.resource_name = rs_group.name;

            $scope.rows1=$scope.azure_create_vm_rows;
            $scope.showModal1 = !$scope.showModal1;
        };


        $scope.load_virtualmachine = function load_virtualmachine(params) {
            $scope.resource_list = false;
            $scope.loader = true;
            $scope.azure_vm_content = "";
            $http({
                method: "GET",
                url: '/customer/azure/' + account_id + '/resource_group/' + params.name + '/virtual_machines/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                $scope.vm_list = true;
                if (result.data.hasOwnProperty('task_id')) {
                    TaskService.processTaskv3(result.data.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            $scope.loader = false;
                            if (result.result.error){
                                AlertService2.danger('Something went wrong, please try later.');
                            }
                            else {
                                $scope.azure_vm_content = result.result;
                                $scope.azure_vm_content.actions = [
                                    // { "name": "Attach loadbalancer", "button": "attach_lb" },
                                    { "name": "Delete", "button": "delete" }
                                ];
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'error' });
                        $scope.azure_vm_content = [];
                    });
                }else {
                    $scope.azure_vm_content = result.data;
                    var fetch_lb_details = [];
                    angular.forEach(result.data, function (value, key) {
                        if (value.availability_set != null) {
                            var nic = value.network_profile[0].id;
                            $http({
                                method: "GET",
                                url: '/customer/azure/' + account_id + '/resource_group/' + 'second_account' + '/' + nic + '/get_loadbalancer/'
                            }).then(function (result) {
                                angular.forEach($scope.azure_vm_content, function (value, key) {
                                    if ((value.network_profile[0].id == result.data[0].nic)) {
                                        if(angular.isDefined(result.data[0].load_balancer_id[0])){
                                            var lb_str = result.data[0].load_balancer_id[0].split('/');
                                            value['load_balancer'] = lb_str[lb_str.length - 3];
                                        }else{
                                            value['load_balancer'] = 'NA';
                                        }
                                    }
                                });
                            });
                        }
                    });

                    $scope.azure_vm_content.actions = [
                        // { "name": "Attach loadbalancer", "button": "attach_lb" },
                        { "name": "Delete", "button": "delete" }
                    ];
                    $scope.loader = false;
                }

            }).catch(function (error) {
                $scope.loader = false;
                AlertService2.addAlert({ msg: error.message, severity: 'error' });
                return error;
            });
        };

        $scope.view_vms = function(rs_group){
            $scope.method = 'view_vm';

            $scope.obj = {};
            $scope.obj.id = rs_group.id;
            $scope.obj.name = rs_group.name;

            $scope.load_virtualmachine(angular.copy($scope.obj));
        };

        $scope.hidevirtualmachinetable = function hidevirtualmachinetable() {
            $scope.vm_list = false;
        };

        $scope.back_end_pool = [];
        $scope.loadbackendpooladdress = function (data) {
            $scope.back_end_pool = [];
            angular.forEach(data.backend_pool, function (value, key) {
                if (value.provisioning_state == "Succeeded") {
                    $scope.back_end_pool.push({ short: value.id, long: value.name });
                }
            });
            if ($scope.back_end_pool.length == 0) {
                $scope.back_end_pool.push({ short: '', long: "Backend pool address not available" });
            }
        };

        $scope.load_balancer_list = [];
        $scope.fetch_load_balancer = function (data) {
            $http({
                method: "GET",
                url: '/customer/azure/' + account_id + '/resource_group/' + data.resource_group + '/loadbalancerfast'
            }).then(function (result) {
                $scope.load_balancer_list.length = 0;
                angular.forEach(result.data, function (value, key) {
                    if (value.provisioning_state == "Succeeded") {
                        $scope.load_balancer_list.push({
                            short: value.id, long: value.name, name: value.name, backend_pool: value.backend_address_pools,
                            vm_name: data.name, resource_group: data.resource_group
                        });
                    }
                });
                if ($scope.load_balancer_list.length == 0) {
                    $scope.load_balancer_list.push({ short: '', long: "Load Balancer not available in this resource group" });
                }
            });
        };

        $scope.attach_loadbalancer = function (data) {
            var valid = ValidationService.validate_data(data, $scope.azure_atach_lb_rows);
            if (!valid.is_validated) {
                return valid;
            }
            delete data.is_validated;

            var params = {};
            params.resource_group = data.resource_group;
            params.backend_add_pool_id = data.backendpool.short;
            params.backend_add_pool_name = data.backendpool.long;
            params.nic_name = data.network_profile[0].id;
            var reload_params = {};
            reload_params.name = data.resource_group;

            var url = ClientApi.azure_nic_attach_loadbalancer.replace(":account_id", account_id);
            AlertService2.success("Request submitted to attach Load Balancer");

            // Create attach load balancer task Service
            $http({
                method: "POST",
                url: url,
                data: params,
            }).then(function (result) {
                if (result.data.hasOwnProperty('task_id')) {
                    TaskService.processTaskv3(result.data.task_id, function (result) {
                        console.log("result LB", result);
                        $scope.loader = false;
                        if (result.state == 'success') {
                            AlertService2.success("Load Balancer attached succesfully");
                            $scope.vm_list = false;
                            $scope.load_virtualmachine(reload_params);
                        }
                        else {
                            AlertService2.addAlert({ msg: 'Error ::' + result.result, severity: 'error' });
                        }
                    }, function (error) {
                        $scope.loader = false;
                        if (status != 504) {
                            AlertService2.success(error);
                            $scope.vm_list = false;
                            $scope.load_virtualmachine(reload_params);
                        }
                    });
                }else {
                    $scope.loader = false;
                }

            }).catch(function (error) {
                $scope.loader = false;
            });

            // $http.post(url, params).success(function (response) {
            //     AlertService2.success("Load Balancer attached succesfully");
            //     $scope.vm_list = false;
            //     $scope.load_virtualmachine(reload_params);
                 
            // }).error(function (error, status) {
            //     if (status != 504) {
            //         AlertService2.success(error);
            //         $scope.vm_list = false;
            //         $scope.load_virtualmachine(reload_params);
            //     }
            // });
            $scope.cancel2();
        };

        $scope.attach_load_balancer_model = function(vm){
            $scope.method = 'Attach';
            $scope.fetch_load_balancer(angular.copy(vm));

            $scope.obj = angular.copy(vm);
            $scope.rows2 = $scope.azure_atach_lb_rows;

            $scope.showModal2 = !$scope.showModal2;

        };

        $scope.delete_virtual_machine = function (params) {
            var url = ClientApi.azure_virtual_machine_delete.replace(":account_id", account_id);
            var post_data = { "vm_name": params.name, 'resource_group': params.resource_group };
            AlertService2.success("Delete request for Virtual machine " + params.name + " is submitted.");
            $scope.loader = true;
            $http({
                method: "POST",
                url: url,
                data: post_data,
            }).then(function (result) {
                if (result.data.hasOwnProperty('task_id')) {
                    TaskService.processTaskv3(result.data.task_id, function (result) {
                        $scope.loader = false;
                        if (result.state == "SUCCESS") {
                            $scope.loader = false;
                            $scope.vm_list = false;
                            // $scope.load_resources({"name": params.resource_group});
                            AlertService2.success(result.result.success);
                        }
                        else {
                            AlertService2.danger({ msg: result, severity: 'error' });
                        }
                    }, function (error) {
                        $scope.loader = false;
                    });
                }else {
                    $scope.loader = false;
                }

            }).catch(function (error) {
                $scope.loader = false;
            });
            $scope.cancel_delete();
        };

        $scope.delete_vm_model = function(vm){
            $scope.method = 'delete';
            $scope.obj = angular.copy(vm);

            $scope.deleteconfirm = angular.copy($scope.azure_resource_group_vm_delete_modal);
            $scope.showDeleteConfirm = !$scope.showDeleteConfirm;
        };

        $scope.update_vm_state_model = function(vm){
            $scope.method = 'update';
            $scope.obj = angular.copy(vm);

            $scope.deleteconfirm = angular.copy($scope.azure_resource_group_vm_delete_modal);
            $scope.showDeleteConfirm = !$scope.showDeleteConfirm;
        };


        // common methods triggered from show model2

        // triggered for "adding nic to resource group" and "attaching LB to VM"
        $scope.add2 = function () {
            console.log('method : ', $scope.method);
            if($scope.method === 'Add'){
                $scope.azure_add_nic(angular.copy($scope.obj));
            }else if($scope.method === 'Attach'){
                $scope.attach_loadbalancer(angular.copy($scope.obj));
            }
            
        };

        // trigegred for closing all modals opened with showModel2.
        $scope.cancel2 = function (method) {
            $scope.showModal2 = !$scope.showModal2;
        };


        // common methods triggered from delete confirmation modal

        // triggered for deleting resource group and VM
        $scope.delete = function () {
            if($scope.method === 'Delete'){
                $scope.azure_resource_group_delete(angular.copy($scope.obj));
            }else if($scope.method === 'delete'){
                $scope.delete_virtual_machine(angular.copy($scope.obj));
            }
            else if(($scope.method === 'start') || ($scope.method === 'powerOff')){
                $scope.toggle_vm_power_state(angular.copy($scope.obj), $scope.method);
                $scope.showDeleteConfirm = !$scope.showDeleteConfirm;
            }
        };

        // Triggered for closing delete confirmation model for resource group and VM
        $scope.cancel_delete = function (method) {
            $scope.showDeleteConfirm = !$scope.showDeleteConfirm;
        };

        $scope.instance_power_toggle_model = function(vm_details, power_state){
            $scope.method = power_state;
            $scope.obj = angular.copy(vm_details);

            $scope.deleteconfirm = angular.copy($scope.azure_vm_power_toggle_modal);
            $scope.showDeleteConfirm = !$scope.showDeleteConfirm;
        };

        $scope.toggle_vm_power_state = function(vm_details, power_state){
            var post_data = { "vm_name": vm_details.name, 'resource_group': vm_details.resource_group, 'power_state' :  power_state};
            if (power_state=='powerOff'){
                var msg = "Request to power off " + vm_details.name + " is submitted.";
            }
            if (power_state=='start'){
                var msg = "Request to power on " + vm_details.name + " is submitted.";
            }
            AlertService2.success(msg);
            $http({
                method: "POST",
                url: '/customer/azure/' + account_id + '/virtual_machines/toggle_power_state/',
                data: post_data,
            }).then(function (result) {

                if (result.data.hasOwnProperty('task_id')) {
                    TaskService.processTaskv3(result.data.task_id, function (result) {
                        $scope.loader = false;
                        if (result.result.success) {
                            AlertService2.success(result.result.success);
                            for(var i = 0; i < $scope.azure_vm_content.length; i++){
                                if($scope.azure_vm_content[i].name == vm_details.name){
                                    if(result.result.success == 'VM Powered Off Successfully')
                                        $scope.azure_vm_content[i].power_state = 'VM stopped';
                                    else
                                        $scope.azure_vm_content[i].power_state = 'VM running';
                                }
                            }
                        }
                        else {
                            AlertService2.danger('Error ::' + result.result.error);
                        }
                    }, function (error) {
                        $scope.loader = false;
                    });
                }
                else{
                    $scope.loader = false;
                    console.log('result : ', angular.toJson(result));
                }

            }).catch(function (error) {
                $scope.loader = false;
                console.log('error : ', angular.toJson(error));
            });
        };  

















        
        
        //TODO fetch full list
        // var location_list = [
        //     { short: "centralus", long: "Central US (Iowa)" },
        //     { short: "middlefinger", long: "biao" },
        // ];
        //TODO fetch full list
        $scope.os_types = [
            { short: "linux", long: "UbuntuServer 16.04.0-LTS" },
            // { short: "windows", long: "Windows Server Essentials" },
        ];

        var nics = [];
        // var storage_accounts = [
        //     { short: "secondaccountdiag499", long: "Diag-499" },
        //     { short: "secondaccountdisks232", long: "Disks-232" }
        // ];
        $scope.vnet_list = [];
        $scope.location = null;
        $scope.availability_set_all = [];
        $scope.availability_set = [];
        $scope.azure_storage_accounts_all = [];
        $scope.azure_storage_accounts = [];
        $scope.nic_list_all = [];
        $scope.nic_list = [];

        $scope.display_error = function display_error(message) {
            AlertService2.addAlert({ msg: message, severity: 'error' });
        };

        $scope.subnet_list_options = [{ short: '', long: "" }];

        
        $scope.load_subnet = function load_subnet(params) {
            $scope.subnet_list_options.length = 0;
            $http({
                method: "GET",
                url: '/customer/azure/' + account_id + '/resource_group/' + params.resource_grp_name + '/' + params.vnet.short + '/subnet'
            }).then(function (result) {
                angular.forEach(result.data, function (value, key) {
                    //TODO provsioning for all regions
                    if (value.location==='centralus'){
                        $scope.subnet_list_options.push({ short: value.id, long: value.name });
                    }
                });
                if ($scope.subnet_list_options.length == 0) {
                    $scope.subnet_list_options.push({ short: '', long: "Subnet not available in this resource group" });
                }
            });

        };

        $scope.load_storage_account = function load_storage_account(res_grp_name) {
            $http({
                method: "GET",
                url: '/customer/azure/' + account_id + '/resource_group/' + res_grp_name + '/storage_account'
            }).then(function (result) {
                $scope.azure_storage_accounts_all.length = 0;
                angular.forEach(result.data, function (value, key) {
                    var a_set = {};
                    a_set["short"] = value.name;
                    a_set["long"] =  value.name + ' (' + value.kind + ')';
                    a_set["name"] = value.name;
                    a_set['location'] = value.primary_location;
                    $scope.azure_storage_accounts_all.push(a_set);
                });
                if ($scope.azure_storage_accounts_all.length == 0) {
                    $scope.azure_storage_accounts_all.push({ short: '', long: "No Storage account available in this resource group" });
                }
            });
        };

        $scope.load_availability_set = function load_availability_set(res_grp_name) {
            $http({
                method: "GET",
                url: '/customer/azure/' + account_id + '/resource_group/' + res_grp_name + '/availability_set'
            }).then(function (result) {
                $scope.availability_set_all.length = 0;
                angular.forEach(result.data, function (value, key) {
                    var a_set = {};
                    a_set["short"] = value.id;
                    a_set["long"] = value.name;
                    a_set['location'] = value.location;
                    $scope.availability_set_all.push(a_set);
                });
                if ($scope.availability_set_all.length == 0) {
                    $scope.availability_set_all.push({ short: '', long: "Availibilty set not available in this resource group" });
                }
            });
        };
        

        

        
        

        $scope.azure_resource_group_edit = function (params) {
            var valid = ValidationService.validate_data(params, $scope.azure_resource_group_rows);
            if (!valid.is_validated) {
                return valid;
            }
            delete params.is_validated;
            var url = ClientApi.azure_resource_group_edit.replace(":account_id", params.id);
            RestService.update_modal_data(params, url).then(function (result) {

                if (result.status == 200) {
                    AlertService2.addAlert({ msg: "Account updated Successfully", severity: 'success' });
                    $scope.azure_resource_group = "";
                    load_dashboard();
                }
                else {
                    load_dashboard();
                    AlertService2.addAlert({ msg: result.data[0], severity: 'error' });
                }
            });
            var response_obj = { "success": "Updated Successfuly" };
            return response_obj;
        };
    }
]);
