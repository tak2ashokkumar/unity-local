var app = angular.module('uldb');
app.controller('AwsController', [
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
    'AwsService',
    'TaskService',
    'AdminApi',
    'AbstractControllerFactoryV3',
    'TableHeaders',
    'DataFormattingService',
    'RestService',
    'AlertService2',
    'ValidationService',
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
              AwsService,
              TaskService,
              AdminApi,
              AbstractControllerFactoryV3,
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
        $scope.aws_policy_list_headers = TableHeaders.aws_policy_list_headers;
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
        $scope.bread = BreadCrumbService;
        if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
        var get_aws_template = function (name) {
            return AdminApi.create_modal.replace(":name", name);
        };
        var account_id = "";
        var region_name = "";
        var InstanceId = "";
        if (($routeParams["account_id"] != undefined && $routeParams["account_id"] != "") && ($routeParams["name"] != undefined && $routeParams["name"] != "")) {
            account_id = $routeParams["account_id"];
            region_name = $routeParams["name"];
            var url = AdminApi.validate_aws_customer.replace(':account_id', account_id).replace(':regionname', region_name);
            AwsService.validate_aws_customer(url).then(function (result) {
                if (result.statusText == "Unauthorized") {
                    AlertService2.addAlert({ msg: result.data[0], severity: 'danger' });
                    $location.path("/aws-dashboard/");
                }
            });
            $scope.region_name_float = region_name;
        }
        if ($routeParams["instanceid"] != undefined) {
            var instanceid = $routeParams["instanceid"];
        }
        $scope.aws_switches = function (args) {
            var instance_id = args['instance_id'];
            if (args.method == "awspoweron") {
                var url = AdminApi.aws_poweron.replace(":account_id", account_id).replace(":regionname", region_name).replace(":instanceid", args['instance_id']);
                var params = '';
                RestService.send_modal_data(params, url).then(function (result) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                AlertService2.addAlert({ msg: "Started " + instance_id + " Successfully", severity: 'success' });
                                $scope.aws_instance_list_content = "";
                                load_listinstance(region_name);
                                $timeout(function () {
                                    $scope.aws_instance_list_content = "";
                                    load_listinstance(region_name);
                                }, 60000);
                            } else {
                                AlertService2.addAlert({ msg: "Starting " + instance_id + " Failed", severity: 'danger' });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                    });
                });
            } else if (args.method == "awspoweroff") {
                var url = AdminApi.aws_poweroff.replace(":account_id", account_id).replace(":regionname", region_name).replace(":instanceid", args['instance_id']);
                var params = '';
                RestService.send_modal_data(params, url).then(function (result) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                AlertService2.addAlert({ msg: "Stopped " + instance_id + " Successfully", severity: 'success' });
                                $scope.aws_instance_list_content = "";
                                load_listinstance(region_name);
                                $timeout(function () {
                                    $scope.aws_instance_list_content = "";
                                    load_listinstance(region_name);
                                }, 60000);
                            } else {
                                AlertService2.addAlert({ msg: "Stopping " + instance_id + " Failed", severity: 'danger' });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                    });
                });
            } else if (args.method == "awsterminate") {
                var url = AdminApi.aws_terminate.replace(":account_id", account_id).replace(":regionname", region_name).replace(":instanceid", args['instance_id']);
                var params = '';
                RestService.send_modal_data(params, url).then(function (result) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                AlertService2.addAlert({ msg: "Terminated " + instance_id + " Successfully", severity: 'success' });
                                $scope.aws_instance_list_content = "";
                                $scope.aws_volume_list_content = "";
                                load_listinstance(region_name);
                                load_listvolume(region_name);
                                $timeout(function () {
                                    $scope.aws_instance_list_content = "";
                                    $scope.aws_volume_list_content = "";
                                    load_listinstance(region_name);
                                    load_listvolume(region_name);
                                }, 60000);
                            } else {
                                AlertService2.addAlert({ msg: "Terminating " + instance_id + " Failed", severity: 'danger' });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                    });
                });
            } else if (args.method == "showentities") {
                var url = AdminApi.get_entities.replace(":account_id", account_id).replace(":regionname", region_name);
                var params = '{"arn":"' + args['arn'] + '"}';
                RestService.send_modal_data(params, url).then(function (result) {
                    $location.path('/aws/' + account_id + '/aws-region/' + region_name + '/showentities/');
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                $rootScope.aws_entities_list_content = result.result;
                            } else {
                                AlertService2.addAlert({ msg: "Listing Entities Failed", severity: 'danger' });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                    });
                });
            } else if (args.method == "attachinstance") {
                var url = AdminApi.get_asg_list_data.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", instance_id);
                RestService.get_data(url).then(function (result) {
                    if (result.status == 200) {
                        $scope.aws_attachinstance_dropdowns.autoscaling_group = result.data.data;
                    }
                });
            } else if (args.method == "attachinterface") {
                var url = AdminApi.get_network_interface_list.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", instance_id);
                RestService.get_data(url).then(function (result) {
                    if (result.status == 200) {
                        $scope.aws_attachinterface_dropdowns.network_interface_list = result.data.data;
                    }
                });
            } else if (args.method == "attachloadbalancer") {
                var url = AdminApi.get_loadbalancer_list.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", instance_id);
                RestService.get_data(url).then(function (result) {
                    if (result.status == 200) {
                        $scope.aws_attachloadbalancer_dropdowns.loadbalancer_list = result.data.data;
                    }
                });
            }
            else if (args.method == "cloneinstance") {
                var name = new Date().getTime();
                var url = AdminApi.add_aws_image.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", args['instance_id']);
                var params = '{"name": "Image' + name + '","description": "Image' + name + '"}';
                RestService.send_modal_data(params, url).then(function (result) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
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
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({
                            msg: error.data.result.message[0],
                            severity: 'danger'
                        });
                    });
                });
            }
        };

        // var default_ami = [{"name":"Ubuntu Server 16.04 LTS (HVM), SSD Volume Type","id":"ami-835b4efa"},
        //                    {"name":"Ubuntu Server 14.04 LTS (HVM), SSD Volume Type","id":"ami-d94f5aa0"},
        //                    {"name":"Red Hat Enterprise Linux 7.3 (HVM), SSD Volume Type","id":"ami-b55a51cc"},
        //                    {"name":"Amazon Linux AMI 2017.03.1 (HVM), SSD Volume Type","id":"ami-6df1e514"},
        //                    {"name":"Amazon Linux AMI 2017.03.1 (PV)","id":"ami-98f3e7e1"},
        //                    {"name":"Microsoft Windows Server 2016 Base","id":" ami-3c4b4145"},
        //                    {"name":"Microsoft Windows Server 2012 R2 Base","id":"ami-8d0c07f4"},
        //                    {"name":"SUSE Linux Enterprise Server 12 SP2 (HVM), SSD Volume Type","id":"ami-e4a30084"},
        // ];

        var load_listinstance = function load_listinstance() {

            var images_url = AdminApi.get_images_list.replace(":account_id", account_id).replace(":name", region_name);
            $http({
                method: "GET",
                url: images_url
            }).then(function (result) {
                if (result.status == 200) {
                    // var final_list_amis = angular.extend(result.data, default_ami);
                    $scope.create_aws_instance_dropdowns.images_list = result.data;
                }
            });

            $http({
                method: "GET",
                url: '/rest/v3/aws/' + account_id + '/region/' + region_name + '/instance_launch_data/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                $scope.create_aws_instance_dropdowns = result;
                                $scope.create_aws_instance_dropdowns.instance_type = AwsService.get_instance_type("aws_instance_dropdowns_instance_type");
                            } else {
                                AlertService2.addAlert({ msg: result.data.result.message[0], severity: 'danger' });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                        $scope.create_aws_instance_dropdowns = error;
                    });
                }
                else {
                    $scope.create_aws_instance_dropdowns = result;
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
                url: '/rest/v3/aws/' + account_id + '/region/' + region_name + '/instance/'
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
                                    { "name": "Start", "button": "awspoweron" },
                                    { "name": "Stop", "button": "awspoweroff" },
                                    { "name": "Terminate", "button": "awsterminate" },
                                    { "name": "Create Image", "button": "createimage" },
                                    { "name": "Clone", "button": "cloneinstance" },
                                    { "name": "Attach Autoscaling Group", "button": "attachinstance" },
                                    { "name": "Attach Network Interface", "button": "attachinterface" },
                                    { "name": "Attach Load Balancer", "button": "attachloadbalancer" },
                                    {
                                        "name": "Details",
                                        "link": "#/aws/" + account_id + "/aws-region/" + region_name + "/instance-details/"
                                    }
                                ];
                            } else {
                                AlertService2.addAlert({ msg: "Listing Instance Failed", severity: 'danger' });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                        $scope.aws_instance_list_content = error;
                    });
                }
                else {
                    $scope.aws_instance_list_content = result;
                    $scope.aws_instance_list_content.actions = [
                        { "name": "Start", "button": "awspoweron" },
                        { "name": "Stop", "button": "awspoweroff" },
                        { "name": "Terminate", "button": "awsterminate" },
                        { "name": "Create Image", "link": "#/aws/" + account_id + "/aws-region/" + region_name + "/createimage/" },
                        { "name": "Clone", "button": "cloneinstance" },
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
                        { "name": "Details", "link": "#/aws/" + account_id + "/aws-region/" + region_name + "/instance-details/" }
                    ];
                }

            }).catch(function (error) {
                return error;
            });

        };
        var load_listsnapshot = function load_listsnapshot() {
            $http({
                method: "GET",
                url: '/rest/v3/aws/' + account_id + '/region/' + region_name + '/snapshot/'
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
                                    { "name": "Copy Snapshot", "button": "snapshot" }
                                ];
                            } else {
                                AlertService2.addAlert({ msg: "Listing Snapshot Failed", severity: 'danger' });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                        $scope.aws_snapshot_list_content = error;
                    });
                }
                else {
                    $scope.aws_snapshot_list_content = result;
                    $scope.aws_snapshot_list_content.actions = [
                        { "name": "Copy Snapshot", "button": "snapshot" }

                    ];
                }

            }).catch(function (error) {
                return error;
            });
        };
        var load_listvolume = function load_listvolume() {
            $http({
                method: "GET",
                url: '/rest/v3/aws/' + account_id + '/region/' + region_name + '/volume/'
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
                                AlertService2.addAlert({ msg: "Listing Volume Failed", severity: 'danger' });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                        $scope.aws_volume_list_content = error;
                    });
                }
                else {
                    $scope.aws_volume_list_content = result;
                }

            }).catch(function (error) {
                return error;
            });

        };
        var load_listnetinter = function load_listnetinter() {
            $http({
                method: "GET",
                url: '/rest/v3/aws/' + account_id + '/region/' + region_name + '/list_network_interface/'
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
                                AlertService2.addAlert({ msg: "Listing Network Interfaces Failed", severity: 'danger' });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                        $scope.aws_netinter_list_content = error;
                    });
                }
                else {
                    $scope.aws_netinter_list_content = result;
                }

            }).catch(function (error) {
                return error;
            });
        };

        if (/instance-details/.exec($location.absUrl())) {
            $http({
                method: "GET",
                url: '/rest/v3/aws/' + account_id + '/region/' + region_name + '/instance/' + instanceid + '/instance_detail/'
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            if (!/false,/.exec(result.result)) {
                                $scope.aws_instance_details_list_content = result.result.data[0];
                            }
                            else {
                                AlertService2.addAlert({ msg: result.data.result.message[0], severity: 'danger' });
                            }
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                        $scope.aws_instance_details_list_content = error;
                    });
                }
                else {
                    $scope.aws_instance_details_list_content = result.data[0];
                }

            }).catch(function (error) {
                return error;
            });

        } else if ($routeParams['name'] != undefined && $routeParams["username"] == undefined && !/showentities/.exec($location.absUrl())) {
            load_listinstance();

            if (!/virtual-machines/.exec($location.absUrl())) {
                load_listsnapshot();
                load_listvolume();
                load_listnetinter();

                var listuserPromise = function listuserPromise() {
                    $http({
                        method: "GET",
                        url: '/rest/v3/aws/' + account_id + '/region/' + region_name + '/user/'
                    }).then(function (result) {
                        var obj = {
                            data: null
                        };
                        if (result.data.hasOwnProperty('celery_task')) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                                if (result.state == "SUCCESS") {
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
                                    }
                                    else {
                                        AlertService2.addAlert({ msg: "Listing User Failed", severity: 'danger' });
                                    }
                                }
                            }, function (error) {
                                $scope.error = true;
                                $scope.errorMsg = error.error + " " + error.message;
                                AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                                $scope.aws_user_list_content = error;
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
                        }

                    }).catch(function (error) {
                        return error;
                    });
                };
                listuserPromise();

                var listavailvolumePromise = function listavailvolumePromise() {
                    $http({
                        method: "GET",
                        url: '/rest/v3/aws/' + account_id + '/region/' + region_name + '/list_available_volume/'
                    }).then(function (result) {
                        var obj = {
                            data: null
                        };
                        if (result.data.hasOwnProperty('celery_task')) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                                if (result.state == "SUCCESS") {
                                    if (!/false,/.exec(result.result)) {
                                        $scope.aws_availablevolume_list_content = result.result;
                                    }
                                    else {
                                        AlertService2.addAlert({ msg: "Listing Available Volume Failed", severity: 'danger' });
                                    }
                                }
                            }, function (error) {
                                $scope.error = true;
                                $scope.errorMsg = error.error + " " + error.message;
                                AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                                $scope.aws_availablevolume_list_content = error;
                            });
                        }
                        else {
                            $scope.aws_availablevolume_list_content = result;
                        }

                    }).catch(function (error) {
                        return error;
                    });
                };
                listavailvolumePromise();

                var listloadbalancerPromise = function listloadbalancerPromise() {
                    $http({
                        method: "GET",
                        url: '/rest/v3/aws/' + account_id + '/region/' + region_name + '/load_balancer/'
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
                                        AlertService2.addAlert({ msg: "Listing Load Balancers Failed", severity: 'danger' });
                                    }
                                }
                            }, function (error) {
                                $scope.error = true;
                                $scope.errorMsg = error.error + " " + error.message;
                                AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                                $scope.aws_loadbalancer_list_content = error;
                            });
                        }
                        else {
                            $scope.aws_loadbalancer_list_content = result;
                        }

                    }).catch(function (error) {
                        return error;
                    });
                };
                listloadbalancerPromise();

                var listpolicyPromise = function listpolicyPromise() {
                    $http({
                        method: "GET",
                        url: '/rest/v3/aws/' + account_id + '/region/' + region_name + '/list_policies/'
                    }).then(function (result) {
                        var obj = {
                            data: null
                        };
                        if (result.data.hasOwnProperty('celery_task')) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                                if (result.state == "SUCCESS") {
                                    if (!/false,/.exec(result.result)) {
                                        $scope.aws_policy_list_content = result.result;
                                        $scope.aws_policy_list_content.actions = [
                                            { "name": "Show Entities", "button": "showentities" }
                                        ];
                                    }
                                    else {
                                        AlertService2.addAlert({ msg: "Listing Policies Failed", severity: 'danger' });
                                    }
                                }
                            }, function (error) {
                                $scope.error = true;
                                $scope.errorMsg = error.error + " " + error.message;
                                AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                                $scope.aws_policy_list_content = error;
                            });
                        }
                        else {
                            $scope.aws_policy_list_content = result;
                            $scope.aws_policy_list_content.actions = [
                                { "name": "Show Entities", "button": "showentities" }
                            ];
                        }

                    }).catch(function (error) {
                        return error;
                    });
                };
                listpolicyPromise();

                var listasgPromise = function listasgPromise() {
                    $http({
                        method: "GET",
                        url: '/rest/v3/aws/' + account_id + '/region/' + region_name + '/list_auto_scaling_group/'
                    }).then(function (result) {
                        var obj = {
                            data: null
                        };
                        if (result.data.hasOwnProperty('celery_task')) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                                if (result.state == "SUCCESS") {
                                    if (!/false,/.exec(result.result)) {
                                        $scope.aws_asg_list_content = result.result;
                                    }
                                    else {
                                        AlertService2.addAlert({ msg: "Listing ASG Failed", severity: 'danger' });
                                    }
                                }
                            }, function (error) {
                                $scope.error = true;
                                $scope.errorMsg = error.error + " " + error.message;
                                AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                                $scope.aws_asg_list_content = error;
                            });
                        }
                        else {
                            $scope.aws_asg_list_content = result;
                        }

                    }).catch(function (error) {
                        return error;
                    });
                };
                listasgPromise();

                var listsecgroupPromise = function listsecgroupPromise() {
                    $http({
                        method: "GET",
                        url: '/rest/v3/aws/' + account_id + '/region/' + region_name + '/security_group/'
                    }).then(function (result) {
                        var obj = {
                            data: null
                        };
                        if (result.data.hasOwnProperty('celery_task')) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                                if (result.state == "SUCCESS") {
                                    if (!/false,/.exec(result.result)) {
                                        $scope.aws_security_group_content = result.result;
                                    }
                                    else {
                                        AlertService2.addAlert({ msg: "Listing Security Group Failed", severity: 'danger' });
                                    }
                                }
                            }, function (error) {
                                $scope.error = true;
                                $scope.errorMsg = error.error + " " + error.message;
                                AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                                $scope.aws_security_group_content = error;
                            });
                        }
                        else {
                            $scope.aws_security_group_content = result;
                        }

                    }).catch(function (error) {
                        return error;
                    });
                };
                listsecgroupPromise();
            }

        }

        $scope.aws_image_add = function (params) {
            var valid = ValidationService.validate_data(params, $scope.aws_create_image_rows);
            if (!valid.is_validated) {
                return valid;
            }
            var url = AdminApi.add_aws_image.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", params.instance_id);
            RestService.send_modal_data(params, url).then(function (result) {
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        if (!/false,/.exec(result.result)) {
                            AlertService2.addAlert({ msg: "Image Added Successfully", severity: 'success' });
                            $scope.aws_instance_list_content = "";
                            load_listinstance(region_name);
                        } else {
                            AlertService2.addAlert({ msg: "Image Addition Failed", severity: 'danger' });
                        }
                    }
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                });
            });
            var response_obj = { "success": "Added Successfuly" };
            return response_obj;
        };

        $scope.aws_instance_add = function (params) {
            var valid = ValidationService.validate_data(params, $scope.aws_create_instance_rows);
            if (!valid.is_validated) {
                return valid;
            }
            var url = AdminApi.launch_instance.replace(":account_id", account_id).replace(":name", region_name);
            RestService.send_modal_data(params, url).then(function (result) {
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        if (!/false,/.exec(result.result)) {
                            AlertService2.addAlert({ msg: "Instance Created Successfully", severity: 'success' });
                            $scope.aws_instance_list_content = "";
                            $scope.aws_volume_list_content = "";
                            $scope.aws_netinter_list_content = "";
                            load_listinstance(region_name);
                            load_listvolume(region_name);
                            load_listnetinter(region_name);
                            $timeout(function () {
                                $scope.aws_instance_list_content = "";
                                load_listinstance(region_name);
                            }, 60000);
                        }
                        else {
                            AlertService2.addAlert({ msg: "Instance Creation Failed", severity: 'danger' });
                        }
                    }
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                });
            });
            var response_obj = { "success": "Added Successfuly" };
            return response_obj;
        };

        $scope.aws_clone_instance_add = function (params) {
            var valid = ValidationService.validate_data(params, $scope.aws_create_instance_rows);
            if (!valid.is_validated) {
                return valid;
            }
            var url = AdminApi.launch_instance.replace(":account_id", account_id).replace(":name", region_name);
            params.image_id = $scope.create_aws_instance_dropdowns.image_id;
            RestService.send_modal_data(params, url).then(function (result) {
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        if (!/false,/.exec(result.result)) {
                            AlertService2.addAlert({ msg: "Instance Cloned Successfully", severity: 'success' });
                            $scope.aws_instance_list_content = "";
                            load_listinstance(region_name);
                        }
                        else {
                            AlertService2.addAlert({ msg: "Instance Clone Failed", severity: 'danger' });
                        }
                    }
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                });
            });
            var response_obj = { "success": "Added Successfuly" };
            return response_obj;
        };
        $scope.aws_copy_snapshot = function (params) {
            var valid = ValidationService.validate_data(params, $scope.aws_copy_snapshot_rows);
            if (!valid.is_validated) {
                return valid;
            }
            var url = AdminApi.copy_snapshot.replace(":account_id", account_id).replace(":name", region_name).replace(":snapshot_id", params.SnapshotId);
            RestService.send_modal_data(params, url).then(function (result) {
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        if (!/false,/.exec(result.result)) {
                            AlertService2.addAlert({ msg: "Snapshot Copied Successfully", severity: 'success' });
                            $scope.aws_snapshot_list_content = "";
                            load_listsnapshot();
                        }
                        else {
                            AlertService2.addAlert({ msg: "Snapshot Copy Failed", severity: 'danger' });
                        }
                    }
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                });
            });
            var response_obj = { "success": "Added Successfuly" };
            return response_obj;
        };

        $scope.attach_autoscaling_group = function (params) {
            var valid = ValidationService.validate_data(params, $scope.aws_attachinstance_rows);
            if (!valid.is_validated) {
                return valid;
            }
            delete params.is_validated;
            var url = AdminApi.attach_autoscaling_group.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", params.instance_id);
            RestService.send_modal_data(params, url).then(function (result) {
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        if (!/false,/.exec(result.result)) {
                            AlertService2.addAlert({ msg: "Attached Successfully", severity: 'success' });
                        }
                        else {
                            AlertService2.addAlert({ msg: "Attach Failed", severity: 'danger' });
                        }
                    }
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                });
            });
            var response_obj = { "success": "Added Successfuly" };
            return response_obj;
        };
        $scope.attach_network_interface = function (params) {
            var valid = ValidationService.validate_data(params, $scope.aws_attachinterface_rows);
            if (!valid.is_validated) {
                return valid;
            }
            delete params.is_validated;
            var url = AdminApi.attach_network_interface.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", params.instance_id);
            RestService.send_modal_data(params, url).then(function (result) {
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        if (!/false,/.exec(result.result)) {
                            AlertService2.addAlert({ msg: "Attached Successfully", severity: 'success' });
                        }
                        else {
                            AlertService2.addAlert({ msg: "Attach Failed", severity: 'danger' });
                        }
                    }
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                });
            });
            var response_obj = { "success": "Added Successfuly" };
            return response_obj;
        };

        $scope.attach_loadbalancer = function (params) {
            var valid = ValidationService.validate_data(params, $scope.aws_loadbalancer_rows);
            if (!valid.is_validated) {
                return valid;
            }
            delete params.is_validated;
            var url = AdminApi.attach_loadbalancer.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", params.instance_id);
            RestService.send_modal_data(params, url).then(function (result) {
                TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS") {
                        if (!/false,/.exec(result.result)) {
                            AlertService2.addAlert({ msg: "Attached Successfully", severity: 'success' });
                        }
                        else {
                            AlertService2.addAlert({ msg: "Attach Failed", severity: 'danger' });
                        }
                    }
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.addAlert({ msg: error.data.result.message[0], severity: 'danger' });
                });
            });
            var response_obj = { "success": "Added Successfuly" };
            return response_obj;
        };

        $scope.aws_create_instance_rows = [
            DataFormattingService.generate_row(["select", "instance_type", "Instance Type", ["sg1", "sg2"], "required"]),
            DataFormattingService.generate_row(["text", "image_id", "Image Id", "required"]),
            DataFormattingService.generate_row(["number", "max_count", "Number of Instances", "required"]),
            DataFormattingService.generate_row(["select", "availability_zone", "Availability Zone", ["zone1", "zone2"]]),
            DataFormattingService.generate_row(["select", "subnet_id", "Subnet Id", ["sg1", "sg2"]]),
            DataFormattingService.generate_row(["select", "shutdown_behavior", "Shutdown Behavior", ["stop", "terminate"]])
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

        //Testing new Modal-Start
        var load_modal = function load_modal(callback, urls, modal_title, rows, idField, template_Url) {
            $scope.callback = callback;
            $scope.resourceClass = urls;
            $scope.modal_title = modal_title;
            $scope.rows = rows;
            $scope.ctrl = new AbstractControllerFactoryV3($scope.resourceClass, $scope, idField, template_Url);
        };
        var createimage_modal = function createimage_modal(params) {
            $scope.obj.instance_id = params.rowdata.instance_id;
            var url = AdminApi.add_aws_image.replace(":account_id", account_id).replace(":name", region_name).replace(":instance_id", params.instance_id);
            var urls = { create: url };
            var rows = $scope.aws_create_image_rows;
            load_modal(load_listinstance, urls, "Image", rows, "modal", get_aws_template('create_aws_image'));
            $scope.ctrl.add();
        };
        $scope.aws_list_click = function (params) {
            $scope.obj = {};
            $scope.row_params = params;
            if (params.callback == "INSTANCES") {
                if (params.method == 'Add') {
                    var url = AdminApi.launch_instance.replace(":account_id", account_id).replace(":name", region_name);
                    var urls = { create: url };
                    var rows = $scope.aws_create_instance_rows;
                    load_modal(load_listinstance, urls, "Instance", rows, "modal", get_aws_template('create-instance'));
                    $scope.ctrl.add();
                } else if (params.method == 'Edit') {
                    var url = AdminApi.launch_instance.replace(":account_id", account_id).replace(":name", region_name);
                    var urls = { edit_post: url };
                    var rows = $scope.aws_create_instance_rows;
                    load_modal(load_listinstance, urls, "Instance", rows, "modal", get_aws_template('create-instance'));
                    $scope.ctrl.edit();
                }
            } else if (params.callback == "createimage") {
                createimage_modal(params);
            }
        };
        //Testing new Modal-End
    }
]);
