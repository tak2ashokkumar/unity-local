var app = angular.module('uldb');
app.controller('CustomerAwsController', [
    '$scope',
    '$state',
    '$routeParams',
    '$stateParams',
    '$rootScope',
    '$q',
    '$window',
    '$location',
    '$filter',
    '$uibModal',
    '$timeout',
    'BreadCrumbService',
    'ClientDashboardService',
    'AwsService',
    'TaskService',
    'ClientApi',
    'TableHeaders',
    'DataFormattingService',
    'RestService',
    'AlertService2',
    'ValidationService',
    '$http',
    function ($scope,
              $state,
              $routeParams,
              $stateParams,
              $rootScope,
              $q,
              $window,
              $location,
              $filter,
              $uibModal,
              $timeout,
              BreadCrumbService,
              ClientDashboardService,
              AwsService,
              TaskService,
              ClientApi,
              TableHeaders,
              DataFormattingService,
              RestService,
              AlertService2,
              ValidationService,
              $http) {
        $scope.alertService = AlertService2;
        $scope.aws_region_list_headers = TableHeaders.aws_region_list_headers;
        $scope.aws_user_list_headers = TableHeaders.aws_user_list_headers;
        $scope.aws_volume_list_headers = TableHeaders.aws_volume_list_headers;
        $scope.aws_instance_list_headers = TableHeaders.aws_instance_list_headers;
        $scope.aws_snapshot_list_headers = TableHeaders.aws_snapshot_list_headers;
        $scope.aws_available_volume_list_headers = TableHeaders.aws_available_volume_list_headers;
        $scope.aws_instance_details_headers = TableHeaders.aws_instance_details_headers;
        $scope.aws_s3_buckets_headers = TableHeaders.aws_s3_buckets_headers;
        $scope.aws_entities_group_headers = TableHeaders.aws_entities_group_headers;
        $scope.aws_entities_user_headers = TableHeaders.aws_entities_user_headers;
        $scope.aws_entities_role_headers = TableHeaders.aws_entities_role_headers;
        $scope.aws_asg_headers = TableHeaders.aws_asg_headers;
        $scope.aws_network_interface_headers = TableHeaders.aws_network_interface_headers;
        $scope.aws_load_balancer_list_headers = TableHeaders.aws_load_balancer_list_headers;
        $scope.aws_security_group_headers = TableHeaders.aws_security_group_headers;
        $scope.create_aws_instance_dropdowns = {};
        $scope.aws_attachinstance_dropdowns = {};
        $scope.aws_attachinterface_dropdowns = {};
        $scope.aws_attachloadbalancer_dropdowns = {};
        $scope.default_error_msg = "Something went wrong, please try again later.";

        $scope.title = {
            plural: "AWS",
            singular: "AWS"
        };

        $scope.searchKeyword = '';
        $scope.sortkey = '';

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        $scope.getSortingResults = function (sort) {
            console.log('sort : ', angular.toJson(sort));
            if ((sort !== undefined) && (sort !== null) && (sort !== '')) {
                $scope.sortkey = sort.sortingColumn;
            }
        };

        $scope.loader = true;

        $scope.tabs = [
            {displayName: 'Instances', name: 'instances'},
            {displayName: 'Snapshots', name: 'snapshots'},
            {displayName: 'Volumes', name: 'volumes'},
            // { displayName: 'Available Volumes', name : 'availablevolumes'}, // We need to test whether Volumes and Available volumes data are same or not
            {displayName: 'S3', name: 's3'},
            {displayName: 'Auto Scaling Groups', name: 'autoscalinggroups'},
            {displayName: 'Security Groups', name: 'securitygroups'},
            {
                displayName: 'Devices', name: 'devices',
                submenu: [
                    {displayName: 'Load Balancers', name: 'loadbalancers'},
                    {displayName: 'Network Interfaces', name: 'networkinterfaces'}
                ]
            },
            {displayName: 'Users', name: 'users'}
        ];

        $scope.AWS_REGIONS_CONSTANT = [
            {short: "us-east-1", long: "US East (N. Virginia)"},
            {short: "us-west-1", long: "US West (N. California)"},
            {short: "us-west-2", long: "US West (Oregon)"},
            {short: "eu-west-1", long: "EU (Ireland)"},
            {short: "eu-central-1", long: "EU (Frankfurt)"},
            {short: "ap-southeast-1", long: "Asia Pacific (Singapore)"},
            {short: "ap-southeast-2", long: "Asia Pacific (Sydney)"},
            {short: "ap-northeast-2", long: "Asia Pacific (Seoul)"},
            {short: "ap-northeast-1", long: "Asia Pacific (Tokyo)"},
            {short: "ap-south-1", long: "Asia Pacific (Mumbai)"},
            {short: "sa-east-1", long: "South America (São Paulo)"}
        ];

        $scope.bread = BreadCrumbService;
        if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
        var get_aws_template = function (name) {
            return ClientApi.create_modal.replace(":name", name);
        };

        $scope.get_observium_details = function (instance) {
            instance.observium_details = {};
            instance.message = 'Show Firewall Statistics';
            $http({
                method: "GET",
                url: '/customer/observium/aws/' + instance.uuid + '/get_device_data/'
            }).then(function (response) {
                instance.observium_details = response.data;
                instance.observium_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                instance.observium_details = null;
                instance.message = 'Not Configured';
            });
        };

        $scope.instance_details = {};
        $scope.show_observium_details = function (instance) {
            console.log(' in show_observium_details with : ', angular.toJson(instance));
            $scope.instance_details = instance.observium_details;
        };

        var load_listinstance = function () {
            var images_url = ClientApi.get_images_list.replace(":account_id", account_id).replace(":name", region_name);
            listsecgroupPromise();
            $http({
                method: "GET",
                url: images_url
            }).then(function (result) {
                if (result.status == 200) {
                    // var final_list_amis = angular.extend(result.data, default_ami);
                    $scope.create_aws_instance_dropdowns.image_id = result.data;
                    $scope.create_aws_instance_dropdowns.storage_type = [{
                        "name": "standard",
                        "description": "standard"
                    },
                        {"name": "io1", "description": "Provisioned IOPS SSD (IO1)"},
                        {"name": "gp2", "description": "General purpose SSD (GP2)"}
                    ];
                    $scope.create_aws_instance_dropdowns.tags_applicability = ['instance', 'volume'];
                }
            });

            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/region/' + region_name + '/instance_launch_data/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                $scope.create_aws_instance_dropdowns.data = result;
                                $scope.create_aws_instance_dropdowns.instance_type = AwsService.get_instance_type("aws_instance_dropdowns_instance_type");
                            } else {
                                AlertService2.addAlert({msg: result.data.result.message[0], severity: 'danger'});
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({msg: error.data.result.message[0], severity: 'danger'});
                        $scope.create_aws_instance_dropdowns = [];
                    });
                }
                else {
                    $scope.create_aws_instance_dropdowns.data = result;
                    var instance_types = AwsService.get_instance_type("aws_instance_dropdowns_instance_type");
                    instance_types.then(function (result) {
                        $scope.create_aws_instance_dropdowns.instance_type = result.data.types;
                    });

                }

            }).catch(function (error) {
                return error;
            });


            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/region/' + region_name + '/instance/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                $scope.aws_instance_list_content = result.result;
                                $scope.aws_instance_list_content.actions = [
                                    {"name": "Start", "button": "awspoweron"},
                                    {"name": "Stop", "button": "awspoweroff"},
                                    {"name": "Disabled", "button": "awsdisabled"},
                                    {"name": "Terminate", "button": "awsterminate"},
                                    {"name": "Create Image", "button": "createimage"},
                                    {"name": "Clone", "button": "cloneinstance"},
                                    {"name": "Attach Autoscaling Group", "button": "attachinstance"},
                                    {"name": "Attach Network Interface", "button": "attachinterface"},
                                    {"name": "Attach Load Balancer", "button": "attachloadbalancer"},
                                    {
                                        "name": "Details",
                                        "link": "#/aws/" + account_id + "/aws-region/" + region_name + "/instance-details/"
                                    },
                                    {"name": "Monitoring Dashboard", "button": "observiumdetails"},
                                    {"name": "Manage by creating support ticket", "button": "manage_support"}
                                ];
                            } else {
                                AlertService2.addAlert({
                                    msg: "Listing Instance Failed. Please try again later.",
                                    severity: 'danger'
                                });
                            }
                            $scope.loader = false;
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: "Listing Instance Failed. Please try again later.",
                            severity: 'danger'
                        });
                        $scope.aws_instance_list_content = error;
                    });
                }
                else {
                    $scope.aws_instance_list_content = result;
                    $scope.aws_instance_list_content.actions = [
                        {"name": "Start", "button": "awspoweron"},
                        {"name": "Stop", "button": "awspoweroff"},
                        {"name": "Terminate", "button": "awsterminate"},
                        {
                            "name": "Create Image",
                            "link": "#/aws/" + account_id + "/aws-region/" + region_name + "/createimage/"
                        },
                        {"name": "Clone", "button": "cloneinstance"},
                        {
                            "name": "Attach Autoscaling Group",
                            "link": "#/aws/" + account_id + "/aws-region/" + region_name + "/attachinstance/"
                        },
                        {
                            "name": "Attach Network Interface",
                            "link": "#/aws/" + account_id + "/aws-region/" + region_name + "/attachinterface/"
                        },
                        {
                            "name": "Attach Load Balancer",
                            "link": "#/aws/" + account_id + "/aws-region/" + region_name + "/attachloadbalancer/"
                        },
                        {"name": "Manage by creating support ticket", "button": "manage_support"},
                        {
                            "name": "Details",
                            "link": "#/aws/" + account_id + "/aws-region/" + region_name + "/instance-details/"
                        }

                    ];
                    $scope.loader = false;
                }

            }).catch(function (error) {
                return error;
            });

        };

        var load_listsnapshot = function () {
            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/region/' + region_name + '/snapshot/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                $scope.aws_snapshot_list_content = result.result;
                                $scope.aws_snapshot_list_content.actions = [
                                    {"name": "Copy Snapshot", "button": "snapshot"}
                                ];
                            } else {
                                AlertService2.addAlert({
                                    msg: "Listing Snapshot Failed. Please try again later.",
                                    severity: 'danger'
                                });
                            }
                            $scope.loader = false;
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: "Listing Snapshot Failed. Please try again later.",
                            severity: 'danger'
                        });
                        $scope.aws_snapshot_list_content = error;
                    });
                }
                else {
                    $scope.aws_snapshot_list_content = result;
                    $scope.aws_snapshot_list_content.actions = [
                        {"name": "Copy Snapshot", "button": "snapshot"}

                    ];
                    $scope.loader = false;
                }

            }).catch(function (error) {
                return error;
            });
        };

        var load_listvolume = function () {
            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/region/' + region_name + '/volume/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                $scope.aws_volume_list_content = result.result;
                            }
                            else {
                                AlertService2.addAlert({
                                    msg: "Listing Volume Failed. Please try again later.",
                                    severity: 'danger'
                                });
                            }
                            $scope.loader = false;
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: "Listing Volume Failed. Please try again later.",
                            severity: 'danger'
                        });
                        $scope.aws_volume_list_content = error;
                    });
                }
                else {
                    $scope.aws_volume_list_content = result;
                    $scope.loader = false;
                }

            }).catch(function (error) {
                return error;
            });

        };

        var load_listnetinter = function () {
            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/region/' + region_name + '/list_network_interface/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                $scope.aws_netinter_list_content = result.result;
                            }
                            else {
                                AlertService2.addAlert({
                                    msg: "Listing Network Interfaces Failed. Please try again later.",
                                    severity: 'danger'
                                });
                            }
                            $scope.loader = false;
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: "Listing Network Interfaces Failed. Please try again later.",
                            severity: 'danger'
                        });
                        $scope.aws_netinter_list_content = error;
                    });
                }
                else {
                    $scope.aws_netinter_list_content = result;
                    $scope.loader = false;
                }

            }).catch(function (error) {
                return error;
            });
        };

        $scope.aws_image_add = function (params) {
            $scope.loader = true;
            var valid = ValidationService.validate_data(params, $scope.aws_create_image_rows);
            if (!valid.is_validated) {
                $scope.loader = false;
                return valid;
            }
            var url = ClientApi.add_aws_image.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", params.instance_id);
            RestService.send_modal_data(params, url).then(function (result) {
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        $scope.loader = false;
                        if (!/false,/.exec(result.result)) {
                            //$scope.aws_instance_list_content = "";
                            //load_listinstance(region_name);
                            AlertService2.success("Image Added Successfully");
                        } else {
                            AlertService2.danger("Image Addition Failed. Please try again later.");
                        }
                    }
                }, function (error) {
                    $scope.error = true;
                    $scope.loader = false;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.danger("Image Addition Failed. Please try again later.");
                });
            });
            var response_obj = {"success": "Added Successfuly"};
            return response_obj;
        };
//      Mange by creating support request
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
                console.log('Modal dismissed at: ' + new Date());
            });
        };


        $scope.manage_request = function (region, instance_id) {
            $scope.device_type = "AWS Instance";
            $scope.device_name = instance_id;
            $scope.description = 
                "Region: " + region + "\n" +
                "Instance ID: " + instance_id;
            showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');

        };

        //$scope.keypair_list = [];
        $scope.load_keypair = function (params) {
            if (params == 'b') {
                $scope.keypair_list_show = true;
            } else {
                $scope.keypair_list_show = false;
                return;
            }
            var region = region_name;
            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/keypair_detail/',
                params: {'region': region}
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            $scope.keypairlist = result.result.data.KeyPairs;

                        }
                    }, function (error) {

                    });
                }

            }).catch(function (error) {
                return error;
            });

        };

        $scope.aws_instance_add = function (params) {
            $scope.loader = true;
            var valid = ValidationService.validate_data(params, $scope.aws_create_instance_rows);
            if (!valid.is_validated) {
                $scope.loader = false;
                return valid;
            }

            delete params.is_validated;
            var url = ClientApi.launch_instance.replace(":account_id", account_id).replace(":name", region_name);
            RestService.send_modal_data(params, url).then(function (result) {
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        $scope.loader = false;
                        if (!/false,/.exec(result.result)) {
                            $scope.aws_instance_list_content = "";
                            load_listinstance(region_name);
                            //$scope.aws_volume_list_content = "";
                            //$scope.aws_netinter_list_content = "";
                            //load_listvolume(region_name);
                            //load_listnetinter(region_name);
                            $timeout(function () {
                                $scope.aws_instance_list_content = "";
                                load_listinstance(region_name);
                            }, 60000);
                            AlertService2.success("Instance Created Successfully");
                        }
                        else {
                            AlertService2.danger("Instance Creation Failed. Please try again later.");
                        }
                    }
                }, function (error) {
                    $scope.error = true;
                    $scope.loader = false;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.danger("Instance Creation Failed. Please try again later.");
                });
            });
            var response_obj = {"success": "Added Successfuly"};
            return response_obj;
        };

        $scope.aws_clone_instance_add = function (params) {
            $scope.loader = true;
            var valid = ValidationService.validate_data(params, $scope.aws_create_instance_rows);
            if (!valid.is_validated) {
                $scope.loader = false;
                console.log(valid);
                return valid;
            }
            var url = ClientApi.launch_instance.replace(":account_id", account_id).replace(":name", region_name);
            params.image_id = $scope.create_aws_instance_dropdowns.image_id;
            RestService.send_modal_data(params, url).then(function (result) {
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        $scope.loader = false;
                        if (!/false,/.exec(result.result)) {
                            $scope.aws_instance_list_content = "";
                            load_listinstance(region_name);
                            AlertService2.success("Instance Cloned Successfully");
                        } else {
                            AlertService2.danger("Instance Clone Failed. Please try again later.");
                        }
                    }
                }, function (error) {
                    $scope.error = true;
                    $scope.loader = false;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.danger("Instance Clone Failed. Please try again later.");
                });
            });
            var response_obj = {"success": "Added Successfuly"};
            return response_obj;
        };

        $scope.aws_copy_snapshot = function (params) {
            $scope.loader = true;
            var valid = ValidationService.validate_data(params, $scope.aws_copy_snapshot_rows);
            if (!valid.is_validated) {
                $scope.loader = false;
                return valid;
            }
            var url = ClientApi.copy_snapshot.replace(":account_id", account_id).replace(":name", region_name).replace(":snapshot_id", params.SnapshotId);
            RestService.send_modal_data(params, url).then(function (result) {
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        $scope.loader = false;
                        if (!/false,/.exec(result.result)) {
                            $scope.aws_snapshot_list_content = "";
                            load_listsnapshot();
                            AlertService2.success("Snapshot Copied Successfully");
                        } else {
                            AlertService2.danger("Snapshot Copy Failed. Please try again later.");
                        }
                    }
                }, function (error) {
                    $scope.error = true;
                    $scope.loader = false;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.danger("Snapshot Copy Failed. Please try again later.");
                });
            });
            var response_obj = {"success": "Added Successfuly"};
            return response_obj;
        };

        $scope.attach_autoscaling_group = function (params) {
            $scope.loader = true;
            var valid = ValidationService.validate_data(params, $scope.aws_attachinstance_rows);
            if (!valid.is_validated) {
                $scope.loader = false;
                return valid;
            }
            delete params.is_validated;
            var url = ClientApi.attach_autoscaling_group.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", params.instance_id);
            RestService.send_modal_data(params, url).then(function (result) {
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        $scope.loader = false;
                        if (!/false,/.exec(result.result)) {
                            AlertService2.success("Attached Successfully");
                        } else {
                            AlertService2.danger("Attach Failed. Please try again later.");
                        }
                    }
                }, function (error) {
                    $scope.error = true;
                    $scope.loader = false;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.danger("Attach Failed. Please try again later.");
                });
            });
            var response_obj = {"success": "Added Successfuly"};
            return response_obj;
        };

        $scope.attach_network_interface = function (params) {
            $scope.loader = true;
            var valid = ValidationService.validate_data(params, $scope.aws_attachinterface_rows);
            if (!valid.is_validated) {
                $scope.loader = false;
                return valid;
            }
            delete params.is_validated;
            var url = ClientApi.attach_network_interface.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", params.instance_id);
            RestService.send_modal_data(params, url).then(function (result) {
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        $scope.loader = false;
                        if (!/false,/.exec(result.result)) {
                            AlertService2.success("Attached Successfully");
                        } else {
                            AlertService2.danger("Attach Failed. Please try again later.");
                        }
                    }
                }, function (error) {
                    $scope.error = true;
                    $scope.loader = false;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.danger("Attach Failed. Please try again later.");
                });
            });
            var response_obj = {"success": "Added Successfuly"};
            return response_obj;
        };

        $scope.attach_loadbalancer = function (params) {
            $scope.loader = true;
            var valid = ValidationService.validate_data(params, $scope.aws_attachloadbalancer_rows);
            if (!valid.is_validated) {
                $scope.loader = false;
                return valid;
            }
            delete params.is_validated;
            var url = ClientApi.attach_loadbalancer.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", params.instance_id);
            RestService.send_modal_data(params, url).then(function (result) {
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        $scope.loader = false;
                        if (!/false,/.exec(result.result)) {
                            AlertService2.success("Attached Successfully");
                        } else {
                            AlertService2.danger("Attach Failed. Please try again later.");
                        }
                    }
                }, function (error) {
                    $scope.error = true;
                    $scope.loader = false;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.danger("Attach Failed. Please try again later.");
                });
            });
            var response_obj = {"success": "Added Successfuly"};
            return response_obj;
        };

        $scope.show_awsvm_statistics = function (aws_vm) {
            if ($state.current.name == 'public_cloud.aws-account-region-inventory') {
                localStorage.setItem('isInstanceStats', true);
            } else if ($state.current.name == 'public_cloud.aws-account-region-vms') {
                localStorage.removeItem('isInstanceStats');
            }
            console.log('account_id : ', account_id);
            console.log('region_name : ', region_name);
            console.log('aws_vm.uuid : ', aws_vm.uuid);
            $state.go('public_cloud.aws-account-region-vm', {
                uuidp: account_id,
                uuidc: region_name,
                uuidq: aws_vm.uuid
            }, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 0);
            }, 1000);
        };

        $scope.aws_create_instance_rows = [
            DataFormattingService.generate_row(["select", "instance_type", "Instance Type", ["sg1", "sg2"], "required"]),
            DataFormattingService.generate_row(["select", "image_id", "Image id", "required"]),
            DataFormattingService.generate_row(["number", "max_count", "Number of Instances", "required"]),
            DataFormattingService.generate_row(["select", "availability_zone", "Availability Zone", ["zone1", "zone2"], "required"]),
            DataFormattingService.generate_row(["select", "subnet_id", "Subnet Id", ["sg1", "sg2"], "required"]),
            DataFormattingService.generate_row(["select", "shutdown_behavior", "Shutdown Behavior", ["stop", "terminate"], "required"]),
            DataFormattingService.generate_row(["select", "keypair_behavior", "Key Pair behaviour", "required"]),
            DataFormattingService.generate_row(["number", "storage_size", "Storage size", "required"]),
            DataFormattingService.generate_row(["select", "storage_type", "Storage type", "required"]),
            DataFormattingService.generate_row(["checkbox", "dot", "Delete on termination"]),
            DataFormattingService.generate_row(["select", "security_group", "Security group", "required"]),
            DataFormattingService.generate_row(["text", "tags_key", "Tags key"]),
            DataFormattingService.generate_row(["text", "tags_value", "Tags value"]),
            DataFormattingService.generate_row(["text", "tags_applicability", "Tags Applicability"]),
        ];
        $scope.aws_attachinstance_rows = [
            DataFormattingService.generate_row(["select", "group", "Auto Scaling Group", ["sg1", "sg2"], "required"])
        ];
        $scope.aws_attachinterface_rows = [
            DataFormattingService.generate_row(["select", "network_interface_id", "Network Interface", ["sg1", "sg2"], "required"]),
            DataFormattingService.generate_row(["number", "device_index", "Device Index", "required"]),
        ];
        $scope.aws_attachloadbalancer_rows = [
            DataFormattingService.generate_row(["select", "load_balancer", "Load Balancer", ["lb1", "lb2"], "required"]),
        ];
        $scope.aws_copy_snapshot_rows = [
            DataFormattingService.generate_row(["text", "description", "Description", "required"])
        ];
        $scope.aws_create_image_rows = [
            DataFormattingService.generate_row(["text", "instance_id", "Instance Id", "required"]),
            DataFormattingService.generate_row(["text", "name", "Image Name", "required"]),
            DataFormattingService.generate_row(["text", "description", "Image Description", "required"]),
            DataFormattingService.generate_row(["checkbox", "no_reboot"])
        ];
        $scope.aws_create_image_modaldata = {
            "title": "Create Image",
            "page": get_aws_template('create_aws_image')
        };
        $scope.aws_create_instance_modaldata = {
            "title": "Create Instance",
            "page": get_aws_template('create-instance')
        };
        $scope.aws_clone_instance_modaldata = {
            "title": "Clone Instance",
            "page": get_aws_template('create-instance')
        };
        $scope.aws_attachinstance_modaldata = {
            "title": "Attach to Auto Scaling Group",
            "page": '/static/rest/app/templates/v3/aws/attach_autoscaling_group.html'
        };
        $scope.aws_attachinterface_modaldata = {
            "title": "Attach Network Interface",
            "page": '/static/rest/app/templates/v3/aws/attach_network_interface.html'
        };
        $scope.aws_attachloadbalancer_modaldata = {
            "title": "Attach LoadBalancer",
            "page": '/static/rest/app/templates/v3/aws/attach_loadbalancer.html'
        };
        $scope.aws_snapshot_list_modeldata = {
            "title": "Copy Snapshot",
            "page": '/static/rest/app/templates/v3/aws/copy_snapshot.html'
        };

        $scope.aws_vm_operations = {
            "title": "AWS Virtual Machine",
            "alertMsg": "Are you sure you want to continue with this action?"
        };


        var createimage_modal = function createimage_modal(params) {
            $scope.obj.instance_id = params.rowdata.instance_id;
            var url = ClientApi.add_aws_image.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", params.instance_id);
            var urls = {create: url};
            var rows = $scope.aws_create_image_rows;
            // load_modal(load_listinstance, urls, "Image", rows, "modal", get_aws_template('create_aws_image'));
            $scope.ctrl.add();
        };

        $scope.aws_list_click = function (params) {
            $scope.obj = {};
            $scope.row_params = params;
            if (params.callback == "INSTANCES") {
                if (params.method == 'Add') {
                    var url = ClientApi.launch_instance.replace(":account_id", account_id).replace(":name", region_name);
                    var urls = {create: url};
                    var rows = $scope.aws_create_instance_rows;
                    // load_modal(load_listinstance, urls, "Instance", rows, "modal", get_aws_template('create-instance'));
                    $scope.ctrl.add();
                } else if (params.method == 'Edit') {
                    var url = ClientApi.launch_instance.replace(":account_id", account_id).replace(":name", region_name);
                    var urls = {edit_post: url};
                    var rows = $scope.aws_create_instance_rows;
                    // load_modal(load_listinstance, urls, "Instance", rows, "modal", get_aws_template('create-instance'));
                    $scope.ctrl.edit();
                }
            } else if (params.callback == "createimage") {
                createimage_modal(params);
            }
        };
        //Testing new Modal-End

        var manage_user_data = function () {
            $scope.heading = "Users";
            $scope.displayheading = "Users";
            $scope.selectedregion = $scope.region_name_float;
            $scope.headers = $scope.aws_user_list_headers;
            // $scope.tabledata=$scope.aws_user_list_content.data
            /*$scope.addclick=$scope.aws_dashboard_add(data)
             $scope.addclick1=$scope.showUserGroups(data1)
             $scope.addclick2=$scope.showUserData(data2)*/
            // $scope.actions=$scope.aws_user_list_content.actions
        };

        var listuserPromise = function () {
            manage_user_data();
            $scope.aws_usergroup_list_headers = [];
            $scope.aws_usergroup_list_content = [];
            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/region/' + region_name + '/user/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            $scope.loader = false;
                            if (!/false,/.exec(result.result)) {
                                $scope.aws_user_list_content = result.result;
                                $scope.aws_user_list_content.actions = [
                                    {
                                        "name": "Show User Groups",
                                        "link1": "#/aws/" + account_id + "/aws-region/" + region_name + "/user/",
                                        "link2": "/aws-user-group"
                                    },
                                    {
                                        "name": "Show User Details",
                                        "link1": "#/aws/" + account_id + "/aws-region/" + region_name + "/user/",
                                        "link2": "/aws-user-details"
                                    }

                                ];
                            } else {
                                $scope.aws_user_list_content.data = [];
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        if (error.data.result.message[0].includes('(AccessDenied)')){
                            AlertService2.danger('You do not have privilege to see the user list.');
                        }
                        else{
                            AlertService2.addAlert({
                                msg: "Listing User Failed. Please try again later.",
                                severity: 'danger'
                            });
                        }
                    });
                }
                else {
                    $scope.aws_user_list_content = result;
                    $scope.aws_user_list_content.actions = [
                        {
                            "name": "Show User Groups",
                            "link1": "#/aws/" + account_id + "/aws-region/" + region_name + "/user/",
                            "link2": "/aws-user-group"
                        },
                        {
                            "name": "Show User Details",
                            "link1": "#/aws/" + account_id + "/aws-region/" + region_name + "/user/",
                            "link2": "/aws-user-details"
                        }
                    ];
                    $scope.loader = false;
                }

            }).catch(function (error) {
                return error;
            });
        };

        var listavailvolumePromise = function () {
            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/region/' + region_name + '/list_available_volume/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            $scope.loader = false;
                            if (!/false,/.exec(result.result)) {
                                $scope.aws_availablevolume_list_content = result.result;
                            } else {
                                AlertService2.addAlert({
                                    msg: "Listing Available Volume Failed. Please try again later.",
                                    severity: 'danger'
                                });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: "Listing Available Volume Failed. Please try again later.",
                            severity: 'danger'
                        });
                        $scope.aws_availablevolume_list_content = [];
                    });
                }
                else {
                    $scope.aws_availablevolume_list_content = result;
                    $scope.loader = false;
                }

            }).catch(function (error) {
                return error;
            });
        };

        var listloadbalancerPromise = function () {
            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/region/' + region_name + '/load_balancer/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                $scope.aws_loadbalancer_list_content = result.result;
                            }
                            else {
                                AlertService2.addAlert({
                                    msg: "Listing Load Balancers Failed. Please try again later.",
                                    severity: 'danger'
                                });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: "Listing Load Balancers Failed. Please try again later.",
                            severity: 'danger'
                        });
                        $scope.aws_loadbalancer_list_content = [];
                    });
                }
                else {
                    $scope.aws_loadbalancer_list_content = result;
                }

            }).catch(function (error) {
                return error;
            });
        };

        $scope.create_s3_bucket_modal = function(){
            $scope.selected_region = {short: "us-west-1", long: "US West (N. California)"};
            showmodel('createBucketModal.html');
        };

        $scope.delete_s3_bucket_confirmation = function(bucket){
            $scope.selected_bucket = bucket;
            showmodel('bucketDeleteConfirmation.html');
        };

        $scope.upload_file_s3_bucket_confirmation = function(bucket){
            $scope.selected_bucket = bucket;
            showmodel('uploadFileBucketModal.html');
        };
        
        $scope.create_s3_bucket = function(bucket_name, region){
            $http({
                method: "POST",
                url: '/customer/aws/' + account_id + '/region/' + region.short + '/s3_buckets/',
                params: {'bucket_name': bucket_name}
            }).then(function (result) {
                if (result.data.hasOwnProperty('celery_task')) {
                    $scope.cancel();
                    $scope.loader = true;
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            $scope.loader = false;
                            $scope.aws_s3_buckets = result.result;
                            AlertService2.success('S3 Bucket was successfully created.');
                        }
                    }, function (error) {
                        $scope.loader = false;
                        if (error.data.result.message[0].includes('(BucketAlreadyExists)')){
                            $scope.errorMsg = 'The requested bucket name is not available, Please select a different name and try again!!';
                        }
                        else if (error.data.result.message[0].includes('(InvalidBucketName)')){
                            $scope.errorMsg = 'The requested bucket name is not valid, Please select a different name and try again!!';
                        }
                        else if (error.data.result.message[0].includes('(InvalidLocationConstraint)')){
                            $scope.errorMsg = 'The requested bucket cannot be created at this location, Please select a different location and try again!!';
                        }
                        else{
                            $scope.errorMsg = 'Something went wrong, Please try again.';
                        }
                        AlertService2.danger($scope.errorMsg);
                    });
                }
                else {
                    $scope.aws_policy_list_content = result;
                    $scope.loader = false;
                }
            }).catch(function (error) {
                AlertService2.danger();
                return error;
            });
        };

        $scope.delete_s3_bucket = function(){
            $http({
                method: "DELETE",
                url: '/customer/aws/' + account_id + '/region/' + region_name + '/s3_buckets/',
                params: {'bucket_name': $scope.selected_bucket.bucket_name, 'bucket_uuid': $scope.selected_bucket.uuid}
            }).then(function (result) {
                if (result.data.hasOwnProperty('celery_task')) {
                    $scope.cancel();
                    $scope.loader = true;
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            $scope.loader = false;
                            $scope.aws_s3_buckets = result.result;
                            AlertService2.success('S3 Bucket was successfully deleted.');
                        }
                    }, function (error) {
                        $scope.loader = false;
                        if (error.data.result.message[0].includes('(BucketNotEmpty)')){
                            $scope.errorMsg = 'Bucket deletion failed as only empty buckets can be deleted.';
                        }
                        else{
                            $scope.errorMsg = 'Something went wrong, Please try again.';
                        }
                        AlertService2.danger($scope.errorMsg);
                    });
                }
                else {
                    $scope.aws_s3_buckets = result;
                    $scope.loader = false;
                }

            }).catch(function (error) {
                AlertService2.danger('Deletion of S3 bucket failed, Please try again later.');
                return error;
            });
        };

        $scope.upload_file_s3_bucket = function(file_name){
            var formdata = new FormData();
            formdata.append('s3_file', file_name);
            formdata.append('bucket_uuid', $scope.selected_bucket.uuid);
            formdata.append('bucket_name', $scope.selected_bucket.bucket_name);
            $http.post('/customer/aws/' + account_id + '/region/' + region_name + '/s3_buckets_uploaded_files/', formdata,
                {
                    headers: {
                        'Content-Type' : undefined
                    },
                    transformRequest: angular.identity,
                }).then(function (result) {
                    if (result.data.hasOwnProperty('celery_task')) {
                        $scope.cancel();
                        $scope.loader = true;
                        TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                            if (result.state == "SUCCESS") {
                                $scope.loader = false;
                                AlertService2.success('File uploaded to S3 bucket.');
                            }
                        }, function (error) {
                            $scope.loader = false;
                            $scope.errorMsg = 'Something went wrong, Please try again.';
                            AlertService2.danger($scope.errorMsg);
                        });
                    }
                    else {
                        $scope.aws_s3_buckets = result;
                        $scope.loader = false;
                    }
                }).catch(function (error) {
                    AlertService2.danger('File upload to S3 bucket failed, Please try again later.');
                    return error;
                });
        };

        $scope.get_s3_uploaded_file_modal = function(bucket){
            console.log("%%%%%%%%%%%_________________________");
            $scope.selected_bucket = bucket;
            $scope.account_id = account_id;
            $scope.region_name = region_name;
            var modalInstance = $uibModal.open({
                templateUrl: 'uploadFileHistoryModal.html',
                scope: $scope,
                size: 'md',
                controller: 'FileUploadHistoryController'
            });
            modalInstance.result.then();
        };

        var listS3Buckets = function () {
            $scope.selected_region = region_name;
            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/region/' + region_name + '/s3_buckets/'
            }).then(function (result) {
                if (result.data.hasOwnProperty('celery_task')) {
                    $scope.loader = true;
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            $scope.loader = false;
                            $scope.aws_s3_buckets = result.result;
                        }
                    }, function (error) {
                        $scope.loader = false;
                        AlertService2.danger('Listing of S3 buckets failed, Please try again later.');
                    });
                }
                else {
                    $scope.loader = false;
                    $scope.aws_s3_buckets = result;
                }

            }).catch(function (error) {
                AlertService2.danger('Listing of S3 buckets failed, Please try again later.');
                return error;
            });
        };

        var listasgPromise = function () {
            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/region/' + region_name + '/list_auto_scaling_group/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            $scope.loader = false;
                            if (!/false,/.exec(result.result)) {
                                $scope.aws_asg_list_content = result.result;
                            }
                            else {
                                AlertService2.addAlert({
                                    msg: "Listing of Auto Scaling Groups Failed. Please try again later.",
                                    severity: 'danger'
                                });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: "Listing of Auto Scaling Groups Failed. Please try again later.",
                            severity: 'danger'
                        });
                        $scope.aws_asg_list_content = [];
                    });
                }
                else {
                    $scope.aws_asg_list_content = result;
                    $scope.loader = false;
                }

            }).catch(function (error) {
                return error;
            });
        };

        var listsecgroupPromise = function () {
            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/region/' + region_name + '/security_group/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            $scope.loader = false;
                            if (!/false,/.exec(result.result)) {
                                $scope.aws_security_group_content = result.result;
                                $scope.create_aws_instance_dropdowns.security_group = result.result.data;
                            }
                            else {
                                AlertService2.addAlert({
                                    msg: "Listing Security Group Failed. Please try again later.",
                                    severity: 'danger'
                                });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: "Listing Security Group Failed. Please try again later.",
                            severity: 'danger'
                        });
                        $scope.aws_security_group_content = [];
                    });
                }
                else {
                    $scope.aws_security_group_content = result;
                    $scope.create_aws_instance_dropdowns.security_group = result.result.data;
                    $scope.loader = false;
                }

            }).catch(function (error) {
                return error;
            });
        };

        var account_id = "";
        var region_name = "";
        var InstanceId = "";
        var manageAWSData = function (region_name, account_id) {
            var url = ClientApi.validate_aws_customer.replace(':account_id', account_id).replace(':regionname', region_name);
            AwsService.validate_aws_customer(url).then(function (result) {
                if (result.statusText == "Unauthorized") {
                    AlertService2.danger(result.data[0]);
                    $location.path("/aws-dashboard/");
                }
                var aws_region_url = ClientApi.custom_data_url.replace(':filename', 'aws_regions');

                $http({method: "GET", url: aws_region_url}).then(function (result) {
                    angular.forEach(result.data.aws_regions, function (value, key) {
                        if (value.short == region_name) {
                            $scope.region_name_float = value.long;
                        }
                    });
                }).catch(function (error) {
                    AlertService2.danger(error);
                });
            });
        };

        $scope.activetabindex = 0;
        $scope.activetab = $scope.tabs[0];
        $scope.$watch(function () {
            return $location.path();
        }, function (value) {
            $scope.tabname = value.split('/').pop();
            if ($scope.tabname === 'virtual-machines') {
                region_name = value.split('/').slice(0, -1).pop();
                account_id = value.split('/').slice(0, -1).slice(0, -1).slice(0, -1).pop();

            } else {
                region_name = angular.copy($scope.tabname);
                account_id = value.split('/').slice(0, -1).slice(0, -1).pop();
            }
            if (($stateParams.uuidp === account_id) && ($stateParams.uuidc === region_name)) {
                manageAWSData(region_name, account_id);
                load_listinstance();
                /*if($scope.tabname === 'virtual-machines'){
                 }else{
                 $scope.activetabindex = 0;
                 $scope.activetab = $scope.tabs[0];
                 load_listinstance();
                 }*/
            } else {
                return;
            }
        });

        $scope.manageInventoryTabs = function (tabdetails, index) {
            $scope.loader = true;
            $scope.activetab = $scope.tabs[index];
            $scope.activetabindex = index;
            switch (tabdetails.name) {
                case 'users' :
                    listuserPromise();
                    break;
                case 'instances' :
                    load_listinstance();
                    break;
                case 'snapshots' :
                    load_listsnapshot();
                    break;
                case 'volumes' :
                    load_listvolume();
                    break;
                case 'availablevolumes' :
                    listavailvolumePromise();
                    break;
                case 's3' :
                    listS3Buckets();
                    break;
                case 'autoscalinggroups' :
                    listasgPromise();
                    break;
                case 'securitygroups' :
                    listsecgroupPromise();
                    break;
                case 'devices' :
                    listloadbalancerPromise();
                    load_listnetinter();
                    break;
                default :
                    console.log('Something went wrong. Please try again later.');
            }
        };

        $scope.manageInventorySubTabs = function (tabdetails, index) {
            $scope.activesubtab = $scope.tabs[$scope.activetabindex].submenu[index];
            $scope.activesubtabindex = index;
            switch (tabdetails.name) {
                case 'loadbalancers' :
                    listloadbalancerPromise();
                    break;
                case 'networkinterfaces' :
                    load_listnetinter();
                    break;
                default :
                    console.log('Something went wrong. Please try again later.');
            }
        };

        var modalInstance = '';
        var showmodel = function (templete, controllername) {
            $scope.loader = false;
            modalInstance = $uibModal.open({
                templateUrl: templete,
                controller: controllername,
                scope: $scope,
            });

            modalInstance.result.then(function (selectedItem) {
                console.log('Modal dismissed with: ', selectedItem);
                $scope.selected = selectedItem;
            }, function () {
                console.log('Modal dismissed with no selection');
            });
        };

        /*$scope.cancel = function(){
         console.log('in cancel method');
         modalInstance.dismiss('cancel');
         };*/

        $scope.showUserGroups = function (userdetails) {
            $scope.loader = true;
            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/region/' + region_name + '/user/' + userdetails.UserName + '/user_group/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            $scope.loader = false;
                            if (!/false,/.exec(result.result)) {
                                $scope.user_name_group = userdetails.UserName;
                                $scope.aws_usergroup_list_headers = TableHeaders.aws_usergroup_list_headers;
                                $scope.aws_usergroup_list_content = result.result;
                                showmodel('static/rest/app/client/templates/aws/aws_user_group.html');
                            } else {
                                AlertService2.addAlert({
                                    msg: "Listing User Group Failed. Please try again later.",
                                    severity: 'danger'
                                });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: "Listing User Group Failed. Please try again later.",
                            severity: 'danger'
                        });
                        $scope.aws_usergroup_list_content = error;
                    });
                }
                else {
                    $scope.loader = false;
                    $scope.aws_usergroup_list_content = result;
                }

            }).catch(function (error) {
                $scope.loader = false;
                return error;
            });
        };

        $scope.showUserData = function (userdetails) {
            $scope.aws_userdetails_list_content = userdetails;
            showmodel('static/rest/app/client/templates/aws/aws_user_details.html', 'CustomerAwsUserController');
        };

        $scope.aws_switches = function (args) {
            console.log('in aws_switches, args : ', angular.toJson(args));
            var instance_id = args['instance_id'];
            if (args.method == "awspoweron") {
                $scope.loader = true;
                var url = ClientApi.aws_poweron.replace(":account_id", account_id).replace(":regionname", region_name).replace(":instanceid", args['instance_id']);
                var params = '';
                RestService.send_modal_data(params, url).then(function (result) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                AlertService2.addAlert({
                                    msg: "Started " + instance_id + " Successfully",
                                    severity: 'success'
                                });
                                $scope.aws_instance_list_content = "";
                                load_listinstance(region_name);
                                $timeout(function () {
                                    $scope.aws_instance_list_content = "";
                                    load_listinstance(region_name);
                                }, 60000);
                                $scope.loader = false;
                            } else {
                                $scope.loader = false;
                                AlertService2.addAlert({
                                    msg: "Starting " + instance_id + " Failed. Please try again later.",
                                    severity: 'danger'
                                });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: "Starting " + instance_id + " Failed. Please try again later.",
                            severity: 'danger'
                        });
                    });
                });
            } else if (args.method == "awspoweroff") {
                $scope.loader = true;
                var url = ClientApi.aws_poweroff.replace(":account_id", account_id).replace(":regionname", region_name).replace(":instanceid", args['instance_id']);
                var params = '';
                RestService.send_modal_data(params, url).then(function (result) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                AlertService2.addAlert({
                                    msg: "Stopped " + instance_id + " Successfully",
                                    severity: 'success'
                                });
                                $scope.aws_instance_list_content = "";
                                load_listinstance(region_name);
                                $timeout(function () {
                                    $scope.aws_instance_list_content = "";
                                    load_listinstance(region_name);
                                }, 60000);
                                $scope.loader = false;
                            } else {
                                $scope.loader = false;
                                AlertService2.addAlert({
                                    msg: "Stopping " + instance_id + " Failed. Please try again later.",
                                    severity: 'danger'
                                });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: "Stopping " + instance_id + " Failed. Please try again later.",
                            severity: 'danger'
                        });
                    });

                });

            } else if (args.method == "awsterminate") {
                $scope.loader = true;
                var url = ClientApi.aws_terminate.replace(":account_id", account_id).replace(":regionname", region_name).replace(":instanceid", args['instance_id']);
                var params = '';
                RestService.send_modal_data(params, url).then(function (result) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                AlertService2.addAlert({
                                    msg: "Terminated " + instance_id + " Successfully",
                                    severity: 'success'
                                });
                                $scope.aws_instance_list_content = "";
                                //$scope.aws_volume_list_content = "";
                                load_listinstance(region_name);
                                //load_listvolume(region_name);
                                $timeout(function () {
                                    $scope.aws_instance_list_content = "";
                                    load_listinstance(region_name);
                                    //$scope.aws_volume_list_content = "";
                                    //load_listvolume(region_name);
                                }, 60000);
                                $scope.loader = false;
                            } else {
                                $scope.loader = false;
                                AlertService2.addAlert({
                                    msg: "Terminating " + instance_id + " Failed. Please try again later.",
                                    severity: 'danger'
                                });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: "Terminating " + instance_id + " Failed. Please try again later.",
                            severity: 'danger'
                        });
                    });
                });
            } else if (args.method == "showentities") {
                $scope.loader = true;
                var url = ClientApi.get_entities.replace(":account_id", account_id).replace(":regionname", region_name);
                var params = '{"arn":"' + args['arn'] + '"}';
                RestService.send_modal_data(params, url).then(function (result) {
                    //$location.path('/aws/' + account_id + '/aws-region/' + region_name + '/showentities/');
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                $rootScope.aws_entities_list_content = result.result;
                                showmodel('static/rest/app/client/templates/aws/aws_entities.html', 'CustomerAwsUserController');
                            } else {
                                $scope.loader = false;
                                AlertService2.addAlert({
                                    msg: "Listing Entities Failed. Please try again later.",
                                    severity: 'danger'
                                });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: "Listing Entities Failed. Please try again later.",
                            severity: 'danger'
                        });
                    });
                });
            } else if (args.method == "attachinstance") {
                var url = ClientApi.get_asg_list_data.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", instance_id);
                RestService.get_data(url).then(function (result) {
                    if (result.status == 200) {
                        $scope.aws_attachinstance_dropdowns.autoscaling_group = result.data.data;
                    }
                });
            } else if (args.method == "attachinterface") {
                var url = ClientApi.get_network_interface_list.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", instance_id);
                RestService.get_data(url).then(function (result) {
                    if (result.status == 200) {
                        $scope.aws_attachinterface_dropdowns.network_interface_list = result.data.data;
                    }
                });
            } else if (args.method == "attachloadbalancer") {
                var url = ClientApi.get_loadbalancer_list.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", instance_id);
                RestService.get_data(url).then(function (result) {
                    if (result.status == 200) {
                        $scope.aws_attachloadbalancer_dropdowns.loadbalancer_list = result.data.data;
                    }
                });
            }
            else if (args.method == "cloneinstance") {
                $scope.loader = true;
                var name = new Date().getTime();
                var url = ClientApi.add_aws_image.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", args['instance_id']);
                var params = '{"name": "Image' + name + '","description": "Image' + name + '"}';
                RestService.send_modal_data(params, url).then(function (result) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            $scope.loader = false;
                            if (!/false,/.exec(result.result)) {
                                $scope.create_aws_instance_dropdowns.image_id = result.result.data.ImageId;
                            } else {
                                AlertService2.addAlert({
                                    msg: "Clone Failed",
                                    severity: 'danger'
                                });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.loader = false;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: error.data.result.message[0],
                            severity: 'danger'
                        });
                    });
                });
            }
            else if (args.method == "showinstancedetails") {
                $scope.loader = true;
                $http({
                    method: "GET",
                    url: '/customer/aws/' + account_id + '/region/' + region_name + '/instance/' + instance_id + '/instance_detail/'
                }).then(function (result) {
                    var obj = {
                        data: null
                    };
                    if (result.data.hasOwnProperty('celery_task')) {
                        TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                            if (result.state == "SUCCESS") {
                                if (!/false,/.exec(result.result)) {
                                    $scope.aws_instance_details_list_content = result.result.data[0];
                                    showmodel('static/rest/app/client/templates/aws/aws_instance_detail.html');
                                }
                                else {
                                    $scope.loader = false;
                                    AlertService2.addAlert({msg: result.data.result.message[0], severity: 'danger'});
                                }
                            }
                        }, function (error) {
                            $scope.error = true;
                            $scope.loader = false;
                            $scope.errorMsg = error.error + " " + error.message;
                            AlertService2.addAlert({msg: error.data.result.message[0], severity: 'danger'});
                            $scope.aws_instance_details_list_content = error;
                        });
                    }
                    else {
                        $scope.loader = false;
                        $scope.aws_instance_details_list_content = result.data[0];
                    }

                }).catch(function (error) {
                    $scope.loader = false;
                    return error;
                });
            }
        };

        $scope.obj = {};
        $scope.show_copy_snapshot_modal = false;
        $scope.show_create_instance_modal = false;
        $scope.show_create_image_modal = false;
        $scope.show_clone_instance_modal = false;
        $scope.show_asg_modal = false;
        $scope.show_nw_interface_modal = false;
        $scope.show_lb_modal = false;
        $scope.show_delete_confirm = false;

        $scope.popoverobj = {
            templateUrl: 'instancedetailstemplate.html',
        };

        $scope.cancel = function (method) {
            if (angular.isDefined($scope.method) && ($scope.method !== 'Show')) {
                $scope.show_create_instance_modal = !$scope.show_create_instance_modal;
            } else {
                modalInstance.dismiss('cancel');
            }
        };

        $scope.cancel1 = function () {
            switch ($scope.method) {
                case 'Copy':
                    $scope.show_copy_snapshot_modal = !$scope.show_copy_snapshot_modal;
                    break;
                case 'Add':
                    $scope.show_clone_instance_modal = !$scope.show_clone_instance_modal;
                    break;
                default :
                    console.log('something went wrong : please try again later.....');
            }
        };

        $scope.cancel2 = function () {
            $scope.show_change_password_modal = !$scope.show_change_password_modal;
        };

        $scope.cancel3 = function () {
            $scope.show_create_image_modal = !$scope.show_create_image_modal;
        };

        $scope.cancel4 = function () {
            $scope.show_asg_modal = !$scope.show_asg_modal;
        };

        $scope.cancel5 = function () {
            $scope.show_nw_interface_modal = !$scope.show_nw_interface_modal;
        };

        $scope.cancel6 = function () {
            $scope.show_lb_modal = !$scope.show_lb_modal;
        };

        $scope.cancel_delete = function (method) {
            $scope.show_delete_confirm = !$scope.show_delete_confirm;
        };

        $scope.add_account_model = function () {
            $scope.method = 'Add';
            $scope.isClone = false;
            $scope.keypair_list_show = false;
            $scope.modeldata = angular.copy($scope.aws_create_instance_modaldata);
            $scope.rows = angular.copy($scope.create_aws_instance_dropdowns);

            $scope.obj = {};
            $scope.show_create_instance_modal = !$scope.show_create_instance_modal;
        };

        $scope.delete = function () {
            $scope.obj = $scope.aws_switches(angular.copy($scope.obj));
            $scope.cancel_delete();
        };

        $scope.aws_instance_ops_modal = function (operaion, aws_instance) {
            aws_instance.method = operaion;
            $scope.deleteconfirm = angular.copy($scope.aws_vm_operations);

            $scope.obj = {};
            $scope.obj.instance_id = angular.copy(aws_instance.instance_id);
            $scope.obj.method = angular.copy(aws_instance.method);
            $scope.show_delete_confirm = !$scope.show_delete_confirm;
        };

        $scope.create_instance_image_modal = function (operaion, aws_instance) {
            $scope.method = 'Add';
            aws_instance.method = "createimage";
            $scope.modeldata3 = angular.copy($scope.aws_create_image_modaldata);

            $scope.obj = {};
            $scope.obj.instance_id = aws_instance.instance_id;
            $scope.show_create_image_modal = !$scope.show_create_image_modal;
        };

        $scope.clone_instance_modal = function (operaion, aws_instance) {
            aws_instance.method = "cloneinstance";
            $scope.aws_switches(aws_instance);
            $scope.method = 'Add';
            $scope.isClone = true;
            $scope.rows = angular.copy($scope.create_aws_instance_dropdowns);
            $scope.modeldata1 = angular.copy($scope.aws_clone_instance_modaldata);

            $scope.obj = {};
            $scope.obj = {max_count: 1, instance_type: "t2.micro"};
            $scope.obj.image_id = angular.copy($scope.create_aws_instance_dropdowns.image_id);
            $scope.show_clone_instance_modal = !$scope.show_clone_instance_modal;
        };

        $scope.asg_modal = function (operaion, aws_instance) {
            $scope.method = 'Attach';
            $scope.modeldata4 = angular.copy($scope.aws_attachinstance_modaldata);
            $scope.rows4 = angular.copy($scope.aws_attachinstance_dropdowns);
            aws_instance.method = "attachinstance";
            $scope.aws_switches(aws_instance);

            $scope.obj = {};
            $scope.obj.instance_id = aws_instance.instance_id;
            $scope.show_asg_modal = !$scope.show_asg_modal;
        };

        $scope.attach_nw_interface_modal = function (operaion, aws_instance) {
            $scope.method = 'Attach';
            $scope.modeldata5 = angular.copy($scope.aws_attachinterface_modaldata);
            $scope.rows5 = angular.copy($scope.aws_attachinterface_dropdowns);
            aws_instance.method = "attachinterface";
            $scope.aws_switches(aws_instance);

            $scope.obj = {};
            $scope.obj.instance_id = aws_instance.instance_id;
            $scope.show_nw_interface_modal = !$scope.show_nw_interface_modal;
        };

        $scope.attch_lb_modal = function (operaion, aws_instance) {
            $scope.method = 'Attach';
            $scope.modeldata6 = angular.copy($scope.aws_attachloadbalancer_modaldata);
            $scope.rows6 = angular.copy($scope.aws_attachloadbalancer_dropdowns);
            aws_instance.method = "attachloadbalancer";
            $scope.aws_switches(aws_instance);
            console.log('rows6 : ', angular.toJson($scope.rows6));

            $scope.obj = {};
            $scope.obj.instance_id = aws_instance.instance_id;
            $scope.show_lb_modal = !$scope.show_lb_modal;
        };

        $scope.instance_deatils_modal = function (operaion, aws_instance) {
            $scope.method = 'Show';
            aws_instance.method = "showinstancedetails";

            $scope.obj = {};
            $scope.obj.instance_id = aws_instance.instance_id;
            $scope.aws_switches(aws_instance);
        };

        $scope.copy_snapshot_modal = function (aws_snapshot) {
            $scope.method = 'Copy';
            aws_snapshot.method = "snapshot";
            $scope.modeldata1 = angular.copy($scope.aws_snapshot_list_modeldata);
            $scope.rows = angular.copy($scope.aws_snapshot_list_rows);

            $scope.obj = {};
            $scope.obj.SnapshotId = aws_snapshot.SnapshotId;
            $scope.show_copy_snapshot_modal = !$scope.show_copy_snapshot_modal;
        };

        $scope.entities_modal = function (aws_policy) {
            aws_policy.method = "showentities";
            $scope.aws_switches(aws_policy);
        };

        $scope.add = function () {
            if ($scope.obj.keypair_behavior !== undefined && $scope.obj.keypair_behavior == 'b') {
                if ($scope.obj.keypairname === undefined) {
                    $scope.obj.keypairnameMsg = 'Key Pair name is required.';
                    return;
                } else {
                    $scope.obj.keypairname = $scope.obj.keypairname['KeyName'];
                }
            }
            $scope.obj = $scope.aws_instance_add(angular.copy($scope.obj));
            if ($scope.obj.hasOwnProperty("success")) {
                $scope.cancel();
            }
        };

        $scope.add1 = function () {
            switch ($scope.method) {
                case 'Copy':
                    $scope.obj = $scope.aws_copy_snapshot(angular.copy($scope.obj));
                    if ($scope.obj.hasOwnProperty("success")) {
                        $scope.cancel1();
                    }
                    break;
                case 'Add':
                    $scope.obj = $scope.aws_copy_snapshot(angular.copy($scope.obj));
                    if ($scope.obj.hasOwnProperty("success")) {
                        $scope.cancel1();
                    }
                    break;
                default :
                    console.log('something went wrong : please try again later.....');
            }
        };

        $scope.add3 = function () {
            switch ($scope.method) {
                case 'Add':
                    $scope.obj = $scope.aws_image_add(angular.copy($scope.obj));
                    if ($scope.obj.hasOwnProperty("success")) {
                        $scope.cancel3();
                    }
                    break;
                default :
                    console.log('something went wrong : please try again later.....');
            }
        };

        $scope.add4 = function () {
            switch ($scope.method) {
                case 'Attach':
                    $scope.obj = $scope.attach_autoscaling_group(angular.copy($scope.obj));
                    if ($scope.obj.hasOwnProperty("success")) {
                        $scope.cancel4();
                    }
                    break;
                default :
                    console.log('something went wrong : please try again later.....');
            }
        };

        $scope.add5 = function () {
            switch ($scope.method) {
                case 'Attach':
                    $scope.obj = $scope.attach_network_interface(angular.copy($scope.obj));
                    if ($scope.obj.hasOwnProperty("success")) {
                        $scope.cancel5();
                    }
                    break;
                default :
                    console.log('something went wrong : please try again later.....');
            }
        };

        $scope.add6 = function () {
            switch ($scope.method) {
                case 'Attach':
                    $scope.obj = $scope.attach_loadbalancer(angular.copy($scope.obj));
                    if ($scope.obj.hasOwnProperty("success")) {
                        $scope.cancel6();
                    }
                    break;
                default :
                    console.log('something went wrong : please try again later.....');
            }
        };

        $scope.show_observium_details = function (instance) {
            $scope.instance_details = instance.observium_details;
        };
    }
]);

app.controller('FileUploadHistoryController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$stateParams',
    'AlertService2',
    'TaskService',
    function ($scope, $uibModalInstance, $http, $stateParams, AlertService2, TaskService) {
        console.log("Inside FileUploadHistoryController ");
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
        $http({
            method: "GET",
            url: '/customer/aws/' + $scope.account_id + '/region/' + $scope.region_name + '/s3_buckets_uploaded_files/',
            params: {'bucket_uuid': $scope.selected_bucket.uuid}
        }).then(function (result) {
            if (result.data.hasOwnProperty('celery_task')) {
                $scope.loader = true;
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        $scope.loader = false;
                        $scope.s3_bucket_files = result.result;
                    }
                }, function (error) {
                    $scope.loader = false;
                    AlertService2.danger('Listing of S3 bucket files failed, Please try again later.');
                });
            }
            else {
                $scope.loader = false;
                $scope.s3_bucket_files = result.data.results;
            }

        }).catch(function (error) {
            AlertService2.danger('Listing of S3 bucket files failed, Please try again later.');
            return error;
        });
    }
]);
