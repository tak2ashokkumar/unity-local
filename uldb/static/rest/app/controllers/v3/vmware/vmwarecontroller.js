var app = angular.module('uldb');
app.controller('vmwareController', [
    '$scope',
    '$rootScope',
    '$q',
    '$filter',
    '$location',
    '$http',
    'VmwareService',
    'CustomDataService',
    'AdminApi',
    'DataFormattingService',
    'TaskService',
    'TableHeaders',
    'RestService',
    'AlertService2',
    'ValidationService',
    'TaskService2',
    function ($scope,
              $rootScope,
              $q,
              $filter,
              $location,
              $http,
              VmwareService,
              CustomDataService,
              AdminApi,
              DataFormattingService,
              TaskService,
              TableHeaders,
              RestService,
              AlertService2,
              ValidationService,
              TaskService2) {

        var list_location = ["San Francisco", "Las Vegas", "Los Angeles", "Ashburn", "Toronto", "Vancouver"];
        $scope.alertService = AlertService2;
        $scope.title = {
            plural: "VMware",
            singular: "VMware"
        };
        if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
        $scope.vmware_vcenter_switches = function (args) {
            if (args.switche == "navigate_to_vmware") {
                var vcenter_id = args.id;
                var vcenter_name = args.name;
                $location.path('/vmware/' + vcenter_id + '/' + vcenter_name);
            }
        };
        $scope.vmware_vcenter = {};
        $scope.vcenter_headers = TableHeaders.vm_vcenter_headers;
        load_vmware_vcenter();

        function load_vmware_vcenter() {
            var url = AdminApi.vm_get_vcenter;
            VmwareService.get_vm_vcenters_data(url).then(function (result) {
                $scope.vmware_vcenter = result;
            });
        }

        $scope.vmware_vcenter_add = function (params) {
            if (($("#ip_field_1").val() == "") || ($("#ip_field_2").val() == "") || ($("#ip_field_3").val() == "") || ($("#ip_field_4").val() == "")) {
                params.server_ip = "";
            }
            else {
                params.server_ip = $("#ip_field_1").val() + "." + $("#ip_field_2").val() + "." + $("#ip_field_3").val() + "." + $("#ip_field_4").val();
            }
            $scope.obj = params;
            var valid = ValidationService.validate_data(params, $scope.vmware_vcenter_rows);
            if (!valid.is_validated) {
                params.server_ip = $("#ip_field_1").val();
                return valid;
            }
            else {
                delete params.ip2;
                delete params.ip3;
                delete params.ip4;
                params.location = list_location.indexOf(params.location) + 1;
                $scope.vmware_vcenter = "";
                var url = AdminApi.vm_add_vcenter;
                RestService.send_modal_data(params, url).then(function (result) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                        if (celery_response.state == "SUCCESS") {
                            load_vmware_vcenter();
                            AlertService2.addAlert({ msg: celery_response.result.message, severity: 'success' });
                        }
                        else {
                            load_vmware_vcenter();
                            AlertService2.addAlert({ msg: celery_response.result.message, severity: 'danger' });
                        }
                    }, function (error) {
                        load_vmware_vcenter();
                        AlertService2.addAlert({ msg: error.data.result.message, severity: 'danger' });
                    });
                });
                var response_obj = { "success": "Added Successfuly" };
                return response_obj;
            }
        };
        $scope.update_vcenter = function (params) {
            if (($("#ip_field_10").val() == "") || ($("#ip_field_20").val() == "") || ($("#ip_field_30").val() == "") || ($("#ip_field_40").val() == "")) {
                params.server_ip = "";
            }
            else {
                params.server_ip = $("#ip_field_10").val() + "." + $("#ip_field_20").val() + "." + $("#ip_field_30").val() + "." + $("#ip_field_40").val();
            }
            $scope.obj = params;
            var valid = ValidationService.validate_data(params, $scope.update_venter_rows);
            if (!valid.is_validated) {
                params.server_ip = $("#ip_field_10").val();
                return valid;
            }
            else {
                delete params.ip2;
                delete params.ip3;
                delete params.ip4;
                params.location = list_location.indexOf(params.location) + 1;
                $scope.vmware_vcenter = "";
                var url = AdminApi.vm_update_vcenter.replace(":vcenter_id", params.id);
                RestService.update_modal_data(params, url).then(function (result) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                        if (celery_response.state == "SUCCESS") {
                            load_vmware_vcenter();
                            AlertService2.addAlert({ msg: celery_response.result.message, severity: 'success' });
                        }
                        else {
                            load_vmware_vcenter();
                            AlertService2.addAlert({ msg: celery_response.result.message, severity: 'danger' });
                        }
                    }, function (error) {
                        load_vmware_vcenter();
                        AlertService2.addAlert({ msg: error.data.result.message, severity: 'danger' });
                    });
                });
                var response_obj = { "success": "Added Successfuly" };
                return response_obj;
            }
        };
        $scope.vmware_vcenter_actions = [
            { "name": "Edit Info", "button": "edit_vcenter" },
            { "name": "Show Inventory", "button": "navigate_to_vmware" }
        ];
        $scope.vmware_vcenter_modeldata = {
            "title": "Create vCenter",
            "page": AdminApi.create_vmware_modal.replace(":name", 'create')
        };
        $scope.update_vcenter_modeldata = {
            "title": "Update vCenter",
            "page": AdminApi.create_vmware_modal.replace(":name", 'update_vcenter')
        };


        $scope.vmware_vcenter_rows = [
            DataFormattingService.generate_row(["text", "vcenter_name", "Name", "required", "128"]),
            DataFormattingService.generate_row(["text", "server_ip", "Server IP", "required"]),
            DataFormattingService.generate_row(["text", "port", "Port", "required", "65536"]),
            DataFormattingService.generate_row(["select", "location", "Location", list_location, "required"]),
            DataFormattingService.generate_row(["text", "username", "Username", "required", "32"]),
            DataFormattingService.generate_row(["password", "password", "Password", "required", "32"])
        ];
        $scope.update_venter_rows = [
            DataFormattingService.generate_row(["text", "vcenter_name", "Name", "required", "128"]),
            DataFormattingService.generate_row(["text", "server_ip", "Server IP", "required"]),
            DataFormattingService.generate_row(["text", "port", "Port", "", "65536"]),
            DataFormattingService.generate_row(["select", "location", "Location", list_location]),
            DataFormattingService.generate_row(["text", "username", "Username", "", "32"]),
            DataFormattingService.generate_row(["password", "password", "Password", "", "32"]),
            DataFormattingService.generate_row(["hidden", "id", "Id"])
        ];

        // fill out missing vms
        $scope.missing_vms = {};
        $http.post('/example/').then(function (response) {
            console.log(response);
            TaskService2.processTask(response.data.task_id).then(function (result) {
                $scope.missing_vms = result;
            }).catch(function (error) {
                $scope.missing_vms = error;
            });
        });
    }
]);
