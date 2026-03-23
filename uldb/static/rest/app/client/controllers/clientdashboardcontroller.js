var app = angular.module('uldb');

app.controller('ClientDashboardController', [
    '$scope',
    '$routeParams',
    '$rootScope',
    '$timeout',
    '$interval',
    '$q',
    '$filter',
    '$http',
    'TaskService3',
    '$sce',
    '$state',
    '$uibModal',
    'calendarConfig',
    'TableHeaders',
    'AlertService2',
    'OberviumGraphConfig',
    function ($scope,
        $routeParams,
        $rootScope,
        $timeout,
        $interval,
        $q,
        $filter,
        $http,
        TaskService3,
        $sce,
        $state,
        $uibModal,
        calendarConfig,
        TableHeaders,
        AlertService2,
        OberviumGraphConfig) {

        // console.log('companyTab-controller');
        // $scope.myPromise = $http.get('http://httpbin.org/delay/3'); // test request for loader

        $scope.show_onboard_status = false;

        var display_onboard_status = function (obj) {
            var onb_status = obj.onb_status;
            if (!obj.vpn_status || !onb_status.excel_end || !onb_status.monitoring_end || !onb_status.manage_end) {
                $scope.show_onboard_status = true;
            }
        };

        $scope.getOrgPermissions = function () {
            $http({
                method: "GET",
                url: '/customer/uldbusers'
            }).then(function (response) {
                var subscribed_modules = response.data.results[0].subscribed_modules;
                $scope.showPublicCloudWidget = subscribed_modules.includes("Public Cloud");
                $scope.showTicketManagementWidget = subscribed_modules.includes("Ticket Management");
                $scope.showMaintenanceWidget = subscribed_modules.includes("Maintenance");
                $scope.showAlertsWidget = subscribed_modules.includes("Monitoring");
            }).catch(function (error) {
                console.log('error : ', angular.toJson(error));
            });
        }();

        var get_status_details = function () {
            $http.get("/customer/organization/").then(function (response) {
                display_onboard_status(angular.copy(response.data.results[0]));
                $scope.onboarding_details = response.data.results[0];
                console.log('$scope.onboarding_details : ', angular.toJson($scope.onboarding_details));
                $scope.loader = false;
            }).catch(function (error) {
               console.log('error : ', angular.toJson(error));
               AlertService2.danger("Problem ocurred in fetching onboarding status. Please try again later. ");
            });
        };
        get_status_details();

        $scope.show_onboard_page = function () {
            if ($rootScope.is_user_customer_admin) {
                $state.go('inventory_onboard', null, { reload: true });
            } else {
                return;
            }
        };


        // Infrastructure as a service
        $scope.private_cloud = $http.get('/customer/private_cloud_fast/');
        $scope.private_cloud.then(function (response) {
            // console.log("privateCloud Response :" + angular.toJson(response));
            $scope.privateCloud = [];
            angular.forEach(response.data.results, function (value, key) {
                var private_cloud_widget = {
                    name: value.name,
                    uuid: value.uuid,
                    colo_cloud: value.colo_cloud,
                    platform_type: value.platform_type,
                    classStyle: 'paddingright',
                    classTop: '',
                    href: '#/pc_clouds/' + value.uuid + '/summary',
                    colocation_cloud: value.colocation_cloud,
                    virtualMachines: value.vms,
                    alerts: 14,
                    progressValue: [70, 65, 50],
                    utilization: {
                        type: 'doughnutLabels',
                        data: {
                            datasets: [{
                                data: [
                                    75,
                                    25,
                                ],
                                backgroundColor: [
                                    "#43e091",
                                    "#bcbcbc"
                                ]
                            }],
                            labels: [
                                "Used",
                                "Unused"
                            ]
                        },
                        options: {
                            rotation: 1.0 * Math.PI,
                            circumference: Math.PI,
                            responsive: true,
                            legend: {
                                display: false,
                            },

                            animation: {
                                animateScale: true,
                                animateRotate: true
                            }
                            // tooltips: { bodyFontSize: 20 }
                        }
                    },
                    utilization1: {
                        type: 'doughnutLabels',

                        data: {
                            datasets: [{
                                data: [69, 31],
                                backgroundColor: [
                                    "#43e091",
                                    "#bcbcbc"
                                ]
                            }],
                            labels: [
                                "Used",
                                "Unused"
                            ]
                        },
                        options: {
                            rotation: 1.0 * Math.PI,
                            circumference: Math.PI,
                            responsive: true,
                            legend: {
                                display: false,
                            },

                            animation: {
                                animateScale: true,
                                animateRotate: true
                            }
                            // tooltips: { bodyFontSize: 20 }
                        }
                    }
                };
                if (value.colo_cloud) {
                    private_cloud_widget.href = '#/colo_cloud/' + value.colo_cloud + '/private_clouds/' + value.uuid + '/summary';
                }
                else {
                    private_cloud_widget.href = '#/pc_clouds/' + value.uuid + '/summary';
                }

                $scope.privateCloud.push(private_cloud_widget);
            });
        });

        $scope.make_doughnut_data = function (util_percentage) {
            // this check is added to show a finite value in the doughnut graph, other wise it will show as 0
            if (util_percentage < 1 && util_percentage > 0) {
                util_percentage = 1;
            } else {
                util_percentage = Math.round(util_percentage);
            }

            return {
                type: 'doughnutLabels',

                data: {
                    datasets: [{
                        data: [util_percentage, 100 - util_percentage],
                        backgroundColor: [
                            "#43e091",
                            "#bcbcbc"
                        ]
                    }],
                    labels: [
                        "Used %",
                        "Unused %"
                    ]
                },
                options: {
                    rotation: 1.0 * Math.PI,
                    circumference: Math.PI,
                    responsive: true,
                    legend: {
                        display: false,
                    },

                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                    // tooltips: { bodyFontSize: 20 }
                }
            };
        };


        $scope.response = {};

        $scope.devices_alert_count = {};
        $scope.cloud_devices_alerts = function (uuid) {
            $scope.alerts_data = $http.get('/customer/private_cloud/' + uuid + '/alerts_count/');
            $scope.alerts_data.then(function (response) {
                if (response.data.error === undefined) {
                    // console.log(response.data.total);
                    $scope.devices_alert_count[uuid] = response.data.failed.toString();
                }
                else {
                    AlertService2.danger(response.data.error);
                    $scope.devices_alert_count[uuid] = 'N/A';
                }

            }).catch(function (error, status) {
                $scope.devices_alert_count[uuid] = 'N/A';
            });
        };

        $scope.allocations = function (uuid, platform_type) {
            return $q(function (resolve, reject) {
                $timeout(function () {
                    // console.log("Private Cloud : " + angular.toJson($scope.privateCloud));
                    angular.forEach($scope.privateCloud, function (value, key) {
                        var CPUHalfDonut = angular.element("#private-CPU-halfDonut" + uuid)[0].getContext("2d");
                        window.upDownChart = new Chart(CPUHalfDonut, $scope.make_doughnut_data(0));

                        var RAMHalfDonut = angular.element("#private-RAM-halfDonut" + uuid)[0].getContext("2d");
                        window.upDownChart = new Chart(RAMHalfDonut, $scope.make_doughnut_data(0));
                    });
                }, 0);

                $timeout(function () {
                    // console.log("$scope.ticketsCount: " + angular.toJson($scope.ticketsCount));
                    angular.forEach($scope.ticketsCount, function (value, key) {
                        if (angular.isDefined(angular.element("#ticket-donut" + key)[0])) {
                            var donut = angular.element("#ticket-donut" + key)[0].getContext("2d");
                            window.upDownChart = new Chart(donut, value.utilization);
                        }
                    });
                }, 0);

                $scope.response[uuid] = [
                    {
                        name: 'vCPU',
                        type: 'success',
                        percentValue: 0,
                        allocatedValue: 0 + ' vCPU',
                        totalValue: 0 + ' vCPU',
                        availableValue: 0 + ' vCPU'
                    },
                    {
                        name: 'RAM',
                        type: 'success',
                        percentValue: 0,
                        allocatedValue: 0 + ' GB',
                        totalValue: 0 + ' GB',
                        availableValue: 0 + ' GB'
                    },
                    {
                        name: 'Storage',
                        type: 'success',
                        percentValue: 0,
                        allocatedValue: 0 + ' GB',
                        totalValue: 0 + ' GB',
                        availableValue: 0 + ' GB'
                    }
                ];

                if (platform_type == "VMware" || platform_type == "OpenStack") {
                    $scope.usage_data = $http.get('/customer/private_cloud/' + uuid + '/usage_data/');
                    $scope.usage_data.then(function (response) {
                        if (platform_type == "VMware") {
                            // var overview_data = response.data;
                            var vcpus_used = response.data.total_cpus_allocated;
                            var vcpus_total = response.data.total_num_cores;
                            var vcpus_free = (vcpus_total - vcpus_used);
                            var vcpus_available = (vcpus_free < 0 ? 0 : vcpus_free) + ' vCPU';
                            var vcpus_percent = Math.round((vcpus_used * 100) / vcpus_total);

                            if (response.data.static_memory_capacity !== "N/A") {
                                var memory_used = Math.round(response.data.total_memory_allocated / 1000);
                                var memory_total = Math.round(response.data.static_memory_capacity);
                                var memory_free = Math.round(memory_total - memory_used);
                                var memory_available = (memory_free < 0 ? 0 : memory_free) + ' GB';
                                var memory_percent = Math.round((memory_used * 100) / memory_total);

                            }
                            else {
                                var memory_used = Math.round(response.data.total_memory_allocated / 1000);
                                var memory_total = response.data.static_memory_capacity;
                                var memory_free = (0 - memory_used);
                                var memory_available = 'N/A';
                            }

                            if (response.data.static_disk_capacity !== "N/A") {
                                // var storage_used = Math.round((response.data.disk_capacity / (1000 * 1000 * 1000)) + response.data.bm_servers_storage);
                                var storage_used = Math.round((response.data.disk_capacity - response.data.free_disk_space) / (1000 * 1000 * 1000)) + response.data.bm_servers_storage;
                                var storage_total = Math.round(response.data.static_disk_capacity) * 1000;
                                var storage_free = (storage_total - storage_used); // IN GB
                                var storage_available = (storage_free < 0 ? 0 : storage_free) + ' GB';
                                var storage_percent = Math.round((storage_used * 100) / storage_total);
                            }
                            else {
                                // var storage_used = Math.round((response.data.disk_capacity / (1000 * 1000 * 1000)) + response.data.bm_servers_storage);
                                var storage_used = Math.round((response.data.disk_capacity - response.data.free_disk_space) / (1000 * 1000 * 1000)) + response.data.bm_servers_storage;
                                var storage_total = response.data.static_disk_capacity * 1000;
                                var storage_free = (0 - storage_used);
                                var storage_available = 'N/A';
                            }

                            var vcpu_bar = (vcpus_percent < 65) ? "success" : ((65 < vcpus_percent) ? ((vcpus_percent < 85) ? "warning" : "danger") : "danger");
                            var memory_bar = ((response.data.static_memory_capacity == "N/A") ? "success" : (memory_percent < 65) ? "success" : ((65 < memory_percent) ? ((memory_percent < 85) ? "warning" : "danger") : "danger"));
                            var storage_bar = ((response.data.static_disk_capacity == "N/A") ? "success" : (storage_percent < 65) ? "success" : ((65 < storage_percent) ? ((storage_percent < 85) ? "warning" : "danger") : "danger"));

                            $scope.response[uuid] = {};
                            $scope.response[uuid] = [
                                {
                                    name: 'vCPU',
                                    type: vcpu_bar,
                                    percentValue: vcpus_percent,
                                    allocatedValue: vcpus_used + ' vCPU',
                                    totalValue: vcpus_total + ' vCPU',
                                    availableValue: vcpus_available
                                },
                                {
                                    name: 'RAM',
                                    type: memory_bar,
                                    percentValue: memory_percent,
                                    allocatedValue: memory_used + ' GB',
                                    totalValue: (response.data.static_memory_capacity == "N/A") ? 'N/A' : memory_total + ' GB',
                                    availableValue: memory_available
                                },
                                {
                                    name: 'Storage',
                                    type: storage_bar,
                                    percentValue: storage_percent,
                                    allocatedValue: storage_used + ' GB',
                                    totalValue: (response.data.static_disk_capacity == "N/A") ? 'N/A' : storage_total + ' GB',
                                    availableValue: storage_available
                                }
                            ];


                            if (angular.isDefined(angular.element("#private-CPU-halfDonut" + uuid)[0])) {
                                var CPUHalfDonut = angular.element("#private-CPU-halfDonut" + uuid)[0].getContext("2d");
                                var cpuUtilization = (response.data.cpu_usage * 100) / response.data.cpu_capacity;
                                window.upDownChart = new Chart(CPUHalfDonut, $scope.make_doughnut_data(cpuUtilization));

                                var RAMHalfDonut = angular.element("#private-RAM-halfDonut" + uuid)[0].getContext("2d");
                                var memory_usage = response.data.memory_usage / 1000;
                                var ramUtilization = (memory_usage * 100) / response.data.memory_capacity;
                                window.upDownChart = new Chart(RAMHalfDonut, $scope.make_doughnut_data(ramUtilization));
                            }

                            resolve();
                        }
                        else if (platform_type == "OpenStack") {
                            var vcpus_used = response.data.vcpus_used;
                            var vcpus_total = response.data.vcpus;
                            var vcpus_free = (vcpus_total - vcpus_used);
                            var vcpus_available = (vcpus_free < 0 ? 0 : vcpus_free) + ' vCPU';
                            var vcpus_percent = (vcpus_used * 100) / vcpus_total;

                            if (response.data.static_disk_capacity !== "N/A") {
                                var memory_used = Math.round(response.data.memory_mb_used / 1000);
                                var memory_total = response.data.static_memory_capacity;
                                var memory_free = Math.round(memory_total - memory_used);
                                var memory_available = (memory_free < 0 ? 0 : memory_free) + ' GB';
                                var memory_percent = Math.round((memory_used * 100) / memory_total);
                            }
                            else {
                                var memory_used = Math.round(response.data.memory_mb_used / 1000);
                                var memory_total = response.data.static_memory_capacity;
                                var memory_free = (0 - memory_used);
                                var memory_available = "N/A";
                            }

                            if (response.data.static_disk_capacity !== "N/A") {
                                var storage_used = response.data.local_gb_used + response.data.bm_servers_storage;
                                var storage_total = response.data.static_disk_capacity * 1000;
                                var storage_free = (storage_total - storage_used);
                                var storage_available = (storage_free < 0 ? 0 : storage_free) + ' GB';
                                var storage_percent = Math.round((storage_used * 100) / storage_total);
                            }
                            else {
                                var storage_used = response.data.local_gb_used + response.data.bm_servers_storage;
                                var storage_total = response.data.static_disk_capacity;
                                var storage_free = (0 - storage_used);
                                var storage_available = "N/A";
                            }

                            var vcpu_bar = (vcpus_percent < 65) ? "success" : ((65 < vcpus_percent) ? ((vcpus_percent < 85) ? "warning" : "danger") : "danger");
                            var memory_bar = ((response.data.static_memory_capacity == "N/A") ? "success" : (memory_percent < 65) ? "success" : ((65 < memory_percent) ? ((memory_percent < 85) ? "warning" : "danger") : "danger"));
                            var storage_bar = ((response.data.static_disk_capacity == "N/A") ? "success" : (storage_percent < 65) ? "success" : ((65 < storage_percent) ? ((storage_percent < 85) ? "warning" : "danger") : "danger"));

                            $scope.response[uuid] = {};
                            $scope.response[uuid] = [
                                {
                                    name: 'vCPU',
                                    type: vcpu_bar,
                                    percentValue: vcpus_percent,
                                    allocatedValue: vcpus_used + ' vCPU',
                                    totalValue: vcpus_total + ' vCPU',
                                    availableValue: vcpus_available
                                },
                                {
                                    name: 'RAM',
                                    type: memory_bar,
                                    percentValue: memory_percent,
                                    allocatedValue: memory_used + ' GB',
                                    totalValue: (response.data.static_memory_capacity == "N/A") ? 'N/A' : memory_total + ' GB',
                                    availableValue: memory_available
                                },
                                {
                                    name: 'Storage',
                                    type: storage_bar,
                                    percentValue: storage_percent,
                                    allocatedValue: storage_used + ' GB',
                                    totalValue: (response.data.static_disk_capacity == "N/A") ? 'N/A' : storage_total + ' GB',
                                    availableValue: storage_available
                                }
                            ];

                            if (angular.isDefined(angular.element("#private-CPU-halfDonut" + uuid)[0])) {
                                var CPUHalfDonut = angular.element("#private-CPU-halfDonut" + uuid)[0].getContext("2d");
                                window.upDownChart = new Chart(CPUHalfDonut, $scope.make_doughnut_data((response.data.cpu_utilization)));

                                var RAMHalfDonut = angular.element("#private-RAM-halfDonut" + uuid)[0].getContext("2d");
                                window.upDownChart = new Chart(RAMHalfDonut, $scope.make_doughnut_data((response.data.ram_utilization)));
                            }

                            // $scope.response = obj;
                            resolve();
                        }
                        else {
                            resolve();
                        }

                        // console.log("res :"+angular.toJson($scope.response))
                    }).catch(function (error, status) {
                        AlertService2.danger("Unable to fetch " + platform_type + " statistcs. Please contact Administrator (support@unityonecloud.com)");
                        $scope.data_availabe = false;
                        $scope.loader = false;
                        reject();
                    });
                } else if (platform_type == "vCloud Director") {
                    $scope.usage_stat = $http.get('/customer/private_cloud/' + uuid + '/usage_stats/');
                    $scope.usage_stat.then(function (response) {
                        var vcpus_used = response.data.configured_vcpu;
                        var vcpus_total = response.data.allocated_vcpu;
                        var vcpus_free = (vcpus_total - vcpus_used);
                        var vcpus_available = (vcpus_free < 0 ? 0 : vcpus_free) + ' vCPU';
                        var vcpus_percent = Math.round((vcpus_used * 100) / vcpus_total);

                        var memory_used = Math.round(response.data.configured_ram);
                        var memory_total = Math.round(response.data.allocated_ram);
                        var memory_free = Math.round(memory_total - memory_used);
                        var memory_available = (memory_free < 0 ? 0 : memory_free) + ' GB';
                        var memory_percent = Math.round((memory_used * 100) / memory_total);

                        var storage_used = Math.round(response.data.configured_storage_disk);
                        var storage_total = Math.round(response.data.allocated_storage_disk);
                        var storage_free = (storage_total - storage_used); // IN GB
                        var storage_available = (storage_free < 0 ? 0 : storage_free) + ' GB';
                        var storage_percent = Math.round((storage_used * 100) / storage_total);

                        var vcpu_bar = (vcpus_percent < 65) ? "success" : ((65 < vcpus_percent) ? ((vcpus_percent < 85) ? "warning" : "danger") : "danger");
                        var memory_bar = (memory_percent < 65) ? "success" : ((65 < memory_percent) ? ((memory_percent < 85) ? "warning" : "danger") : "danger");
                        var storage_bar = (storage_percent < 65) ? "success" : ((65 < storage_percent) ? ((storage_percent < 85) ? "warning" : "danger") : "danger");

                        $scope.response[uuid] = {};
                        $scope.response[uuid] = [
                            {
                                name: 'vCPU',
                                type: vcpu_bar,
                                percentValue: vcpus_percent,
                                allocatedValue: vcpus_used + ' vCPU',
                                totalValue: vcpus_total + ' vCPU',
                                availableValue: vcpus_available
                            },
                            {
                                name: 'RAM',
                                type: memory_bar,
                                percentValue: memory_percent,
                                allocatedValue: memory_used + ' GB',
                                totalValue: (response.data.static_memory_capacity == "N/A") ? 'N/A' : memory_total + ' GB',
                                availableValue: memory_available
                            },
                            {
                                name: 'Storage',
                                type: storage_bar,
                                percentValue: storage_percent,
                                allocatedValue: storage_used + ' GB',
                                totalValue: (response.data.static_disk_capacity == "N/A") ? 'N/A' : storage_total + ' GB',
                                availableValue: storage_available
                            }
                        ];

                        // console.log("Response : " + angular.toJson($scope.response[uuid]));

                        if (angular.isDefined(angular.element("#private-CPU-halfDonut" + uuid)[0])) {
                            var CPUHalfDonut = angular.element("#private-CPU-halfDonut" + uuid)[0].getContext("2d");
                            window.upDownChart = new Chart(CPUHalfDonut, $scope.make_doughnut_data(response.data.vcpu_utilization));

                            var RAMHalfDonut = angular.element("#private-RAM-halfDonut" + uuid)[0].getContext("2d");
                            window.upDownChart = new Chart(RAMHalfDonut, $scope.make_doughnut_data(response.data.ram_utilization));
                        }

                        resolve();
                    }).catch(function (error, status) {
                        AlertService2.danger("Unable to fetch " + platform_type + " statistcs. Please contact Administrator (support@unityonecloud.com)");
                        $scope.data_availabe = false;
                        $scope.loader = false;
                        reject();
                    });
                }
            });
        };


        $scope.progressBar = [
            { type: 'danger', core: 10, cloudName: 'vCPU' },
            { type: 'success', core: 128, cloudName: 'RAM' },
            { type: 'warning', core: 300, cloudName: 'Storage' }
        ];

        // PDU Health Stats

        $scope.setLoader = function (value) {
            $scope.loader = value;
        };

        $scope.get_pdu_list = function () {
            $scope.mapped_pdu_list = [];
            $http({
                method: "GET",
                url: '/customer/observium/pdu/',
            }).then(function (response) {
                $scope.showHealthStats = true;
                $scope.mapped_pdu_list = response.data.results;

            }).catch(function (error) {
                $scope.showHealthStats = false;
                $scope.setLoader(false);
            });

        };
        $scope.get_pdu_list();

        $scope.get_pdu_details = function (pdu) {
            pdu.observium_details = {};
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + pdu.uuid + '/get_device_data/'
            }).then(function (response) {
                // console.log('response')
                pdu.observium_details = response.data;
                pdu.observium_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                pdu.observium_details = null;
            });
        };

        $scope.show_observium_details = function (pdu) {
            // console.log("pdu.hostname:" + pdu.hostname);
            $scope.pdu_details = pdu.observium_details;
        };

        $scope.popoverobj = {
            templateUrl: 'device_observium_stats.html',
        };

        // To load public cloud widget
        $scope.load_public_cloud_widget = function () {
            var public_aws_cloud = $http.get('/customer/aws/');
            public_aws_cloud.then(function (response) {
                $scope.publicCloudAWS = [];
                angular.forEach(response.data.results, function (value, key) {
                    var public_aws_cloud = {
                        platform_type: 'AWS',
                        accountName: value.aws_user,
                        id: value.id,
                        classStyle: 'paddingright',
                    };
                    $scope.publicCloudAWS.push(public_aws_cloud);
                });
            });

            var public_azure_cloud = $http.get('/customer/azure/');
            public_azure_cloud.then(function (response) {
                $scope.publicCloudAzure = [];
                angular.forEach(response.data.results, function (value, key) {
                    var public_azure_cloud = {
                        platform_type: 'Azure',
                        accountName: value.account_name,
                        id: value.id,
                        classStyle: 'paddingright',
                        ec2Instance: 0
                    };
                    $scope.publicCloudAzure.push(public_azure_cloud);
                });
            });

            var public_gcp_cloud = $http.get('/customer/gcp/account/');
            public_gcp_cloud.then(function (response) {
                $scope.publicCloudGCP = [];
                angular.forEach(response.data.results, function (value, key) {
                    var public_gcp_cloud = {
                        platform_type: 'GCP',
                        accountName: value.name,
                        id: value.uuid,
                        classStyle: 'paddingright',
                        ec2Instance: 0
                    };
                    $scope.publicCloudGCP.push(public_gcp_cloud);
                });
            });
        };

        //Updates AWS/Azure data in backend
        $scope.load_celery_public_cloud_data = function () {
            $http.get('/customer/cloud_data/update_cloud_data/').then(function (response) {
                TaskService3.processTask(response.data.task_id, 500, 8000).then(function (result) {
                    $scope.load_public_cloud_widget();
                }).catch(function (error) {
                });
            });
            // $scope.load_public_cloud_widget(); //Test without TaskService
        };

        $scope.load_celery_public_cloud_data();

        $scope.load_public_cloud_widget();
        // To load public cloud donut chart

        $scope.responseAWS = {};
        $scope.responseAzure = {};
        $scope.responseGCP = {};
        $scope.publicCloudallocations = function (id, platform_type) {
            return $q(function (resolve, reject) {
                if (platform_type === 'AWS') {
                    $scope.responseAWS[id] = [
                        {
                            column1: [{ name: "S3Buckets", value: 0, color: "yellow" },
                            { name: "Elastic IPs", value: 0, color: "red" }],
                            column2: [{ name: "RDS Instances", value: 0, color: "purple" },
                            { name: "Load Balancer", value: 0, color: "neongreen" }],
                            instances: 'EC2 Instances',
                            ec2Instance: 0,
                            utilization: {
                                type: 'doughnutLabels',

                                data: {
                                    datasets: [{
                                        data: [0, 0],
                                        backgroundColor: [
                                            "#ad7fe9",
                                            "#bcbcbc"
                                        ]
                                    }],
                                    labels: [
                                        "Running",
                                        "Stopped"
                                    ]
                                },
                                options: {

                                    rotation: 1.0 * Math.PI,
                                    circumference: Math.PI,

                                    responsive: true,
                                    legend: {
                                        display: false,
                                    },
                                    animation: {
                                        animateScale: true,
                                        animateRotate: true
                                    }

                                }
                            },

                        }
                    ];
                    $http.get('/customer/cloud_data/' + id + '/aws_data/').then(function (result) {
                        $scope.responseAWS[id] = {};
                        $scope.responseAWS[id] = [
                            {
                                column1: [{ name: "S3Buckets", value: result.data.s3_bucket, color: "yellow" },
                                { name: "Elastic IPs", value: result.data.elastic_ips, color: "red" }],
                                column2: [{ name: "RDS Instances", value: result.data.RDS_instance, color: "purple" },
                                { name: "Load Balancer", value: result.data.load_balancer, color: "neongreen" }],
                                instances: 'EC2 Instances',
                                ec2Instance: result.data.ec2_instance,
                                utilization: {
                                    type: 'doughnutLabels',

                                    data: {
                                        datasets: [{
                                            data: [result.data.ec2_active_instance, result.data.ec2_inactive_instance],
                                            backgroundColor: [
                                                "#ad7fe9",
                                                "#bcbcbc"
                                            ]
                                        }],
                                        labels: [
                                            "Running",
                                            "Stopped"
                                        ]
                                    },
                                    options: {

                                        rotation: 1.0 * Math.PI,
                                        circumference: Math.PI,

                                        responsive: true,
                                        legend: {
                                            display: false,
                                        },
                                        animation: {
                                            animateScale: true,
                                            animateRotate: true
                                        }

                                    }
                                },

                            }
                        ];
                        $timeout(function () {
                            // angular.forEach($scope.publicCloudAWS, function(value, key) {
                            var publicHalfDonut = angular.element("#public-halfDonut-" + platform_type + "-" + id)[0].getContext("2d");
                            window.upDownChart = new Chart(publicHalfDonut, $scope.responseAWS[id][0].utilization);
                            // });
                        }, 0);
                    });
                    // console.log("Resolving ====================>");
                    resolve();
                }
                else if (platform_type === 'Azure') {
                    $scope.response[id] = [
                        {
                            column1: [{ name: "Storage Account", value: 0, color: "yellow" },
                            { name: "NICs", value: 0, color: "red" }],
                            column2: [{ name: "Public IPs", value: 0, color: "purple" },
                            { name: "Load Balancer", value: 0, color: "neongreen" }],
                            instances: 'VM Instances',
                            utilization: {
                                type: 'doughnutLabels',
                                data: {
                                    datasets: [{

                                        data: [0, 0],
                                        backgroundColor: [
                                            "#ad7fe9",
                                            "#bcbcbc"
                                        ]
                                    }],
                                    labels: [
                                        "Running",
                                        "Stopped"
                                    ]
                                },
                                options: {

                                    rotation: 1.0 * Math.PI,
                                    circumference: Math.PI,

                                    responsive: true,
                                    legend: {
                                        display: false,
                                    },
                                    animation: {
                                        animateScale: true,
                                        animateRotate: true
                                    }

                                }

                            },
                            ec2Instance: 0
                        }
                    ];
                    $http.get('/customer/cloud_data/' + id + '/azure_data/').then(function (result) {
                        $scope.responseAzure[id] = {};
                        $scope.responseAzure[id] = [
                            {
                                column1: [{
                                    name: "Storage Account",
                                    value: result.data.storage_account,
                                    color: "yellow"
                                },
                                { name: "NICs", value: result.data.nic, color: "red" }],
                                column2: [{ name: "Public IPs", value: result.data.public_ips, color: "purple" },
                                { name: "Load Balancer", value: result.data.load_balancer, color: "neongreen" }],
                                instances: 'VM Instances',
                                utilization: {
                                    type: 'doughnutLabels',
                                    data: {
                                        datasets: [{

                                            data: [result.data.vm_active_instance, result.data.vm_inactive_instance],
                                            backgroundColor: [
                                                "#ad7fe9",
                                                "#bcbcbc"
                                            ]
                                        }],
                                        labels: [
                                            "Running",
                                            "Stopped"
                                        ]
                                    },
                                    options: {

                                        rotation: 1.0 * Math.PI,
                                        circumference: Math.PI,

                                        responsive: true,
                                        legend: {
                                            display: false,
                                        },
                                        animation: {
                                            animateScale: true,
                                            animateRotate: true
                                        }

                                    }

                                },
                                ec2Instance: result.data.vm_instance
                            }
                        ];
                        $timeout(function () {
                            // angular.forEach($scope.publicCloudAzure, function(value, key) {
                            var publicHalfDonut = angular.element("#public-halfDonut-" + platform_type + "-" + id)[0].getContext("2d");
                            window.upDownChart = new Chart(publicHalfDonut, $scope.responseAzure[id][0].utilization);
                            // });
                        }, 0);
                    });

                    resolve();
                }
                else if (platform_type === 'GCP') {
                    $scope.response[id] = [
                        {
                            column1: [{ name: "Storage Account", value: 0, color: "yellow" },
                            { name: "NICs", value: 0, color: "red" }],
                            column2: [{ name: "Public IPs", value: 0, color: "purple" },
                            { name: "Load Balancer", value: 0, color: "neongreen" }],
                            instances: 'VM Instances',
                            utilization: {
                                type: 'doughnutLabels',
                                data: {
                                    datasets: [{

                                        data: [0, 0],
                                        backgroundColor: [
                                            "#ad7fe9",
                                            "#bcbcbc"
                                        ]
                                    }],
                                    labels: [
                                        "Running",
                                        "Stopped"
                                    ]
                                },
                                options: {

                                    rotation: 1.0 * Math.PI,
                                    circumference: Math.PI,

                                    responsive: true,
                                    legend: {
                                        display: false,
                                    },
                                    animation: {
                                        animateScale: true,
                                        animateRotate: true
                                    }

                                }

                            },
                            ec2Instance: 0
                        }
                    ];
                    $http.get('/customer/gcp/account/' + id + '/get_gcp_widget_data/').then(function (response) {
                        TaskService3.processTask(response.data.task_id, 500, 2000).then(function (result) {
                            console.log("Rsult====>"+angular.toJson(result));
                            $scope.responseGCP[id] = {};
                            $scope.responseGCP[id] = [
                                {
                                    column1: [{
                                        name: "Disk in GB",
                                        value: result[0].size_in_gb,
                                        color: "yellow"
                                    },
                                    { name: "Buckets", value: result[0].buckets_count, color: "red" }],
                                    column2: [{ name: "Health Checks", value: result[0].health_check_count, color: "purple" },
                                    { name: "VM Count", value: result[0].instances_count, color: "neongreen" }],
                                    instances: 'VM Instances',
                                    utilization: {
                                        type: 'doughnutLabels',
                                        data: {
                                            datasets: [{

                                                data: [result[0].instances_up_count, result[0].instances_down_count],
                                                backgroundColor: [
                                                    "#ad7fe9",
                                                    "#bcbcbc"
                                                ]
                                            }],
                                            labels: [
                                                "Running",
                                                "Stopped"
                                            ]
                                        },
                                        options: {

                                            rotation: 1.0 * Math.PI,
                                            circumference: Math.PI,

                                            responsive: true,
                                            legend: {
                                                display: false,
                                            },
                                            animation: {
                                                animateScale: true,
                                                animateRotate: true
                                            }

                                        }

                                    },
                                    ec2Instance: result[0].instances_count
                                }
                            ];
                            $timeout(function () {
                                // angular.forEach($scope.publicCloudAzure, function(value, key) {
                                var publicHalfDonut = angular.element("#public-halfDonut-" + platform_type + "-" + id)[0].getContext("2d");
                                window.upDownChart = new Chart(publicHalfDonut, $scope.responseGCP[id][0].utilization);
                                // });
                            }, 0);
                        }).catch(function (error) {
                        });
                        
                    });

                    resolve();
                }
                
                else {
                    reject();
                }
            });
        };


        // To refresh public cloud widget after 5 mins
        var refreshingPromiseList = [];
        var isRefreshing = false;
        $scope.startRefreshing = function () {
            if (isRefreshing) return;
            isRefreshing = true;
            (function refreshEvery() {
                //Do refresh
                console.log("<-------- Doing refresh on data after 5 mins ------------->");
                //If async in then in callback do...
                $scope.load_celery_public_cloud_data();
                refreshingPromiseList.push($timeout(refreshEvery, 300000));
            }());
        };


        $scope.$on("$destroy", function () {
            refreshingPromiseList.forEach(function (timeout) {
                $timeout.cancel(timeout);
            });
        });

        $scope.startRefreshing();


        //colo assets
        var asset_stats = function () {
            $http.get('/customer/stats/get_assets_stat/').then(function (response) {
                console.log("devices data  : ", angular.toJson(response));
                $scope.privateCloudAssets = [];
                $scope.total_assets_count = 0;
                angular.forEach(response.data, function (value, key) {
                    $scope.asset_counts[value.name].count = angular.copy(value.count);
                    $scope.asset_counts[value.name].active_count = angular.copy(value.active_count);
                    $scope.asset_counts[value.name].inactive_count = angular.copy(value.inactive_count);
                    $scope.asset_counts[value.name].unknown = angular.copy(value.unknown);
                });
            }).catch(function (error) {
            });
        };
        asset_stats();

        $scope.assets_count = null;
        var get_asset_counts = function () {
            return $q(function (resolve, reject) {
                console.log('calling get_assets_count');
                $http.get('/customer/stats/get_assets_count/').then(function (response) {
                    console.log('in getting counts : ', angular.toJson(response.data));
                    $scope.asset_counts = angular.copy(response.data);
                    $scope.asset_counts.total_count = 0;
                    angular.forEach(response.data, function (value, key) {
                        $scope.asset_counts.total_count += angular.copy(value.count);
                    });
                    resolve();
                }).catch(function (error) {
                    $scope.asset_counts = null;
                    reject();
                });
            });
        };
        $scope.assets_count = get_asset_counts();

        $scope.get_device_alerts = function () {
            return $q(function (resolve, reject) {
                $http.get('/customer/stats/get_observium_alert_count/').then(function (response) {
                    $scope.device_alerts = response.data;
                    resolve();
                    // Updating alerts count as celery task
                    $http.get('/customer/stats/update_alert_count/').then(function (response) {
                        TaskService3.processTask(response.data.task_id, 500, 2000).then(function (result) {
                            $http.get('/customer/stats/get_observium_alert_count/').then(function (response) {
                                $scope.device_alerts = response.data;
                                resolve();
                            }).catch(function (error) {
                                // console.log("alerts error : ", angular.toJson(error));
                                reject();
                            });
                        }).catch(function (error) {
                            console.log("Alert count update celery task failed");
                        });
                    });

                }).catch(function (error) {
                    // console.log("alerts error : ", angular.toJson(error));
                    reject();
                });
            });
        };

        $scope.get_device_alerts();

        // Application-Monitoring-as-a-Service
        $scope.applicationMonitoring = [{
            name: 'Oracle 12 C',
            className: 'Dashborder',
            classPaddingTop: '',
            cpu: 8,
            memory: 32,
            space: 2,
            status: 'Green',
            lastStatus: 15,
            throughput: 73,
            activeConnection: 74,
            activeRequest: 2,
            responseTime: 20,
            dataThroughput: 29,
            dataProcessed: 24

        },
        {
            name: 'MS SQLServer 2014 SP2',
            className: '',
            classPaddingTop: 'paddingtop',
            cpu: 4,
            memory: 16,
            space: 1,
            status: 'Green',
            lastStatus: 15,
            throughput: 73,
            activeConnection: 74,
            activeRequest: 2,
            responseTime: 20,
            dataThroughput: 29,
            dataProcessed: 24
        }
        ];


        //Security-as-a-Service
        $scope.vulnerableHeaders = [{ name: ' IP Address' }, { name: ' DNS' }, { name: ' Vulnerabilities' }];

        $scope.vulnerableItems = [
            { ipAddress: '10.31.100.11', DNS: 'dc02.melcara.int', Vulnerabilities: '-' },
            { ipAddress: '10.31.100.131', DNS: 'drac01.dhcp.melcara.int', Vulnerabilities: '-' },
            { ipAddress: '10.31.130.32', DNS: 'openldap', Vulnerabilities: '-' },
            { ipAddress: '10.31.104.144', DNS: '-', Vulnerabilities: '-' },
            { ipAddress: '10.31.254.254', DNS: 'asa-inside.net.melcara.int', Vulnerabilities: '-' }
        ];

        $scope.vulnerabilitiesHeaders = [{ name: '' }, { name: ' Mitigated' }, { name: ' Unmitigated' }, { name: ' Exploitable' }, { name: ' Exploitable %' }];

        $scope.vulnerabilitiesItems = [
            { name: 'Critical', mitigated: 12, unmitigated: 14, exploitable: 7, value: 50 },
            { name: 'High', mitigated: 64, unmitigated: 366, exploitable: 35, value: 15 },
            { name: 'Medium', mitigated: 79, unmitigated: 349, exploitable: 57, value: 20 },
            { name: '-', mitigated: '', unmitigated: '', exploitable: '', value: '' },
            { name: '-', mitigated: '', unmitigated: '', exploitable: '', value: '' }
        ];


        //Compliance-as-a-Service
        $scope.complianceService = [
            { name: 'Evaluated Policies', value: 55, className: 'paddingright' },
            { name: 'Evaluated Hosts', value: 177, className: 'paddingright paddingleft' },
            { name: 'Evaluated Controls', value: 1265, className: 'paddingleft' }
        ];

        $scope.passingPoliciesHeaders = [{ name: 'Title' }, { name: 'Passing %' }];
        $scope.passingPoliciesItms = [{ title: 'UDC', value: 100 }, { title: 'New AXI', value: 100 }, {
            title: 'Solaris',
            value: 100
        }, { title: 'Oracle', value: 100 }, { title: 'Scan by Policy', value: 100 },];

        $scope.failingPoliciesHeaders = [{ name: 'Title' }, { name: 'Failing  %' }];
        $scope.failingPoliciesItms = [{ title: 'UDC - Diff Scan settings', value: 100 }, {
            title: 'CENTOS',
            value: 100
        }, { title: 'Permissions', value: 100 }, { title: 'Corporate Office', value: 85 }, {
            title: 'Linux Policy',
            value: 66
        },];


        //Tickets and Maintenance Schedule
        $scope.topTickets = [
            {
                title: '',
                name: 'ASH1',
                id: 6976,
                alert: 'Host DOWN alert for HA-vihgj jhkjl kjl',
                className: 'paddingright',
                color: 'neonredbg'
            },
            {
                title: 'Aeries',
                name: 'LA1',
                id: 6975,
                alert: 'Host DOWN alert for HA-vihgj jhkjl kjl',
                className: 'paddingleft paddingright',
                color: 'bluebg'
            },
            {
                title: 'Host Analytics',
                name: 'LA4',
                id: 6973,
                alert: 'Host DOWN alert for HA-vihgj jhkjl kjl',
                className: 'paddingleft',
                color: 'bluebg'
            }
        ];

        $scope.bottomTickets = [
            {
                title: 'Black Stone',
                name: 'LA4',
                id: 6938,
                alert: 'Host DOWN alert for HA-vihgj jhkjl kjl',
                className: 'paddingright',
                color: 'neonredbg'
            },
            {
                title: 'Aeries',
                name: 'SF8',
                id: 6966,
                alert: 'Host DOWN alert for HA-vihgj jhkjl kjl',
                className: 'paddingleft paddingright',
                color: 'neonyellowbg'
            },
            {
                title: 'Aeries Demo',
                name: 'SF10',
                id: 6971,
                alert: 'Host DOWN alert for HA-vihgj jhkjl kjl',
                className: 'paddingleft',
                color: 'neonyellowbg'
            }
        ];


        $scope.ticketsCount = [{
            title: 'Support Tickets Count',
            className: 'paddingright',
            classTop: '',
            utilization: {
                type: 'doughnutLabels',

                data: {
                    datasets: [{

                        data: [30, 70],
                        backgroundColor: [
                            "#43e091",
                            "#ca4242"
                        ]
                    }],
                    labels: [
                        "Closed",
                        "Open"
                    ]
                },
                options: {
                    rotation: 1.0 * Math.PI,
                    circumference: 2 * Math.PI,

                    responsive: true,
                    legend: {
                        display: false,
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                    // tooltips: { bodyFontSize: 20 }
                }
            },
        },
        {
            title: 'Incident Tickets Count',
            className: 'paddingleft paddingright',
            classTop: 'middlec',
            utilization: {
                type: 'doughnutLabels',
                data: {
                    datasets: [{

                        data: [80, 20],
                        backgroundColor: [
                            "#43e091",
                            "#ca4242"
                        ]
                    }],
                    labels: [
                        "Closed",
                        "Open"
                    ]
                },
                options: {
                    rotation: 1.0 * Math.PI,
                    circumference: 2 * Math.PI,
                    responsive: true,
                    legend: {
                        display: false,
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                    // tooltips: { bodyFontSize: 20 }
                }
            },
        },
        {
            title: 'Change Ticket Count',
            className: 'paddingleft',
            classTop: '',
            utilization: {
                type: 'doughnutLabels',
                data: {
                    datasets: [{

                        data: [10, 90],
                        backgroundColor: [
                            "#43e091",
                            "#ca4242"
                        ]
                    }],
                    labels: [
                        "Closed",
                        "Open"
                    ]
                },
                options: {
                    rotation: 1.0 * Math.PI,
                    circumference: 2 * Math.PI,
                    responsive: true,
                    legend: {
                        display: false,
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                    // tooltips: { bodyFontSize: 20 }
                }
            },
        }
        ];


        // doughnut
        Chart.defaults.doughnutLabels = Chart.helpers.clone(Chart.defaults.doughnut);

        // console.log('Chart.defaults.global.tooltips', Chart.defaults.global.tooltips.callbacks.title);
        var helpers = Chart.helpers;
        var defaults = Chart.defaults;

        Chart.controllers.doughnutLabels = Chart.controllers.doughnut.extend({
            updateElement: function (arc, index, reset) {
                var _this = this;
                var chart = _this.chart,
                    chartArea = chart.chartArea,
                    opts = chart.options,
                    animationOpts = opts.animation,
                    arcOpts = opts.elements.arc,
                    centerX = (chartArea.left + chartArea.right) / 2,
                    centerY = (chartArea.top + chartArea.bottom) / 2,
                    startAngle = opts.rotation, // non reset case handled later
                    endAngle = opts.rotation, // non reset case handled later
                    dataset = _this.getDataset(),
                    circumference = reset && animationOpts.animateRotate ? 0 : arc.hidden ? 0 : _this.calculateCircumference(dataset.data[index]) * (opts.circumference / (2.0 * Math.PI)),
                    innerRadius = reset && animationOpts.animateScale ? 0 : _this.innerRadius + 5,
                    outerRadius = reset && animationOpts.animateScale ? 0 : _this.outerRadius,
                    custom = arc.custom || {},
                    valueAtIndexOrDefault = helpers.getValueAtIndexOrDefault;

                helpers.extend(arc, {
                    // Utility
                    _datasetIndex: _this.index,
                    _index: index,

                    // Desired view properties
                    _model: {
                        x: centerX + chart.offsetX,
                        y: centerY + chart.offsetY,
                        startAngle: startAngle,
                        endAngle: endAngle,
                        circumference: circumference,
                        outerRadius: outerRadius,
                        innerRadius: innerRadius,
                        label: valueAtIndexOrDefault(dataset.label, index, chart.data.labels[index])
                    },

                    draw: function () {
                        var ctx = this._chart.ctx,
                            vm = this._view,
                            sA = vm.startAngle,
                            eA = vm.endAngle,
                            opts = this._chart.config.options;

                        $timeout(function () {
                            opts.defaultFontSize = 10;
                            opts.defaultFontStyle = 'bold';
                            opts.defaultColor = '#fff';
                            // for (var i = 0; i < 3; i++) {
                            //     // angular.element(document.getElementById("private-CPU-halfDonut" + i)).css({ height: '142px' })
                            //     // angular.element(document.getElementById("private-RAM-halfDonut" + i)).css({ height: '142px' })
                            // }
                            //angular.element('#myChart').css({ width: '140px', height: '150px' })
                            //angular.element('#myChart').css({ width: '140px', height: '150px', position: 'absolute', 'margin-top': '363px', 'margin-left': '94px', 'z-index': '1' })

                        }, 0);

                        var labelPos = this.tooltipPosition();
                        // console.log('labelPos', labelPos);
                        var segmentLabel = dataset.data[index];

                        ctx.beginPath();
                        ctx.arc(vm.x, vm.y, vm.outerRadius, sA, eA);
                        ctx.arc(vm.x, vm.y, vm.innerRadius, eA, sA, true);

                        ctx.closePath();
                        ctx.strokeStyle = vm.borderColor;
                        ctx.lineWidth = vm.borderWidth;

                        ctx.fillStyle = vm.backgroundColor;

                        ctx.fill();
                        ctx.lineJoin = 'bevel';

                        if (vm.borderWidth) {
                            ctx.stroke();
                        }

                        if (vm.circumference > 0.0015) { // Trying to hide label when it doesn't fit in segment
                            ctx.beginPath();
                            opts.defaultFontSize = 12;
                            opts.defaultFontStyle = 'normal';
                            opts.defaultFontFamily = 'Open Sans, sans-serif';
                            ctx.font = helpers.fontString(opts.defaultFontSize, opts.defaultFontStyle, opts.defaultFontFamily);
                            ctx.fillStyle = "#190707";
                            ctx.textBaseline = "top";
                            ctx.textAlign = "center";

                            // Round percentage in a way that it always adds up to 100%
                            ctx.fillStyle = "#ffffff";

                            if (ctx.canvas.id === 'private-CPU-halfDonut0' || ctx.canvas.id === 'private-CPU-halfDonut1' ||
                                ctx.canvas.id === 'private-CPU-halfDonut2' || ctx.canvas.id === 'private-RAM-halfDonut0' ||
                                ctx.canvas.id === 'private-RAM-halfDonut1' || ctx.canvas.id === 'private-RAM-halfDonut2') {
                                ctx.fillText(segmentLabel.toFixed(0) + "%", labelPos.x + 1, labelPos.y - 5);
                            } else {
                                ctx.fillText(segmentLabel.toFixed(0), labelPos.x + 1, labelPos.y - 5);
                            }
                        }
                        //display in the center the total sum of all segments

                    }
                });

                var model = arc._model;
                model.backgroundColor = custom.backgroundColor ? custom.backgroundColor : valueAtIndexOrDefault(dataset.backgroundColor, index, arcOpts.backgroundColor);
                model.hoverBackgroundColor = custom.hoverBackgroundColor ? custom.hoverBackgroundColor : valueAtIndexOrDefault(dataset.hoverBackgroundColor, index, arcOpts.hoverBackgroundColor);
                model.borderWidth = custom.borderWidth ? custom.borderWidth : valueAtIndexOrDefault(dataset.borderWidth, index, arcOpts.borderWidth);
                model.borderColor = custom.borderColor ? custom.borderColor : valueAtIndexOrDefault(dataset.borderColor, index, arcOpts.borderColor);

                // Set correct angles if not resetting
                if (!reset || !animationOpts.animateRotate) {
                    if (index === 0) {
                        model.startAngle = opts.rotation;
                    } else {
                        model.startAngle = _this.getMeta().data[index - 1]._model.endAngle;
                    }
                    model.endAngle = model.startAngle + model.circumference;

                }
                arc.pivot();
            }
        });

        //      Adding maintenace calendar event
        $scope.get_maintenace_events = function () {
            $http.get('/customer/mschedules/get_data/').then(function (response) {
                $scope.events = [];
                angular.forEach(response.data.results, function (value, key) {
                    $scope.events.push({
                        title: value.description,
                        startsAt: new Date(value.start_date),
                        endsAt: new Date(value.end_date),
                        status: value.status,
                        datacenter: value.colo_cloud.name,
                        color: '#F3B137',
                        draggable: true,
                        resizable: true,
                    });
                });

                $scope.calendarView = 'month';

                calendarConfig.allDateFormats.angular.date.weekDay = 'EEE';
                $scope.showCalender = true;
                $scope.showEvents = false;

                $scope.viewDate = new Date();
            });
        };

        $scope.get_maintenace_events();

        $scope.cellIsOpen = false;

        $scope.addEvent = function () {
            $scope.events.push({
                title: 'New event',
                startsAt: moment().startOf('day').toDate(),
                endsAt: moment().endOf('day').toDate(),
                color: calendarConfig.colorTypes.important,
                draggable: true,
                resizable: true,
            });
        };
        $scope.toggle = function ($event, field, event) {
            $event.preventDefault();
            $event.stopPropagation();
            event[field] = !event[field];
        };

        $scope.cell_events = [];
        $scope.timespanClicked = function (date, cell) {
            if ($scope.calendarView === 'month') {
                if (($scope.cellIsOpen && moment(date).startOf('day').isSame(moment($scope.viewDate).startOf('day'))) || cell.events.length === 0 || !cell.inMonth) {
                    $scope.cellIsOpen = false;
                } else {
                    $scope.cellIsOpen = false;
                    $scope.cell_events = cell.events;
                    $scope.showCalender = false;
                    $scope.showEvents = true;
                    $scope.viewDate = date;
                }
            } else if ($scope.calendarView === 'year') {
                if (($scope.cellIsOpen && moment(date).startOf('month').isSame(moment($scope.viewDate).startOf('month'))) || cell.events.length === 0) {
                    $scope.cellIsOpen = false;
                } else {
                    $scope.cell_events = cell.events;
                    $scope.showCalender = false;
                    $scope.showEvents = true;
                    $scope.cellIsOpen = false;
                    $scope.viewDate = date;
                }
            }
        };
        $scope.back = function () {
            $scope.showEvents = false;
            $scope.showCalender = true;
        };

        var modalInstance = null;
        var showmodel = function (templete, controllername) {

            if (modalInstance !== null) {
                modalInstance.dismiss('cancel');
            }
            $scope.loader = false;
            modalInstance = $uibModal.open({
                templateUrl: templete,
                controller: controllername,
                scope: $scope
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                // console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.cancel = function () {
            modalInstance.dismiss('cancel');
        };

        $scope.getEventsDetails = function (item) {
            $scope.ticket_rows = [
                { name: "title", description: "Title" },
                { name: "status", description: "Status" },
                { name: "datacenter", description: "Datacenter" },
                { name: "startsAt", description: "Start Date", type: "date" },
                { name: "endsAt", description: "End Date", type: "date" },
            ];
            // console.log(JSON.stringify(item));
            $scope.eventDetails = item;
            showmodel('static/rest/app/client/templates/maintenance_detail.html');

        };

        $scope.modifyCell = function (cell) {
            if (cell.badgeTotal != 0) {
                cell.cssClass = 'event-cell';
            }
        };

        // Maintenace calender event ends


        // Service Tickets Widget Start

        var update_tickets = function (ticket_metrics) {
            for (var i = 0; i < $scope.tickets.length; i++) {
                for (var j = 0; j < ticket_metrics.length; j++) {
                    if ($scope.tickets[i].id == ticket_metrics[j].id) {
                        $scope.tickets[i].assigned_on = ticket_metrics[j].metric.initially_assigned_at;
                        $scope.tickets[i].resolved_on = ticket_metrics[j].metric.solved_at;
                        continue;
                    }
                }
            }
            $scope.has_metrics = true;
        };
        $scope.has_metrics = false;
        var get_ticket_metrics = function (tickets) {
            $scope.has_metrics = false;
            var tickets_list = [];
            for (var i = 0; i < tickets.length; i++) {
                var ticket_obj = {};
                ticket_obj.id = tickets[i].id;
                ticket_obj.created_at = tickets[i].created_at;
                ticket_obj.status = tickets[i].status;
                tickets_list.push(ticket_obj);
            }

            $http({
                method: "POST",
                url: '/customer/ticketorganization/get_ticket_metrics/',
                data: tickets_list,
            }).then(function (response) {
                update_tickets(response.data.tickets_list);
            }).catch(function (error) {
                console.log('error in getting ticket metrics : ', angular.toJson(error));
                $scope.has_metrics = true;
            });
        };

        $scope.ticketsLoaded = false;
        $scope.getTickets = function (pageno, tickettype) {
            $scope.tickets = undefined;
            var params = {
                'page_no': pageno,
                'ticket_type': tickettype,
                'page_size': 10
            };
            $http({
                method: "GET",
                url: '/customer/ticketorganization/get_tickets_by_type',
                params: params
            }).then(function (response) {
                get_ticket_metrics(angular.copy(response.data.results));
                $scope.tickets = response.data.results;
                $scope.ticketsLoaded = true;
            }).catch(function (error) {
                $scope.tickets = [];
                $scope.ticketsLoaded = true;
            });
        };


        $scope.getServiceRequestTickets = function () {
            $scope.activeLineTab = 'Service Request';
            $scope.activetabLink = '#/ticket_management/support_tickets';
            $scope.getTickets(1, 'problem');
        };

        $scope.getIncidentMgmtTickets = function () {
            $scope.activeLineTab = 'Incident Management';
            $scope.activetabLink = '#/ticket_management/existing_tickets';
            $scope.getTickets(1, 'incident');
        };

        $scope.getChangeMgmtTickets = function () {
            $scope.activeLineTab = 'Change Management';
            $scope.activetabLink = '#/ticket_management/change_tickets';
            $scope.getTickets(1, 'task');
        };
        $scope.ticketHeaders = TableHeaders.tickets;
        $scope.getChangeMgmtTickets();


        // Service Tickets Widget End

        var getCabinetPDUViewData = function () {
            for (var i = 0; i < $scope.datacenters.length; i++) {
                var dc = $scope.datacenters[i];
                for (var j = 0; j < dc.cabinets.length; j++) {
                    if (j === 0) {
                        $scope.datacenters[i].cabinets[0]['datacenter_name'] = $scope.datacenters[i].datacenter_name;
                    }
                    var cabinet = dc.cabinets[j];
                    for (var k = 0; k < 4; k++) {
                        if (cabinet.pdus[k]) {
                            $scope.datacenters[i].cabinets[j].pdus[k]['color'] = cabinet.pdus[k].status === 2 ? 'grey' : cabinet.pdus[k].status === 0 ? 'red' : 'green';
                            $scope.datacenters[i].cabinets[j].pdus[k]['name'] = cabinet.pdus[k].status === 2 ? 'Not configured' : cabinet.pdus[k].name;
                        } else {
                            $scope.datacenters[i].cabinets[j].pdus[k] = {};
                            $scope.datacenters[i].cabinets[j].pdus[k]['color'] = 'grey';
                            $scope.datacenters[i].cabinets[j].pdus[k]['name'] = 'N/A';
                        }
                    }
                }
            }
        };

        var getDataCenterWidgetPadding = function (cardCount) {
            var arr = [];
            if (cardCount > 1) {
                for (var index = 0; index < cardCount; index++) {
                    if (index % 2 == 0) {
                        arr[index] = ' card-right-padding';
                    } else {
                        arr[index] = ' card-left-padding';
                    }
                }
            } else {
                arr[0] = 'dummy-card-padding';
            }
            return arr;
        };

        var getTempCabinets = function (cabinets) {
            for (var i = 0; i < cabinets.length; i++) {
                var obj = {};
                obj['datacenter_name'] = cabinets[i].datacenter_name;
                obj['datacenter_uuid'] = cabinets[i].datacenter_uuid;
                obj['cardCount'] = Math.ceil((cabinets[i].cabinets / 4));
                obj['cardPadding'] = getDataCenterWidgetPadding(obj['cardCount']);
                obj['cabinets'] = [];
                for (var j = 0; j < cabinets[i].cabinets; j++) {
                    obj['cabinets'].push({
                        "alerts": 0,
                        "capacity": 0,
                        "down_count": 0,
                        "total_power": 0,
                        "pdus": [
                            {
                                "status": 2,
                                "name": ""
                            }
                        ],
                        "occupied": 0,
                        "max_temperature": 0,
                        "cabinet_name": "",
                        "up_count": 0,
                        "datacenter_name": j == 0 ? cabinets[i].datacenter_name : undefined
                    });
                }
                $scope.datacenters.push(obj);
            }
        };

        var updateDatacenterData = function () {
            for (var i = 0; i < $scope.datacenters.length; i++) {
                $scope.datacenters[i]['cardCount'] = Math.ceil(($scope.datacenters[i].cabinets.length / 4));
                $scope.datacenters[i]['cardPadding'] = getDataCenterWidgetPadding($scope.datacenters[i]['cardCount']);
            }
        };

        $scope.widget_data_promise = function () {
            $scope.widgetLoading = $http.get('/customer/colo_cloud/datacenter_widget/').then(function (response) {
                $scope.widgetLoading = TaskService3.processTask(response.data.task_id, 500, 2000).then(function (result) {
                    $scope.datacenters = result;
                    updateDatacenterData();
                    getCabinetPDUViewData();
                }).catch(function (error) {
                });
            });
        };

        $scope.datacenters = [];
        $scope.getCabinetWidgetData = function () {
            $http.get('/customer/colo_cloud/dc_cabinets_count/').then(function (response) {
                getTempCabinets(response.data);
                $scope.widget_data_promise();
            });
        };
        $scope.getCabinetWidgetData();
    }
]);

app.controller('PieCtrl', [
    '$scope',
    'ClientDashboardService',
    '$interval',
    function ($scope, ClientDashboardService, $interval) {
        $scope.get_pie_widget = function () {
            // console.log("Pie chart");
            var widget_id = "11";
            ClientDashboardService.get_lm_widget_data(widget_id).then(function (result) {
                // console.log("Pie chart result:" + JSON.stringify(result));
                $scope.lm_content = result;
                $scope.chart_heading = result.data.title;
                var labels = [];
                var values = [];
                angular.forEach(result.data.data, function (value, key) {
                    labels.push(value['legend']);
                    values.push(value['value']);
                });
                $scope.labels = labels;
                $scope.data = values;
            });

            $scope.options = {
                legend: {
                    position: 'right',
                    display: true
                }
            };
        };
        $scope.get_pie_widget();
        $interval($scope.get_pie_widget, 10000);

    }]);

app.controller('BarCtrl', [
    '$scope',
    'ClientDashboardService',
    '$interval',
    '$filter',
    function ($scope, ClientDashboardService, $interval, $filter) {
        $scope.get_line_widget = function () {
            // console.log("Line chart");
            var widget_id = "12";
            ClientDashboardService.get_lm_widget_data(widget_id).then(function (result) {
                // console.log("Linear chart result:" + JSON.stringify(result));
                $scope.lm_content = result;
                $scope.chart_heading = result.data.title;
                var labels = [];
                var values = [];
                angular.forEach(result.data.timestamps, function (value, key) {
                    labels.push($filter('date')(value, 'hh:MM:ss'));
                });
                angular.forEach(result.data.lines[0].data, function (value, key) {
                    values.push(value / 1000000);
                });
                // console.log("values:" + values);
                $scope.legend = result.data.lines[0].legend;
                $scope.labels = labels;
                $scope.data = [values];
            });
            $scope.colors = [
                {
                    backgroundColor: 'rgba(159,204,0,0.2)',
                    borderColor: 'rgba(159,204,0,1)',
                    pointBackgroundColor: 'rgba(159,204,0,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: 'rgba(159,204,0,0.8)',
                    pointHoverBorderColor: 'rgba(159,204,0,1)'
                }];
            $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
            $scope.onClick = function (points, evt) {
                // console.log("Graph clicked");
            };

            $scope.options = {
                scales: {
                    yAxes: [
                        {
                            id: 'y-axis-1',
                            type: 'linear',
                            display: true,
                            position: 'left',
                            scaleLabel: {
                                display: true,
                                labelString: 'Memory(M)'
                            }
                        }

                    ],
                    xAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: $scope.legend
                            }
                        }
                    ]
                }
            };
        };
        $scope.get_line_widget();
        $interval($scope.get_line_widget, 10000);

    }]);

// app.controller('LMWidgetController', [
//     '$scope',
//     '$http',
//     '$sce',
//     'ClientDashboardService',
//     'CustomerULDBService',
//     'AlertService2',
//     function ($scope,
//               $http,
//               $sce,
//               ClientDashboardService,
//               CustomerULDBService,
//               AlertService2) {
//         $scope.showLMWidgetV2 = function () {
//             $http.get('/rest/lm_monitor/')
//                 .then(function (response) {
//                     $scope.widget_list = [];
//                     angular.forEach(response.data.data.items, function (value, key) {
//                         value.widget_url = $sce.trustAsResourceUrl(value.widget_url);
//                         $scope.widget_list.push(value);
//                     });
//                     $scope.lm_iframe_show = true;
//                 }).catch(function (e) {
//                 console.log(e);
//                 $scope.widget_list = [];
//                 $scope.lm_iframe_show = false;
//                 AlertService2.danger("Unable to fetch LM widgets! Please contact Adminstrator");
//             });
//         };

//         $scope.showLMWidgetV2();

//         $scope.widgetUpdate = function (prev_widget_id, selected_widget, index) {
//             var data = {
//                 "new_widget_id": selected_widget.id,
//                 "old_widget_id": prev_widget_id,
//                 "index": index
//             };
//             $http.post('/rest/lm_monitor/update_widget_list/', data).then(function (response) {
//                 angular.element(document.querySelector('#iframe' + index)).attr('src', response.data.url);
//             }).catch(function (e) {
//                 AlertService2.danger("Error occurred while updating widget");
//             });

//         };

//     }
// ]);
