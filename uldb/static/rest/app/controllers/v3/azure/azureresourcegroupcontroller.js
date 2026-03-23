var app = angular.module('uldb');
app.controller('AzureResourceGroupController', [
    '$scope',
    '$routeParams',
    '$rootScope',
    '$q',
    '$window',
    '$location',
    '$filter',
    '$timeout',
    'BreadCrumbService',
    'CustomDataService',
    'AzureService',
    'TaskService',
    'AdminApi',
    'AbstractControllerFactoryV3',
    'TableHeaders',
    'DataFormattingService',
    'RestService',
    'AlertService2',
    'ValidationService',
    'OrganizationFast',
    'SearchService',
    '$http',
    function ($scope,
              $routeParams,
              $rootScope,
              $q,
              $window,
              $location,
              $filter,
              $timeout,
              BreadCrumbService,
              CustomDataService,
              AzureService,
              TaskService,
              AdminApi,
              AbstractControllerFactoryV3,
              TableHeaders,
              DataFormattingService,
              RestService,
              AlertService2,
              ValidationService,
              OrganizationFast,
              SearchService,
              $http) {

        var account_id = $routeParams["account_id"];

        $scope.alertService = AlertService2;
        $scope.resource_list = false;
        $scope.vm_list = false;


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
        OrganizationFast.query().$promise.then(function (success) {
            angular.forEach(success.results, function (value, key) {
                $scope.customers.push({ short: value.id, long: value.name });

            });
        }).catch(function (error) {
            console.log(error);
        });

        $scope.hideresourcetable = function hideresourcetable() {
            $scope.resource_list = false;
        };

        $scope.hidevirtualmachinetable = function hidevirtualmachinetable() {
            $scope.vm_list = false;
        };

        $scope.load_resources = function load_resources(params) {
            // console.log("Reource => "+angular.toJson(params));
            $scope.resource_list = true;
            $scope.vm_list = false;
            $scope.azure_resource_content = "";

            // var resource_list = AzureService.get_resource_data();
            $http({
                method: "GET",
                url: '/rest/v3/azure/' + account_id + '/resource_group/' + params.name + '/resources/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                // $scope.create_aws_instance_dropdowns = result;
                                $scope.azure_resource_content = result;

                            } else {
                                AlertService2.addAlert({ msg: result.data.result.message[0], severity: 'danger' });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                        $scope.azure_resource_content = error;
                    });
                }
                else {

                    // $scope.azure_resource_content = result.data;
                    $scope.azure_resource_content = result.data;
                }

            }).catch(function (error) {
                return error;
            });
        };

        $scope.load_virtualmachine = function load_virtualmachine(params) {

            $scope.vm_list = true;
            $scope.resource_list = false;
            $scope.azure_vm_content = "";

            // var resource_list = AzureService.get_resource_data();
            $http({
                method: "GET",
                url: '/rest/v3/azure/' + account_id + '/resource_group/' + params.name + '/virtual_machines/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                // $scope.create_aws_instance_dropdowns = result;
                                $scope.azure_vm_content = result;

                            } else {
                                AlertService2.addAlert({ msg: result.data.result.message[0], severity: 'danger' });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                        $scope.azure_vm_content = error;
                    });
                }
                else {

                    // $scope.azure_resource_group = result.data;
                    $scope.azure_vm_content = result.data;
                }

            }).catch(function (error) {
                return error;
            });


        };

        var location_list = [
            { short: "centralus", long: "Central US (Iowa)" },
            { short: "westus", long: "West US (California)" },
        ];


        var os_types = [
            { short: "linux", long: "Linux OS" },
            { short: "windows", long: "Windows OS" },
        ];

        var nics = [
            // {short:"azure-sample-nic",long:"azure-sample-nic"},
            { short: "nic_vm_4", long: "nic_vm_4" },
            { short: "nic_vm_5", long: "nic_vm_5" }
        ];

        var storage_accounts = [
            { short: "secondaccountdiag499", long: "secondaccountdiag499" },
            { short: "secondaccountdisks232", long: "secondaccountdisks232" }
        ];

        var load_dashboard = function load_dashboard() {

            $scope.$on('$destroy', function () {
                $scope.bread.pushIfTop({ name: "Azure ", url: '#/azure/resource_group' }, $scope);
            });

            $scope.azure_resource_group = '';
            $scope.azure_create_vm_rows = '';
            // $scope.azure_resource_group = AzureService.get_resource_group_data();
            $http({
                method: "GET",
                url: '/rest/v3/azure/' + account_id + '/resource_group/'
            }).then(function (result) {
                var obj = {
                    data: null
                };


                var tag = result.data[0].tags;

                var tag_value = '';

                angular.forEach(tag, function (value, key) {
                    if (tag_value.length > 1) {
                        tag_value = tag_value + " , " + key + " : " + value;
                    }
                    else {
                        tag_value = tag_value + key + " : " + value;
                    }
                });

                result.data[0].tags.display = tag_value;


                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                // $scope.create_aws_instance_dropdowns = result;

                                $scope.azure_resource_group = result;

                            } else {
                                AlertService2.addAlert({ msg: result.data.result.message[0], severity: 'danger' });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                        $scope.azure_resource_group = error;
                    });
                }
                else {
                    // console.log("Else block==>"+angular.toJson(result.data));
                    $scope.azure_resource_group = result.data;
                    $scope.azure_resource_group.actions = [
                        { "name": "View Resources", "button": "view_resource" },
                        { "name": "Create Virtual Machine", "button": "create_vm" },
                        { "name": "View Virtual Machines", "button": "view_vm" },
                        // {"name": "Update Tags", "button": "update"},
                        { "name": "Delete", "button": "delete" }
                    ];

                    $scope.azure_resource_group_rows = [
                        DataFormattingService.generate_row(["text", "name", "Resource group Name", "required"]),
                        DataFormattingService.generate_row(["select", "customer", "Customer", $scope.customers, "required"]),
                        DataFormattingService.generate_row(["text", "location", "Location", "required"]),
                        DataFormattingService.generate_row(["text", "tag", "Tag", "required"]),
                    ];


                    $scope.azure_create_vm_rows = [
                        DataFormattingService.generate_row(["text", "name", "Virtual Machine Name", "required"]),
                        DataFormattingService.generate_row(["text", "username", "UserName", "required"]),
                        DataFormattingService.generate_row(["password", "password", "Password", "required"]),
                        DataFormattingService.generate_row(["select", "location", "Location", location_list, "required"]),
                        DataFormattingService.generate_row(["text", "os_disk", "OS Disk Name", "required"]),
                        DataFormattingService.generate_row(["select", "storage_account", "Storage Account", storage_accounts, "required"]),
                        DataFormattingService.generate_row(["select", "os_type", "OS Type", os_types, "required"]),
                        DataFormattingService.generate_row(["select", "nic", "NIC", nics, "required"]),

                    ];
                }

            }).catch(function (error) {
                return error;
            });

        };


        load_dashboard();


        $scope.azure_resource_group_add = function (params) {


            var valid = ValidationService.validate_data(params, $scope.azure_resource_group_rows);

            if (!valid.is_validated) {

                return valid;
            }
            delete params.is_validated;

            var url = AdminApi.azure_resource_group;

            RestService.send_modal_data(params, url).then(function (result) {


                if (result.status == 201) {
                    AlertService2.addAlert({
                        msg: "Deployment of VM started.Please wait for aprox 30 mins for VM to be up.",
                        severity: 'success'
                    });
                    $scope.azure_resource_group = "";
                    load_dashboard();
                }
                else {
                    load_dashboard();
                    AlertService2.addAlert({ msg: result.statusText, severity: 'danger' });
                }
            });
            var response_obj = { "success": "Added Successfuly" };
            return response_obj;
        };

        $scope.azure_create_vm = function (params) {


            var valid = ValidationService.validate_data(params, $scope.azure_create_virtual_machine);

            if (!valid.is_validated) {

                return valid;
            }
            delete params.is_validated;

            console.log("resource group : " + angular.toJson(params));

            params.resource_group = params.resource_name;
            params.account = account_id;

            params.location = params.location.short;
            params.os_type = params.os_type.short;
            params.nic = params.nic.short;
            params.storage_account = params.storage_account.short;

            // var url = AdminApi.azure_create_virtual_machine;
            var url = '/rest/v3/azure/' + account_id + '/virtual_machines/';

            // RestService.send_modal_data(params,url).then(function (result) {


            //     if (result.status == 201){
            //         AlertService2.addAlert({msg: "Account Added Successfully", severity: 'success'});
            //         $scope.azure_resource_group="";
            //         load_dashboard();
            //     }
            //     else{
            //         load_dashboard();
            //         AlertService2.addAlert({msg: result.statusText, severity: 'danger'});
            //     }
            // });
            var response_obj = { "success": "Added Successfuly" };
            return response_obj;
        };


        var get_aws_template = function (name) {
            return AdminApi.create_modal.replace(":name", name);
        };


        $scope.azure_resource_group_modeldata = {
            "title": "Add Azure Account",
            "page": "/static/rest/app/templates/v3/azure/create_account.html"
        };

        $scope.azure_create_virtual_machine = {
            "title": "Craete Virtual Machine",
            "page": "/static/rest/app/templates/v3/azure/create_vm.html"
        };

        $scope.azure_delete_modal = {
            "title": "Delete Resource Group ",
            "alertMsg": "Are you Sure you want to delete?"
        };


        $scope.azure_resource_group_edit = function (params) {
            var valid = ValidationService.validate_data(params, $scope.azure_resource_group_rows);
            if (!valid.is_validated) {
                return valid;
            }
            delete params.is_validated;

            var url = AdminApi.azure_resource_group_edit.replace(":account_id", params.id);

            RestService.update_modal_data(params, url).then(function (result) {

                if (result.status == 200) {

                    AlertService2.addAlert({ msg: "Account updated Successfully", severity: 'success' });
                    $scope.azure_resource_group = "";
                    load_dashboard();

                }
                else {
                    load_dashboard();
                    AlertService2.addAlert({ msg: result.data[0], severity: 'danger' });
                }
            });
            var response_obj = { "success": "Updated Successfuly" };
            return response_obj;
        };

        $scope.azure_delete = function (params) {

            var url = AdminApi.azure_resource_group_delete.replace(":account_id", params.id);

            RestService.delete_data(url).then(function (result) {


                if (result.data == "Deleted Successfully") {

                    AlertService2.addAlert({ msg: "Account Deleted Successfully", severity: 'success' });
                    $scope.mschedules_content = "";
                    load_dashboard();

                }
                else {

                    load_dashboard();
                    AlertService2.addAlert({ msg: result.data[0], severity: 'danger' });
                }
            });
            var response_obj = { "success": "Updated Successfuly" };
            return response_obj;
        };


    }
]);
