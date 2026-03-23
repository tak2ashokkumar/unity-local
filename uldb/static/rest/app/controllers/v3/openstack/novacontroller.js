var app = angular.module('uldb');
app.controller('NovaController', [
    '$scope',
    '$rootScope',
    '$http',
    '$q',
    '$location',
    'NovaService',
    'TableHeaders',
    'AdminApi',
    'RestService',
    'TaskService',
    'AlertService2',
    'DataFormattingService',
    'ValidationService',
    function(
        $scope,
        $rootScope,
        $http,
        $q,
        $location,
        NovaService,
        TableHeaders,
        AdminApi,
        RestService,
        TaskService,
        AlertService2,
        DataFormattingService,
        ValidationService) {
        $scope.title = {
            plural: "Nova Controllers",
            singular: "Nova Controller"
        };
        if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
        $scope.default_error_msg = "Something went wrong, please try again later.";
        $scope.alertService = AlertService2;

        var getOpenstackTempalte = function(name) {
            return AdminApi.create_modal.replace(":name", name);
        };
        var url = AdminApi.get_general_tenant_data;
        $scope.list_tenant_dropdown = {};
        $scope.nova_content_headers = TableHeaders.nova_table_headers;
        $scope.nova_actions = [{
            "name": "Show Inventory",
            "button": "show_nova_inventory"
        }];
        $scope.show_nova_inventory = function(row_object) {
            if (row_object.domain != undefined) {
                var url = AdminApi.validate_nova_controller.replace(':adapter_id', row_object.adapter_id);
                NovaService.get_nova_data(url).then(function(result) {
                    if (result.data.data.status == true) {
                        $location.path("/openstack_view/" + row_object.adapter_id);
                    } else {
                        AlertService2.addAlert({
                            msg: "Invalid Adapter",
                            severity: 'danger'
                        });
                    }
                });
            } else {
                AlertService2.addAlert({
                    msg: "Please select a Domain",
                    severity: 'danger'
                });
            }

        };

        var load_nova = function() {
            NovaService.get_nova_data(AdminApi.get_nova_controllers_data).then(function(result) {
                $scope.nova_content = result;
            });
        };

        load_nova();
        $scope.nova_modaldata = {
            "title": "Add Nova",
            "page": getOpenstackTempalte('create_nova')
        };

        $scope.list_tenant_dropdown = [{
            label: "default",
            name: "ca7c9b3ccf4c4ca1b89ed1626b787d89"
        }];
        $scope.nova_rows = [
            DataFormattingService.generate_row(["text", "adapter_name", "Name", "required"]),
            DataFormattingService.generate_row(["text", "ip", "Server Ip", "required"]),
            DataFormattingService.generate_row(["text", "ip2", "Server Ip", "required"]),
            DataFormattingService.generate_row(["text", "ip3", "Server Ip", "required"]),
            DataFormattingService.generate_row(["text", "ip4", "Server Ip", "required"]),
            DataFormattingService.generate_row(["text", "port", "Port"]),
            DataFormattingService.generate_row(["select", "loaction_id", "Location", ["A", "B"], "required"]),
            DataFormattingService.generate_row(["text", "user_name", "User Name", "required"]),
            DataFormattingService.generate_row(["password", "password", "Password", "required"]),
            DataFormattingService.generate_row(["text", "tenant_name", "Admin Project", "required"])
        ];
        $scope.nova_add = function(params) {

            if (($("#ip_field_1").val() === "") ||
                ($("#ip_field_2").val() === "") ||
                ($("#ip_field_3").val() === "") ||
                ($("#ip_field_4").val() === "")
            ) {
                params.ip = "";
                delete params.ip2;
                delete params.ip3;
                delete params.ip4;
                delete params.ip4;
            }
            var valid = ValidationService.validate_data(params, $scope.nova_rows);
            if (!valid.is_validated) {
                return valid;
            } else {
                params.ip = $("#ip_field_1").val() + "." +
                    $("#ip_field_2").val() + "." +
                    $("#ip_field_3").val() + "." +
                    $("#ip_field_4").val();
                delete params.ip2;
                delete params.ip3;
                delete params.ip4;
                delete params.ip4;
                delete params.confirmsecret;
                if (params.status) {
                    params.status = "ACTIVE";
                } else {
                    params.status = "INACTIVE";
                }

                var url = AdminApi.add_nova_controllers_data;
                RestService.send_modal_data(params, url).then(function(result) {
                    $scope.nova_content = "";
                    TaskService.processTaskv3(result.data.celery_task.task_id, function(celery_response) {
                        if (celery_response.state == "SUCCESS") {
                            RestService.process_response(celery_response, load_nova(), $scope);
                        } else {
                            load_nova();
                            AlertService2.addAlert({
                                msg: $scope.default_error_msg,
                                severity: 'danger'
                            });
                        }
                    }, function(error) {
                        load_nova();
                        AlertService2.danger(error.data.result.message[0]);
                    });
                });
            }
            var response_obj = {
                "success": "Added Successfuly"
            };
            return response_obj;
        };
    }
]);
