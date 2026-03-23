var app = angular.module('uldb');

app.controller('AWSMenuController', [
    '$scope',
    '$state',
    '$rootScope',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $rootScope, $stateParams, $timeout, $http, $location) {

        $scope.instance_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        var flag = localStorage.getItem('isInstanceStats');

        var stateParams = {};
        stateParams.account_id = angular.copy($stateParams.uuidp);
        stateParams.region_name = angular.copy($stateParams.uuidc);
        stateParams.instance_id = angular.copy($stateParams.uuidq);

        var isParamsExist = function () {
            return angular.isDefined(stateParams.account_id) && (stateParams.account_id !== null) &&
                angular.isDefined(stateParams.region_name) && (stateParams.region_name !== null) &&
                angular.isDefined(stateParams.instance_id) && (stateParams.instance_id !== null);
        };

        if (isParamsExist()) {
            $scope.instance_id = stateParams.instance_id;
        } else {
            return;
        }

        console.log('$scope.instance_id : ', $scope.instance_id);

        var manageBreadcrumbLink = function (breadcrumb) {
            if (flag) {
                if (breadcrumb.route === 'public_cloud.aws-account-region-inventory') {
                    return true;
                }
            } else {
                if (breadcrumb.route === 'public_cloud.aws-account-region-vms') {
                    return true;
                }
            }
            return false;
        };

        angular.forEach($rootScope.breadCrumbArray, function (value, key) {
            if (manageBreadcrumbLink(value)) {
                var str = value.link;
                str = str.replace(":uuidp", stateParams.account_id);
                str = str.replace(":uuidc", stateParams.region_name);
                value.link = str;
                $timeout(function () {
                    $rootScope.breadCrumbArray[key] = value;
                }, 1000);
            }
        });

        $scope.setLoader = function (value) {
            $scope.loader = value;
        };

        $scope.setActiveSubTab = function (value) {
            $scope.activeSubTab = value;
        };

        $scope.setshowDetailsView = function (value) {
            $scope.showDetailsView = value;
        };

        $scope.tabs = [
            {
                'tabname': 'Overview',
            },
            {
                'tabname': 'Graphs',
            },
            {
                'tabname': 'Health',
            },
            {
                'tabname': 'Ports',
            },
            {
                'tabname': 'Logs',
                'disabled': true,
            },
            {
                'tabname': 'Alerts',
            },
        ];

        switch ($state.current.name) {
            case 'public_cloud.aws-account-region-vm.overview' :
                $scope.activeTab = 0;
                break;
            case 'public_cloud.aws-account-region-vm.graphs' :
                $scope.activeTab = 1;
                break;
            case 'public_cloud.aws-account-region-vm.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'public_cloud.aws-account-region-vm.ports' :
                $scope.activeTab = 3;
                break;
            case 'public_cloud.aws-account-region-vm.logs' :
                $scope.activeTab = 4;
                break;
            case 'public_cloud.aws-account-region-vm.alerts' :
                $scope.activeTab = 5;
                break;
            default :
                $scope.activeTab = 0;
        }

        $scope.activeSubTab = 0;
        $scope.getTabData = function (tab) {
            $scope.showDetailsView = false;
            switch (tab.tabname) {
                case 'Overview' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('public_cloud.aws-account-region-vm.overview', null, {reload: 'public_cloud.aws-account-region-vm.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('public_cloud.aws-account-region-vm.graphs', null, {reload: 'public_cloud.aws-account-region-vm.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('public_cloud.aws-account-region-vm.healthstats', null, {reload: 'public_cloud.aws-account-region-vm.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('public_cloud.aws-account-region-vm.ports', null, {reload: 'public_cloud.aws-account-region-vm.ports'});
                    break;
                case 'Logs' :
                    $scope.submenutabs = [
                        {
                            'tabname': 'Event log',
                            'name': 'logs_events'
                        },
                        {
                            'tabname': 'Alert log',
                            'name': 'logs_alerts'
                        },
                    ];
                    $state.go('public_cloud.aws-account-region-vm.logs', null, {reload: 'public_cloud.aws-account-region-vm.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('public_cloud.aws-account-region-vm.alerts', null, {reload: 'public_cloud.aws-account-region-vm.alerts'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 0);
            }, 100);
        };

        var get_aws_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/aws/' + $scope.instance_id + '/get_device_data/'
            }).then(function (response) {
                $scope.aws_details = response.data;
                $scope.aws_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.aws_details_error = error;
                $scope.aws_details = {};
                $scope.setLoader(false);
            });
        };
        get_aws_details();

        $scope.getDetailedView = function (aws_graph_obj) {
            $scope.setLoader(true);
            $scope.selectedGraphObj = angular.copy(aws_graph_obj);
            $scope.showDetailsView = true;
            var params = {
                'graph_type': aws_graph_obj.graphType,
                'from_date': new Date(Date.parse(aws_graph_obj.from_date)).getTime() / 1000,
                'to_date': new Date(Date.parse(aws_graph_obj.to_date)).getTime() / 1000,
            };
            $http({
                method: "GET",
                url: '/customer/observium/aws/' + $scope.instance_id + '/get_graph_by_type/',
                params: params,
            }).then(function (response) {
                $scope.selectedGraphObj.graphDetails = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.selectedGraphObj.graphDetails = {};
                $scope.setLoader(false);
            });
        };

        $scope.graphDateObj = {};
        $scope.getGraphforDefaultDateRange = function (aws_graph_obj) {
            $scope.graphDateObj = aws_graph_obj;
            $scope.graphDateObj.from_date = new Date(Date.now() - 86400000);
            $scope.graphDateObj.to_date = new Date();
            $scope.getDetailedView($scope.graphDateObj);
        };

        $scope.getGraphforUpdatedDateRange = function () {
            var graph_obj = angular.copy($scope.selectedGraphObj);
            graph_obj.from_date = $scope.graphDateObj.from_date;
            graph_obj.to_date = $scope.graphDateObj.to_date;
            $scope.getDetailedView(graph_obj);
        };

        $scope.goToPreviousPage = function () {
            if (flag) {
                $state.go('public_cloud.aws-account-region-inventory', {
                    uuidp: stateParams.account_id,
                    uuidc: stateParams.region_name
                }, {reload: false});
                $timeout(function () {
                    $scope.addClassforTabs('.actonecls ul', 0);
                }, 1000);
            } else {
                $state.go('public_cloud.aws-account-region-vms', {
                    uuidp: stateParams.account_id,
                    uuidc: stateParams.region_name
                }, {reload: false});
                $timeout(function () {
                    $scope.addClassforTabs('.actonecls ul', 0);
                }, 1000);
            }
            localStorage.removeItem('isInstanceStats');
        };
    }
]);

app.controller('AWSOverviewController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig', 
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {
        console.log(' in AWSOverviewController ');

        var get_status_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/aws/' + $scope.instance_id + '/get_status_data'
            }).then(function (response) {
                $scope.aws_status_data = angular.copy(response.data);
            }).catch(function (error) {
                $scope.aws_status_error = error;
                $scope.aws_status_data = {};
                $scope.setLoader(false);
            });
        };

        var get_sensor_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/aws/' + $scope.instance_id + '/get_sensor_data'
            }).then(function (response) {
                $scope.aws_sensor_data = angular.copy(response.data);
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.aws_sensor_error = error;
                $scope.aws_sensor_data = {};
                $scope.setLoader(false);
            });
        };

        var get_memory_overview_graph = function () {
            var params = {
                'legend': 'yes',
                'graph_type': OberviumGraphConfig.VM_OVERVIEW.MEMORY,
                'height': '100',
                'width': '500'
            };
            $http({
                method: "GET",
                url: '/customer/observium/aws/' + $scope.instance_id + '/get_graph_by_type',
                params: params
            }).then(function (response) {
                $scope.aws_memory_overview_graph = angular.copy(response.data.graph);
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.setLoader(false);
            });
        };

        var get_cpu_overview_graph = function () {
            var params = {
                'legend': 'yes',
                'graph_type': OberviumGraphConfig.VM_OVERVIEW.PROCESSOR,
                'height': '100',
                'width': '500'
            };
            $http({
                method: "GET",
                url: '/customer/observium/aws/' + $scope.instance_id + '/get_graph_by_type',
                params: params
            }).then(function (response) {
                $scope.aws_cpu_overview_graph = angular.copy(response.data.graph);
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.setLoader(false);
            });
        };

        var get_device_bits_overview_graph = function () {
            var params = {
                'legend': 'yes',
                'graph_type': 'device_bits',
                'height': '100',
                'width': '500'
            };
            $http({
                method: "GET",
                url: '/customer/observium/aws/' + $scope.instance_id + '/get_graph_by_type',
                params: params
            }).then(function (response) {
                $scope.aws_device_bits_overview_graph = angular.copy(response.data.graph);
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.setLoader(false);
            });
        };

        $scope.get_overview_data = function () {
            get_status_data();
            get_sensor_data();
            get_cpu_overview_graph();
            get_memory_overview_graph();
            get_device_bits_overview_graph();
        };

        $scope.get_overview_data();

        $scope.get_sensor_subkeys = function (subkey) {
            return Object.keys(subkey)[0];
        };
    }
]);

app.controller('AWSGraphController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {
        $scope.aws_graph_data = [];
        console.log(' in AWSGraphController ');
        $scope.submenutabs = [
            {
                'tabname': 'Netstats',
                'name': 'graphs_net_stats'
            },
            {
                'tabname': 'Poller',
                'name': 'graphs_poller'
            },
            {
                'tabname': 'System',
                'name': 'graphs_system'
            }
        ];

        var count = 0;
        var get_aws_graphs = function (graphconfig, graphnameconfig) {
            var params = {
                'graph_type': graphconfig.graphType,
            };
            $http({
                method: "GET",
                url: '/customer/observium/aws/' + $scope.instance_id + '/get_graph_set_by_type/',
                params: params,
            }).then(function (response) {
                graphconfig.graphDetails = response.data;
                $scope.aws_graph_data.push(graphconfig);
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.aws_details = {};
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            });
        };

        var get_aws_netstat_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.NETSTATS), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_aws_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.NETSTATS));
            });
        };

        var get_aws_poller_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.POLLER), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_aws_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.POLLER));
            });
        };

        var get_aws_system_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.SYSTEM), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_aws_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.SYSTEM));
            });
        };

        $scope.getGraphSubtabsData = function (subtab) {
            $scope.aws_graph_data = [];
            $scope.setLoader(true);
            $scope.setshowDetailsView(false);
            count = 0;
            switch (subtab.name) {
                case 'graphs_net_stats' :
                    $scope.setActiveSubTab(0);
                    get_aws_netstat_data();
                    break;
                case 'graphs_poller' :
                    $scope.setActiveSubTab(1);
                    get_aws_poller_data();
                    break;
                case 'graphs_system' :
                    $scope.setActiveSubTab(2);
                    get_aws_system_data();
                    break;
                default:
            }
        };
        //$scope.getGraphSubtabsData(angular.copy($scope.submenutabs[0]));
    }
]);

app.controller('AWSHealthStatsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {

        $scope.aws_graph_data = [];
        $scope.submenutabs = [
            {
                'tabname': 'Overview',
                'name': 'health_overview'
            },
        ];

        var count = 0;
        var get_health_graphs = function (graphconfig, graphnameconfig) {
            var params = {
                'graph_type': graphconfig.graphType,
            };
            $http({
                method: "GET",
                url: '/customer/observium/aws/' + $scope.instance_id + '/get_graph_set_by_type/',
                params: params,
            }).then(function (response) {
                graphconfig.graphDetails = response.data;
                $scope.aws_graph_data.push(graphconfig);
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.aws_details = {};
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            });
        };

        var get_health_overview_data = function () {
            angular.forEach(OberviumGraphConfig.SERVER.HEALTHGRAPHS.OVERVIEW, function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_health_graphs(graphObj, OberviumGraphConfig.SERVER.HEALTHGRAPHS.OVERVIEW);
            });
        };

        $scope.getHealthtabSubtabsData = function (subtab) {
            $scope.aws_graph_data = [];
            $scope.setLoader(true);
            $scope.setshowDetailsView(false);
            count = 0;
            switch (subtab.name) {
                case 'health_overview' :
                    get_health_overview_data();
                    break;
                default:
            }
        };
        // $scope.getHealthtabSubtabsData($scope.submenutabs[0]);
    }
]);

app.controller('AWSPortsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in AWSPortsController with AWS : ', $scope.instance_id);

        $scope.getPortGraphs = function (port) {
            var params = {
                'port_id': port.port_id
            };
            $http({
                method: "GET",
                url: '/customer/observium/aws/' + $scope.instance_id + '/get_port_details_graph_set/',
                params: params,
            }).then(function (response) {
                port.graph = response.data;
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.aws_details = {};
            });
        };

        var get_port_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/aws/' + $scope.instance_id + '/get_device_port_details/',
            }).then(function (response) {
                $scope.portDetails = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.aws_details = {};
                $scope.setLoader(false);
            });
        };

        $scope.getPortsSubtabsData = function () {
            $scope.setLoader(true);
            get_port_data();
        };

        $scope.getPortsSubtabsData();

    }
]);

app.controller('AWSLogsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in AWSLogsController with AWS : ', $scope.instance_id);
    }
]);

app.controller('AWSAlertsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in AWSAlertsController with AWS : ', $scope.instance_id);
        $scope.aws_alerts = {};

        var get_aws_alerts = function (graphconfig) {
            $http({
                method: "GET",
                url: '/customer/observium/aws/' + $scope.instance_id + '/get_alert_data/',
            }).then(function (response) {
                $scope.aws_alerts = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.aws_alerts = {};
                $scope.setLoader(false);
            });
        };

        get_aws_alerts();
    }
]);
