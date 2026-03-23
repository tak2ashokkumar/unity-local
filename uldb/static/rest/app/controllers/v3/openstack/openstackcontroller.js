var app = angular.module('uldb');
app.controller('OpenstackController', [
    '$scope',
    '$rootScope',
    '$http',
    '$q',
    '$filter',
    '$routeParams',
    '$location',
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
    'OpenstackAdapterAuth',
    function ($scope,
              $rootScope,
              $http,
              $q,
              $filter,
              $routeParams,
              $location,
              CustomDataService,
              OpenstackService,
              TaskService,
              AlertService2,
              AdminApi,
              DataFormattingService,
              TableHeaders,
              RestService,
              ValidationService,
              NovaService,
              OpenstackAdapterAuth) {

        $scope.adapter_id = $routeParams.adapter_id;
        OpenstackAdapterAuth.setAdapter($scope.adapter_id);
        $scope.alertService = AlertService2;
        var url = AdminApi.validate_nova_controller.replace(':adapter_id', $scope.adapter_id);
        NovaService.get_nova_data(url).then(function (result) {
            if (result.data.data.status === true) {
                $scope.flavor_content = {};
                $scope.os_keypairs = {};
                $scope.vm_tenant_content = {};
                $scope.image_list_content = {};
                $scope.obj = {};
                $scope.create_volume_dropdowns = {};
                $scope.create_tenant_dropdown = {};
                var flavors_info = [];
                var images_info = [];
                var projects_info = [];
                $scope.title = {
                    plural: "Openstack",
                    singular: "Openstack"
                };
                if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
                $scope.hosts_tenant_headers = TableHeaders.hosts_tenant_table_headers;
                $scope.service_catalog_headers = TableHeaders.service_catalog_table_headers;
                $scope.regions_headers = TableHeaders.regions_table_headers;
                $scope.hypervoiser_headers = TableHeaders.hy_table_headers;
                $scope.subnet_headers = TableHeaders.subnet_table_headers;
                $scope.tenant_table_headers = TableHeaders.tenant_table_headers_new;
                $scope.imagelist_headers = TableHeaders.image_list_table_headers;
                $scope.flavor_headers = TableHeaders.flavor_table_headers;
                $scope.availability_zone_headers = TableHeaders.availability_zone_headers;
                $scope.general_tenant = TableHeaders.general_tenant_table_headers;


                var getOpenstackTempalte = function (name) {
                    return AdminApi.create_modal.replace(":name", name);
                };

                var load_servers = function () {
                    OpenstackService.get_vm_tenant_data(
                        AdminApi.get_vm_tenant_data.replace(':adapter_id', $scope.adapter_id)
                    ).then(function (result) {
                        $scope.vm_tenant_content = result;
                    });
                };

                var load_flavors = function () {
                    OpenstackService.get_flavor_data(
                        AdminApi.get_flavor_data.replace(':adapter_id', $scope.adapter_id)
                    ).then(function (result) {
                        $scope.flavor_content = DataFormattingService.formatBooleanTableData(result);
                        $scope.flavor_content.data.data = $filter('orderBy')($scope.flavor_content.data.data, 'memory_mb');
                    });
                };

                var load_images = function () {
                    OpenstackService.get_image_list_data(
                        AdminApi.get_tenant_images_data.replace(':adapter_id', $scope.adapter_id)
                    ).then(function (result) {
                        $scope.tenant_images_content = DataFormattingService.formatBooleanTableData(result);
                        $scope.create_volume_dropdowns.images = $scope.tenant_images_content;
                    });
                };

                var load_volumes = function () {
                    OpenstackService.get_volumes_data(
                        AdminApi.get_tenant_volumes_data.replace(':adapter_id', $scope.adapter_id)
                    ).then(function (result) {
                        $scope.tenant_volumes_content = DataFormattingService.formatBooleanTableData(result);
                    });
                };

                var load_os_hosts = function () {
                    OpenstackService.get_os_hosts_tenant_data(
                        AdminApi.get_os_host_data.replace(':adapter_id', $scope.adapter_id)
                    ).then(function (result) {
                        $scope.os_hosts_tenant_content = result;
                    });
                };


                var load_regions = function () {
                    OpenstackService.get_regions_data(
                        AdminApi.get_regions_data.replace(':adapter_id', $scope.adapter_id)
                    ).then(function (result) {
                        $scope.regions_content = result;
                        $scope.regions_content.data.data.push({ 'adapter_id': $scope.adapter_id });
                    });
                };

                var load_hypervisors = function () {
                    OpenstackService.get_hypervisor_data(
                        AdminApi.get_hypervisor_data.replace(':adapter_id', $scope.adapter_id)
                    ).then(function (result) {
                        $scope.hy_content = result;
                    });
                };

                var load_zones = function () {
                    OpenstackService.get_availability_zone_data(
                        AdminApi.get_availability_zone_data.replace(':adapter_id', $scope.adapter_id)
                    ).then(function (result) {
                        $scope.availability_zone_content = DataFormattingService.formatBooleanTableData(result);
                        $scope.create_volume_dropdowns.availability_zones = $scope.availability_zone_content;
                    });
                };

                var load_instances = function () {
                    OpenstackService.get_instances_data(
                        AdminApi.get_vm_tenant_data.replace(':adapter_id', $scope.adapter_id)
                    ).then(function (result) {
                        $scope.instances_content = DataFormattingService.formatBooleanTableData(result);
                    });
                };

                var load_subnets = function () {
                    OpenstackService.get_subnet_data(
                        AdminApi.get_subnet_data.replace(':adapter_id', $scope.adapter_id)
                    ).then(function (result) {
                        $scope.subnet_content = DataFormattingService.formatBooleanTableData(result);
                    });
                };

                var load_imagelists = function () {
                    OpenstackService.get_image_list_data(
                        AdminApi.get_tenant_images_data.replace(':adapter_id', $scope.adapter_id)
                    ).then(function (result) {
                        $scope.image_list_content = DataFormattingService.formatBooleanTableData(result);
                    });
                };

                var load_tenants = function () {
                    OpenstackService.get_tenants_data(
                        AdminApi.get_general_tenant_data.replace(':adapter_id', $scope.adapter_id)
                    ).then(function (result) {
                        $scope.tenant_content = DataFormattingService.formatBooleanTableData(result);
                    });
                };

                load_tenants();
                load_servers();
                load_flavors();
                load_images();
                //load_volumes();
                load_os_hosts();
                load_regions();
                load_hypervisors();
                load_zones();
                load_instances();
                load_subnets();


                $scope.vm_tenant_content_modeldata = {
                    "title": "Create VM",
                    "page": getOpenstackTempalte('create_server')
                };

                $scope.subnet_modeldata = {
                    "title": "Create Subnet",
                    "page": getOpenstackTempalte('load-dialog')
                };

                $scope.flavor_content_modaldata = {
                    "title": "Create Flavor",
                    "page": getOpenstackTempalte('load-dialog')
                };

                $scope.create_tenant_modeldata = {
                    "title": "Create Tenant",
                    "page": getOpenstackTempalte('load-dialog')
                };

                $scope.update_tenant_modeldata = {
                    "title": "Update Tenant",
                    "page": getOpenstackTempalte('update_tenant')
                };

                $scope.tenant_volumes_modeldata = {
                    "title": "Create Volumes",
                    "page": getOpenstackTempalte('create_volume')
                };

                $scope.tenant_images_modeldata = {
                    "title": "Create Image",
                    "page": getOpenstackTempalte('create_image')
                };

                $scope.port_interface_modeldata = {
                    "title": "Create Image",
                    "page": getOpenstackTempalte('load-dialog')
                };

                $scope.service_catalog_modeldata = {
                    "title": "Create Service Catalog",
                    "page": getOpenstackTempalte('load-dialog')
                };

                $scope.service_regions_modeldata = {
                    "title": "Create Region",
                    "page": getOpenstackTempalte('load-dialog')
                };

                var create_fields_for_dialog = function (type, name) {
                    if (type == "text") {
                        return DataFormattingService.get_text_field(type, name, $filter('uppercase')($filter('underscoreless')(name)));
                    } else if (type == "checkbox") {
                        return DataFormattingService.get_checkbox(type, name, $filter('uppercase')($filter('underscoreless')(name)));
                    } else if (type == "hidden") {
                        return DataFormattingService.get_hidden_field(type, name, "id");
                    }
                };

                var get_image_id_server = function () {
                    var path = 'AdminAPi.get_image_id_for_vm_server()';
                    var image_id = ["Image Location", "Image File"];
                    return image_id;
                };

                var get_ram_values = function () {
                    var ram = DataFormattingService.get_ram();
                    return ram;
                };

                $scope.vm_tenant_rows = [
                    DataFormattingService.create_fields_for_dialog(["text", "name", "Name", "required"]),
                    DataFormattingService.create_fields_for_dialog(["select", "flavor_id", "Flavor", [], "required"]),
                    DataFormattingService.create_fields_for_dialog(["select", "image_id", "Image", [], "required"]),
                    create_fields_for_dialog("hidden", "tenant_id")
                ];

                $scope.flavor_rows = [
                    DataFormattingService.generate_row(["text", "name", "Name", "required"]),
                    DataFormattingService.generate_row(["number", "vcpus", "VCPUS", "required"]),
                    DataFormattingService.generate_row(["select", "ram", "RAM (MB)", get_ram_values(), "required"]),
                    DataFormattingService.generate_row(["number", "disk", "Root Disk (GB)", "required"]),
                    DataFormattingService.generate_row(["number", "ephemeral", "Ephemeral (GB)"]),
                    DataFormattingService.generate_row(["number", "swap", "Swap Disk (GB)"]),
                    DataFormattingService.generate_row(["checkbox", "is_public", "Is Public"])
                ];

                $scope.subnet_rows = [
                    DataFormattingService.generate_row(["text", "name", "Name", "required"]),
                    DataFormattingService.generate_row(["checkbox", "enable_dhcp", "Enable DHCP"]),
                    DataFormattingService.generate_row(["select", "ip_version", "IP Version", [4], "required"]),
                    DataFormattingService.generate_row(["text", "network_id", "Network", "required"]),
                    DataFormattingService.generate_row(["text", "gateway_ip", "Gateway IP"]),
                    DataFormattingService.generate_row(["text", "cidr", "Network Address", "required"])
                ];

                $scope.create_tenant_rows = [
                    DataFormattingService.generate_row(["text", "name", "Name", "required"]),
                    DataFormattingService.generate_row(["textarea", "description", "Description"]),
                    DataFormattingService.generate_row(["checkbox", "enabled", "Enabled"])
                ];

                $scope.update_tenant_rows = [
                    DataFormattingService.generate_row(["text", "name", "Name", "required"]),
                    DataFormattingService.generate_row(["textarea", "description", "Description"]),
                    DataFormattingService.generate_row(["checkbox", "enabled", "Enabled"]),
                    create_fields_for_dialog("hidden", "id")
                ];

                $scope.tenant_volumes_rows = [
                    DataFormattingService.generate_row(["text", "id_name", "Name"]),
                    DataFormattingService.generate_row(["textarea", "id_description", "Description"]),
                    DataFormattingService.generate_row(["select", "id_volume_source_type", "Volume Source", ["No source, empty volume", "Snapshot", "Image", "Volume"]]),
                    DataFormattingService.generate_row(["select", "id_type", "Type", ["No volume type", "Testing_ABC"]]),
                    DataFormattingService.generate_row(["number", "id_size", "Size (GB)", "required"]),
                    DataFormattingService.generate_row(["select", "id_availability_zone", "Availability Zone", ["nova"]])
                ];

                $scope.port_interface_rows = [
                    DataFormattingService.generate_row(["text", "port_id", "Port"])
                ];

                $scope.regions_rows = [
                    DataFormattingService.generate_row(["text", "id", "Name", "required"]),
                    DataFormattingService.generate_row(["text", "description", "Description"]),
                    DataFormattingService.generate_row(["select", "tenant_id", "Tenant", []]),
                    DataFormattingService.generate_row(["select", "parent_region_id", "Parent Region", []]),
                    DataFormattingService.generate_row(["checkbox", "enabled", "Enabled"])
                ];

                $scope.create_volume_rows = [
                    DataFormattingService.generate_row(["text", "id_name", "Name", "required"]),
                    DataFormattingService.generate_row(["text", "id_description", "Description"]),
                    DataFormattingService.generate_row(["select", "id_volume_source_type", "Volume Source"]),
                    DataFormattingService.generate_row(["select", "id_type", "Type"]),
                    DataFormattingService.generate_row(["select", "id_size", "Size", "required"])
                ];

                $scope.create_tenant_dropdown = [
                    DataFormattingService.generate_row(["text", "id_name", "Name"]),
                    DataFormattingService.generate_row(["text", "id_description", "Description"]),
                    DataFormattingService.generate_row(["select", "id_source_type", "Image Source", "required"]),
                    DataFormattingService.generate_row(["text", "id_image_url", "Image Location", "required"]),
                    DataFormattingService.generate_row(["select", "id_disk_format", "Format", "required"]),
                    DataFormattingService.generate_row(["text", "id_minimum_disk", "Minimum Disk (GB)"]),
                    DataFormattingService.generate_row(["text", "id_minimum_ram", "Minimum RAM (MB)"]),
                    DataFormattingService.generate_row(["checkbox", "id_is_copying", "Copy Data"]),
                    DataFormattingService.generate_row(["checkbox", "id_is_public", "Public"]),
                    DataFormattingService.generate_row(["checkbox", "id_protected", "Protected"])
                ];

                $scope.create_tenant_dropdown.disk_format = [{
                    label: "AKI - Amazon Kernel Image",
                    name: "aki"
                }, {
                    label: "AMI - Amazon Machine Image",
                    name: "ami"
                }, {
                    label: "ARI - Amazon Ramdisk Image",
                    name: "ari"
                }, {
                    label: "Docker",
                    name: "docker"
                }, {
                    label: "ISO - Optical Disk Image",
                    name: "iso"
                }, {
                    label: "OVA - Open Virtual Appliance",
                    name: "ova"
                }, {
                    label: "QCOW2 - QEMU Emulator",
                    name: "qcow2"
                }, {
                    label: "Raw",
                    name: "raw"
                }, {
                    label: "VDI - Virtual Disk Image",
                    name: "vdi"
                }, {
                    label: "VHD - Virtual Hard Disk",
                    name: "vhd"
                }, {
                    label: "VMDK - Virtual Machine Disk",
                    name: "vmdk"
                }];
                $scope.vm_tenant_actions = [{
                    "name": "Show Server IP",
                    "link": "#/openstack/" + $scope.adapter_id
                },];
                $scope.flavor_actions = [{
                    "name": "Remove",
                    "button": "remove_flavor"
                }, {
                    "name": "Show Access Information",
                    "link": "#/openstack/" + $scope.adapter_id + "/flavor/"
                }];
                $scope.tenant_actions = [{
                    "name": "Edit Info",
                    "button": "edit_tenant"
                }, {
                    "name": "Remove",
                    "button": "remove_general_tenant"
                }, {
                    "name": "Tenant usage",
                    "link": "#/openstack/" + $scope.adapter_id + "/usage_details/"
                }, {
                    "name": "List security groups",
                    "link": "#/openstack/" + $scope.adapter_id + "/security_groups/"
                }, {
                    "name": "List Key Pairs",
                    "link": "#/openstack/" + $scope.adapter_id + "/list_keypairs/"
                }, {
                    "name": "List Flavors",
                    "link": "#/openstack/" + $scope.adapter_id + "/list_flavors/"
                }, {
                    "name": "List Images",
                    "link": "#/openstack/" + $scope.adapter_id + "/list_images/"
                }, {
                    "name": "Add Volume",
                    "button": "add_volume"
                }, {
                    "name": "Add VM",
                    "button": "add_vm"
                }];
                $scope.images_actions = [{
                    "name": "Remove",
                    "button": "remove_images"
                }];
                $scope.region_actions = [{
                    "name": "Remove",
                    "button": "remove_region"
                }];
                $scope.hypervisor_actions = [{
                    "name": "List VM(s)",
                    link: "#/openstack/" + $scope.adapter_id + "/list_vms/"
                }];

                $scope.subnet_add = function (params) {

                    $scope.obj = params;
                    var valid = ValidationService.validate_data(params, $scope.subnet_rows);
                    if (($("#ip_field_1").val() == "") && ($("#ip_field_2").val() == "") && ($("#ip_field_3").val() == "") && ($("#ip_field_4").val() == "")) {
                        params.gateway_ip = "";
                    } else if (($("#ip_field_1").val() == "") || ($("#ip_field_2").val() == "") || ($("#ip_field_3").val() == "") || ($("#ip_field_4").val() == "")) {
                        valid.is_validated = false;
                        valid.gateway_iperr = true;
                        valid.gateway_ipMsg = "Gateway IP is invalid";
                    } else {
                        valid.gateway_iperr = false;
                        valid.gateway_ipMsg = "";
                        params.gateway_ip = $("#ip_field_1").val() + "." + $("#ip_field_2").val() + "." + $("#ip_field_3").val() + "." + $("#ip_field_4").val();
                    }

                    if (($("#ip_field_11").val() == "") || ($("#ip_field_21").val() == "") || ($("#ip_field_31").val() == "") || ($("#ip_field_41").val() == "") || ($("#ip_field_42").val() == "")) {
                        params.cidr = "";
                    }
                    if (!valid.is_validated) {
                        return valid;
                    } else {
                        $scope.subnet_content = "";
                        var url = AdminApi.add_subnet.replace(':adapter_id', $scope.adapter_id);
                        params.cidr = $("#ip_field_11").val() + "." + $("#ip_field_21").val() + "." + $("#ip_field_31").val() + "." + $("#ip_field_41").val() + "/" + $("#ip_field_42").val();
                        delete params.ip1;
                        delete params.ip2;
                        delete params.ip3;
                        delete params.ip4;
                        delete params.ip21;
                        delete params.ip31;
                        delete params.ip41;
                        delete params.ip51;
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                RestService.process_response(celery_response, load_subnets(), $scope);
                            }, function (error) {
                                load_subnets();
                                AlertService2.danger(error.data.result.message[0]);
                            });
                        });
                        var response_obj = {
                            "success": "Added Successfuly"
                        };
                        return response_obj;
                    }
                };
                $scope.vm_tenant_add = function (params) {
                    var valid = ValidationService.validate_data(params, $scope.vm_tenant_rows);
                    if (!valid.is_validated) {
                        return valid;
                    } else {
                        $scope.vm_tenant_content = "";
                        var url = AdminApi.add_vm_tenant.replace(':adapter_id', $scope.adapter_id).replace(':tenant_id', params.tenant_id);
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                RestService.process_response(celery_response, load_servers(), $scope);
                            }, function (error) {
                                load_servers();
                                AlertService2.danger(error.data.result.message[0]);
                            });
                        });
                        var response_obj = {
                            "success": "Added Successfuly"
                        };
                        return response_obj;
                    }
                };

                $scope.flavor_add = function (params) {
                    var valid = ValidationService.validate_data(params, $scope.flavor_rows);
                    if (!valid.is_validated) {
                        return valid;
                    } else {
                        $scope.flavor_content = "";
                        var url = AdminApi.add_flavor.replace(':adapter_id', $scope.adapter_id);
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                RestService.process_response(celery_response, load_flavors(), $scope);
                            }, function (error) {
                                load_flavors();
                                AlertService2.danger(error.data.result.message[0]);
                            });
                        });
                        var response_obj = {
                            "success": "Added Successfuly"
                        };
                        return response_obj;
                    }
                };

                $scope.create_tenant_add = function (params) {
                    var valid = ValidationService.validate_data(params, $scope.create_tenant_rows);
                    if (!valid.is_validated) {
                        return valid;
                    } else {
                        $scope.tenant_content = "";
                        var url = AdminApi.get_general_tenant_data.replace(':adapter_id', $scope.adapter_id);
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                RestService.process_response(celery_response, load_tenants(), $scope);
                            }, function (error) {
                                load_tenants();
                                AlertService2.danger(error.data.result.message[0]);
                            });
                        });
                        var response_obj = {
                            "success": "Added Successfuly"
                        };
                        return response_obj;
                    }
                };

                $scope.create_tenant_volumes_add = function (params) {
                    var valid = ValidationService.validate_data(params, $scope.create_volume_rows);
                    if (!valid.is_validated) {
                        return valid;
                    } else {
                        $scope.tenant_volumes_content = "";
                        var url = AdminApi.add_tenant_volumes.replace(':adapter_id', $scope.adapter_id).replace(':tenant_id', params.tenant_id);
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                RestService.process_response(celery_response, "", $scope);
                            }, function (error) {
                                AlertService2.danger(error.data.result.message[0]);
                            });
                        });
                        var response_obj = {
                            "success": "Added Successfuly"
                        };
                        return response_obj;
                    }
                };

                $scope.tenant_images_add = function (params) {
                    var valid = ValidationService.validate_data(params, $scope.create_tenant_dropdown);
                    if (!valid.is_validated) {
                        return valid;
                    } else {
                        $scope.tenant_images_content = "";
                        var url = AdminApi.add_tenant_images.replace(':adapter_id', $scope.adapter_id);
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                RestService.process_response(celery_response, load_images(), $scope);
                            }, function (error) {
                                load_images();
                                AlertService2.danger(error.data.result.message[0]);
                            });
                        });
                        var response_obj = {
                            "success": "Added Successfuly"
                        };
                        return response_obj;
                    }
                };

                $scope.service_catalog_add = function (params) {
                    $scope.service_catalog_content = "";
                    var url = AdminApi.add_catalog_service.replace(':adapter_id', $scope.adapter_id);

                    function load_catalogs() {
                    }  // todo: figure out what this is supposed to be
                    RestService.send_modal_data(params, url).then(function (result) {
                        TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                            RestService.process_response(celery_response, load_catalogs(), $scope);
                        }, function (error) {
                            load_catalogs();
                            AlertService2.danger(error.data.result.message[0]);
                        });
                    });
                };

                $scope.port_interface_add = function (params) {
                    var url = AdminApi.add_interface_port.replace(':adapter_id', $scope.adapter_id);
                    RestService.send_modal_data(params, url).then(function (result) {
                        TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                            RestService.process_response(celery_response, "", $scope);
                        }, function (error) {
                            AlertService2.danger(error.data.result.message[0]);
                        });
                    });
                };

                $scope.region_add = function (params) {

                    var valid = ValidationService.validate_data(params, $scope.regions_rows);
                    if (!valid.is_validated) {
                        return valid;
                    } else {
                        $scope.regions_content = "";
                        var url = AdminApi.add_region_port.replace(':adapter_id', $scope.adapter_id);
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                RestService.process_response(celery_response, load_regions(), $scope);
                            }, function (error) {
                                load_regions();
                                AlertService2.danger(error.data.result.message[0]);
                            });
                        });
                        var response_obj = {
                            "success": "Added Successfuly"
                        };
                        return response_obj;
                    }
                };

                $scope.update_tenant = function (params) {

                    var valid = ValidationService.validate_data(params, $scope.update_tenant_rows);
                    if (!valid.is_validated) {
                        return valid;
                    } else {
                        $scope.tenant_content = "";
                        var url = AdminApi.get_general_tenant_data.replace(':adapter_id', $scope.adapter_id) + params.id + "/";
                        RestService.update_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                RestService.process_response(celery_response, load_tenants(), $scope);
                            }, function (error) {
                                load_tenants();
                                AlertService2.danger(error.data.result.message[0]);
                            });
                        });
                        var response_obj = {
                            "success": "Added Successfuly"
                        };
                        return response_obj;
                    }
                };


                $scope.delete_info = function (row_object) {
                    var request_url;
                    if (row_object.table_name === "flavors") {
                        $scope.flavor_content = "";
                        request_url = AdminApi.get_flavor_data.replace(":adapter_id", $scope.adapter_id) + row_object.flavor_id;
                        OpenstackService.delete_flavor(request_url).then(function (result) {
                            if (result.data.hasOwnProperty("celery_task")) {
                                TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                    RestService.process_response(celery_response, load_flavors(), $scope);
                                }, function (error) {
                                    load_flavors();
                                    AlertService2.danger(error.data.result.message[0]);
                                });
                            }
                        });
                    } else if (row_object.table_name === "regions") {
                        $scope.regions_content = "";
                        request_url = AdminApi.get_regions_data.replace(":adapter_id", $scope.adapter_id) + row_object.name;
                        OpenstackService.delete_region(request_url).then(function (result) {
                            if (result.data.hasOwnProperty("celery_task")) {
                                TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                    RestService.process_response(celery_response, load_regions(), $scope);
                                }, function (error) {
                                    load_regions();
                                    AlertService2.danger(error.data.result.message[0]);
                                });
                            }
                        });
                    } else if (row_object.table_name === "general_tenants") {
                        request_url = AdminApi.delete_tenants.replace(':adapter_id', $scope.adapter_id) + row_object.id;
                        OpenstackService.delete_general_tenant(request_url).then(function (result) {
                            if (result.data.hasOwnProperty("celery_task")) {
                                TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                    RestService.process_response(celery_response, load_tenants(), $scope);
                                }, function (error) {
                                    load_tenants();
                                    AlertService2.danger(error.data.result.message[0]);
                                });
                            }
                        });
                    } else if (row_object.table_name === "images_list") {
                        request_url = AdminApi.get_images_list_data.replace(":adapter_id", $scope.adapter_id) + row_object.image_id;
                        OpenstackService.delete_image_list(request_url).then(function (result) {
                            if (result.data.hasOwnProperty("celery_task")) {
                                TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                    RestService.process_response(celery_response, load_images(), $scope);
                                }, function (error) {
                                    load_images();
                                    AlertService2.danger(error.data.result.message[0]);
                                });
                            }
                        });
                    }
                };
            }
            else {
                AlertService2.danger("Invalid Access");
                return $location.path("/nova");
            }
        });
    }
]);
