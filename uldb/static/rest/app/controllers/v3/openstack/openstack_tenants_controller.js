var app = angular.module('uldb');
app.controller('OpenstackTenantsController', [
    '$scope',
    '$rootScope',
    '$http',
    '$q',
    '$filter',
    '$routeParams',
    '$location',
    '$timeout',
    'CustomDataService',
    'OpenstackService',
    'TaskService',
    'AlertService2',
    'AdminApi',
    'DataFormattingService',
    'TableHeaders',
    'RestService',
    'ValidationService',
    'NovaService',
    function(
        $scope,
        $rootScope,
        $http,
        $q,
        $filter,
        $routeParams,
        $location,
        $timeout,
        CustomDataService,
        OpenstackService,
        TaskService,
        AlertService2,
        AdminApi,
        DataFormattingService,
        TableHeaders,
        RestService,
        ValidationService,
        NovaService) {


        $scope.adapter_id = $routeParams.adapter_id;
        $scope.alertService = AlertService2;

        var url = AdminApi.validate_nova_controller.replace(':adapter_id', $scope.adapter_id);
        NovaService.get_nova_data(url).then(function(result) {
            if (result.data.data.status === true) {
                $scope.tenant_id = $routeParams.tenant_id;
                $scope.flavor_id = $routeParams.flavor_id;
                $scope.hypervisor_id = $routeParams.hypervisor_id;
                $scope.usage_view = false;
                $scope.token_set_view = false;
                $scope.security_group_view = false;
                $scope.flavor_access_view = false;
                $scope.keypair_view = false;
                $scope.vms_list = false;
                $scope.images_list = false;


                //---------------Tenant Usage details page --------------------

                if ($location.path().indexOf("usage_details") > -1) {

                    $scope.dateValue = {
                        startDate: "",
                        endDate: ""
                    };

                    $scope.usage_view = true;
                    $scope.title = {
                        plural: "Tenant Usage Details",
                        singular: "Tenant Usage Detail"
                    };
                    if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
                    $scope.tenant_usage_headers = TableHeaders.tenat_usage_details;

                    //Datepicker Options & functions

                    $scope.beforeRender = function($view, $dates, $leftDate, $upDate, $rightDate) {
                        for (var i = 0; i < $dates.length; i++) {
                            if (new Date().getTime() < $dates[i].utcDateValue) {
                                $dates[i].selectable = false;
                            }
                        }
                    };

                    $scope.get_usage_details = function(startDate, endDate, details) {
                        var start_date = $filter('date')(startDate, "yyyy-MM-dd");
                        var end_date = $filter('date')(endDate, "yyyy-MM-dd");
                        if (end_date < start_date) {
                            AlertService2.danger("END DATE is less than START DATE");
                        } else {
                            var request_url = AdminApi.get_usage_info.replace(":adapter_id", $scope.adapter_id).replace(":tenant_id", $scope.tenant_id) + "?start=" + start_date + "&end=" + end_date;
                            OpenstackService.get_usage_details(request_url).then(function(result) {
                                TaskService.processTaskv3(result.data.celery_task.task_id, function(celery_response) {
                                    if (celery_response.state == "SUCCESS") {
                                        if (celery_response.result.hasOwnProperty("error")) {
                                            $scope.tenant_usage_details = DataFormattingService.formatBooleanTableData(result);
                                            AlertService2.danger(celery_response.result.message);
                                        } else {
                                            $scope.tenant_usage_details = DataFormattingService.formatBooleanTableData(result);
                                        }
                                    } else {
                                        AlertService2.danger(celery_response.result.message);
                                    }
                                }, function(error) {
                                    AlertService2.danger(error.data.result.message[0]);
                                });

                            }, function(error) {
                                AlertService2.danger(error.data.result.message[0]);
                            });
                        }
                    };
                }



                //---------------Tenant Security page --------------------

                if ($location.path().indexOf("security_groups") > -1) {
                    $scope.title = {
                        plural: "Tenant Security Groups",
                        singular: "Tenant Security Group"
                    };
                    if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;

                    $scope.security_group_view = true;
                    $scope.security_group_headers = TableHeaders.security_group_table_headers;

                    var load_security_groups = function() {
                        OpenstackService.get_host_security_group_data(
                            AdminApi.get_tenant_security_groups.replace(':adapter_id', $scope.adapter_id).replace(":tenant_id", $scope.tenant_id)
                        ).then(function(result) {
                            $scope.host_security_group_content = result;
                        });
                    };

                    load_security_groups();
                }

                //---------------Tenant Keypairs page --------------------

                if ($location.path().indexOf("list_keypair") > -1) {
                    $scope.title = {
                        plural: "Key Pair",
                        singular: "Key Pair"
                    };
                    if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;

                    var getOpenstackTempalte = function(name) {
                        return AdminApi.create_modal.replace(":name", name);
                    };

                    $scope.keypair_actions = [{
                        "name": "Remove",
                        "button": "remove_keypair"
                    }, {
                        "name": "Download Private Key",
                        "button": "download_ssh"
                    }];

                    $scope.keypair_modeldata = {
                        "title": "Create Key Pair",
                        "page": getOpenstackTempalte('load-dialog')
                    };

                    $scope.keypair_view = true;
                    $scope.keypair_headers = TableHeaders.keypairs_table_headers;
                    $scope.keypair_rows = [
                        DataFormattingService.create_fields_for_dialog(["text", "keypair_name", "Name", "required"]),
                    ];


                    var load_keypairs = function() {
                        OpenstackService.get_keypair_data(
                            AdminApi.get_tenant_keypairs.replace(':adapter_id', $scope.adapter_id).replace(':tenant_id', $scope.tenant_id)
                        ).then(function(result) {
                            $scope.os_keypairs = result;
                        });
                    };
                    load_keypairs();

                    $scope.create_keypair = function(params) {
                        params.tenant_id = $scope.tenant_id;
                        var valid = ValidationService.validate_data(params, $scope.keypair_rows);
                        if (!valid.is_validated) {
                            return valid;
                        } else {
                            var url = AdminApi.add_keypair.replace(':adapter_id', $scope.adapter_id).replace(':tenant_id', $scope.tenant_id);
                            $scope.os_keypairs = "";
                            RestService.send_modal_data(params, url).then(function(result) {
                                TaskService.processTaskv3(result.data.celery_task.task_id, function(celery_response) {
                                    RestService.process_response(celery_response, load_keypairs(), $scope);
                                }, function(error) {
                                    load_keypairs();
                                    AlertService2.danger(error.data.result.message[0]);
                                });
                            });
                            var response_obj = {
                                "success": "Added Successfuly"
                            };
                            return response_obj;
                        }
                    };

                    $scope.delete_info = function(row_object) {
                        if (row_object.table_name === "keypairs") {
                            $scope.os_keypairs = "";
                            var request_url = AdminApi.get_tenant_keypairs.replace(":adapter_id", $scope.adapter_id).replace(":tenant_id", $scope.tenant_id) + row_object.name;
                            OpenstackService.delete_keypair(request_url).then(function(result) {
                                if (result.data.hasOwnProperty("celery_task")) {
                                    TaskService.processTaskv3(result.data.celery_task.task_id, function(celery_response) {
                                        RestService.process_response(celery_response, load_keypairs(), $scope);
                                    }, function(error) {
                                        load_keypairs();
                                        AlertService2.danger(error.data.result.message[0]);
                                    });
                                }
                            });
                        }
                    };

                    $scope.download_sshfile = function(row_object) {
                        var textToWrite = row_object.public_key;
                        var textFileAsBlob = new Blob([textToWrite]);
                        var fileNameToSaveAs = row_object.name + '.pem';
                        var downloadLink = document.createElement("a");
                        downloadLink.download = fileNameToSaveAs;
                        if (window.webkitURL != null) {
                            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
                        } else {
                            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                            downloadLink.onclick = $scope.destroyClickedElement;
                            downloadLink.style.display = "none";
                            document.body.appendChild(downloadLink);
                        }
                        downloadLink.click();
                    };
                    $scope.destroyClickedElement = function(event) {
                        document.body.removeChild(event.target);
                    };
                }

                //---------------Tenant Flavors page --------------------

                if ($location.path().indexOf("list_flavor") > -1) {
                    $scope.title = {
                        plural: "Associated Flavor(s)",
                        singular: "Flavors"
                    };
                    if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;

                    $scope.flavor_view = true;
                    $scope.tenant_flavor_headers = TableHeaders.tenant_flavor_table_headers;

                    var load_tenant_flavors = function() {
                        OpenstackService.get_flavor_data(
                            AdminApi.get_tenant_flavors.replace(':adapter_id', $scope.adapter_id).replace(':tenant_id', $scope.tenant_id)
                        ).then(function(result) {
                            $scope.flavor_content = result;
                        });
                    };
                    load_tenant_flavors();
                }

                if ($location.path().indexOf("flavoraccess") > -1) {
                    $scope.title = {
                        plural: "Flavor access information",
                        singular: "Flavor access information"
                    };
                    if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
                    $scope.flavor_access_view = true;
                    $scope.access_headers = TableHeaders.flavor_access_headers;
                    var load_flavor_access_information = function() {
                        var request_url = AdminApi.get_flavor_access_info.replace(':adapter_id', $scope.adapter_id).replace(':flavor_id', $scope.flavor_id);
                        OpenstackService.get_flavor_access_data(request_url).then(function(result) {
                            $scope.flavor_access_content = DataFormattingService.formatBooleanTableData(result);
                        });
                    };
                    load_flavor_access_information();

                }

                //---------------Tenant Servers page --------------------

                if ($location.path().indexOf("list_vms") > -1) {
                    $scope.title = {
                        plural: "VM(s) List",
                        singular: "VM(s) List"
                    };
                    if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
                    $scope.vms_list = true;
                    $scope.vms_list_headers = TableHeaders.servers_table_headers;
                    var load_servers = function() {
                        OpenstackService.get_vm_tenant_data(
                            AdminApi.get_vms_info.replace(':adapter_id', $scope.adapter_id).replace(':hypervisor_id', $scope.hypervisor_id)
                        ).then(function(result) {
                            $scope.vm_tenant_content = DataFormattingService.formatBooleanTableData(result);
                        });
                    };
                    load_servers();
                }


                //---------------Tenant Images page --------------------

                if ($location.path().indexOf("list_images") > -1) {
                    $scope.title = {
                        plural: "Images",
                        singular: "Image"
                    };
                    if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
                    $scope.images_list = true;
                    $scope.imagelist_headers = TableHeaders.image_list_table_headers;
                    var load_images = function() {
                        OpenstackService.get_image_list_data(
                            AdminApi.get_tenant_images.replace(':adapter_id', $scope.adapter_id).replace(':tenant_id', $scope.tenant_id)
                        ).then(function(result) {
                            $scope.tenant_images_content = DataFormattingService.formatBooleanTableData(result);
                        });
                    };
                    load_images();
                }

            } else {
                AlertService2.danger("Invalid Access");
                return $location.path("/nova");
            }
        });
    }
]);
