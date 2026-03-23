var app = angular.module('uldb');

app.controller('VCloudMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {
        console.log("VCloudMenuController");

        $scope.show_observium_stats = true;
        $rootScope.thirdLevelActiveIndex = 2;
        var stateParams = angular.copy($stateParams.uuidq);

        $scope.vcloud_vm_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.vcloud_vm_id = stateParams;
        } else {
            return;
        }

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

        console.log("$state.current.name", $state.current.name);
        switch ($state.current.name) {
            case 'devices.vms.vcloudvm.overview' :
                $scope.activeTab = 0;
                break;
            case 'devices.vms.vcloudvm.graphs' :
                $scope.activeTab = 1;
                break;
            case 'devices.vms.vcloudvm.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'devices.vms.vcloudvm.ports' :
                $scope.activeTab = 3;
                break;
            case 'devices.vms.vcloudvm.logs' :
                $scope.activeTab = 4;
                break;
            case 'devices.vms.vcloudvm.alerts' :
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
                    $state.go('devices.vms.vcloudvm.overview', null, {reload: 'devices.vms.vcloudvm.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('devices.vms.vcloudvm.graphs', null, {reload: 'devices.vms.vcloudvm.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('devices.vms.vcloudvm.healthstats', null, {reload: 'devices.vms.vcloudvm.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('devices.vms.vcloudvm.ports', null, {reload: 'devices.vms.vcloudvm.ports'});
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
                    $state.go('devices.vms.vcloudvm.logs', null, {reload: 'devices.vms.vcloudvm.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('devices.vms.vcloudvm.alerts', null, {reload: 'devices.vms.vcloudvm.alerts'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 4);
                $scope.removeClassforTabs('.acttwocls ul', 0);
                $scope.addClassforTabs('.acttwocls ul', 2);
            }, 100);
        };

        var get_vcloud_vm_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/vcloud/' + $scope.vcloud_vm_id + '/get_device_data/'
            }).then(function (response) {
                $scope.vcloud_vm_details = response.data;
                $scope.vcloud_vm_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.vcloud_vm_details_error = error;
                $scope.vcloud_vm_details = {};
                $scope.setLoader(false);
            });
        };
        get_vcloud_vm_details();

        $scope.getDetailedView = function (vcloud_vms_graph_obj) {
            $scope.setLoader(true);
            $scope.selectedGraphObj = angular.copy(vcloud_vms_graph_obj);
            $scope.showDetailsView = true;
            var params = {
                'graph_type': vcloud_vms_graph_obj.graphType,
                'from_date': new Date(Date.parse(vcloud_vms_graph_obj.from_date)).getTime() / 1000,
                'to_date': new Date(Date.parse(vcloud_vms_graph_obj.to_date)).getTime() / 1000,
            };
            $http({
                method: "GET",
                url: '/customer/observium/vcloud/' + $scope.vcloud_vm_id + '/get_graph_by_type/',
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
        $scope.getGraphforDefaultDateRange = function (vcloud_vms_graph_obj) {
            $scope.graphDateObj = vcloud_vms_graph_obj;
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
            $state.go('devices.vms.vcloudvms', {uuidc: 'vcloudvms'}, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 4);
                $scope.removeClassforTabs('.acttwocls ul', 0);
                $scope.addClassforTabs('.acttwocls ul', 2);
            }, 1000);
        };

    }
]);


app.controller('VCloudOverviewController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {
        console.log(' in VCloudOverviewController ');

        var get_status_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/vcloud/' + $scope.vcloud_vm_id + '/get_status_data'
            }).then(function (response) {
                $scope.vcloud_vm_status_data = angular.copy(response.data);
            }).catch(function (error) {
                $scope.vcloud_vm_status_error = error;
                $scope.vcloud_vm_status_data = {};
                $scope.setLoader(false);
            });
        };

        var get_sensor_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/vcloud/' + $scope.vcloud_vm_id + '/get_sensor_data'
            }).then(function (response) {
                $scope.vcloud_vm_sensor_data = angular.copy(response.data);
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.vcloud_vm_sensor_error = error;
                $scope.vcloud_vm_sensor_data = {};
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
                url: '/customer/observium/vcloud/' + $scope.vcloud_vm_id + '/get_graph_by_type',
                params: params
            }).then(function (response) {
                $scope.vcloud_vm_memory_overview_graph = angular.copy(response.data.graph);
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
                url: '/customer/observium/vcloud/' + $scope.vcloud_vm_id + '/get_graph_by_type',
                params: params
            }).then(function (response) {
                $scope.vcloud_vm_cpu_overview_graph = angular.copy(response.data.graph);
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
                url: '/customer/observium/vcloud/' + $scope.vcloud_vm_id + '/get_graph_by_type',
                params: params
            }).then(function (response) {
                $scope.vcloud_vm_device_bits_overview_graph = angular.copy(response.data.graph);
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

app.controller('VCloudGraphController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {
        $scope.vcloud_vm_graph_data = [];
        console.log(' in VCloudGraphController ');
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
        var get_vcloud_vm_graphs = function (graphconfig, graphnameconfig) {
            var params = {
                'graph_type': graphconfig.graphType,
            };
            $http({
                method: "GET",
                url: '/customer/observium/vcloud/' + $scope.vcloud_vm_id + '/get_graph_set_by_type/',
                params: params
            }).then(function (response) {
                graphconfig.graphDetails = response.data;
                $scope.vcloud_vm_graph_data.push(graphconfig);
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.vcloud_vm_details = {};
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            });
        };

        var get_vcloud_vm_netstat_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.NETSTATS), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_vcloud_vm_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.NETSTATS));
            });
        };

        var get_vcloud_vm_poller_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.POLLER), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_vcloud_vm_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.POLLER));
            });
        };

        var get_vcloud_vm_system_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.SYSTEM), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_vcloud_vm_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.SYSTEM));
            });
        };

        $scope.getGraphSubtabsData = function (subtab) {
            $scope.vcloud_vm_graph_data = [];
            $scope.setLoader(true);
            $scope.setshowDetailsView(false);
            count = 0;
            switch (subtab.name) {
                case 'graphs_net_stats' :
                    $scope.setActiveSubTab(0);
                    get_vcloud_vm_netstat_data();
                    break;
                case 'graphs_poller' :
                    $scope.setActiveSubTab(1);
                    get_vcloud_vm_poller_data();
                    break;
                case 'graphs_system' :
                    $scope.setActiveSubTab(2);
                    get_vcloud_vm_system_data();
                    break;
                default:
            }
        };
        //$scope.getGraphSubtabsData(angular.copy($scope.submenutabs[0]));
    }
]);

app.controller('VCloudHealthStatsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {

        $scope.vcloud_vm_graph_data = [];
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
                url: '/customer/observium/vcloud/' + $scope.vcloud_vm_id + '/get_graph_set_by_type/',
                params: params
            }).then(function (response) {
                graphconfig.graphDetails = response.data;
                $scope.vcloud_vm_graph_data.push(graphconfig);
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.vcloud_vm_details = {};
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
            $scope.vcloud_vm_graph_data = [];
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

app.controller('VCloudPortsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in VCloudPortsController with vCloud : ', $scope.vcloud_vm_id);

        $scope.getPortGraphs = function (port) {
            var params = {
                'port_id': port.port_id
            };
            $http({
                method: "GET",
                url: '/customer/observium/vcloud/' + $scope.vcloud_vm_id + '/get_port_details_graph_set/',
                params: params
            }).then(function (response) {
                port.graph = response.data;
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.vcloud_vm_details = {};
            });
        };

        var get_port_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/vcloud/' + $scope.vcloud_vm_id + '/get_device_port_details/',
            }).then(function (response) {
                $scope.portDetails = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.vcloud_vm_details = {};
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

app.controller('VCloudLogsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in VCloudLogsController with Vmware : ', $scope.vcloud_vm_id);
    }
]);

app.controller('VCloudAlertsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in VCloudAlertsController with vCloud vm : ', $scope.vcloud_vm_id);
        $scope.vcloud_vm_alerts = {};

        var get_vcloud_vm_alerts = function (graphconfig) {
            $http({
                method: "GET",
                url: '/customer/observium/vcloud/' + $scope.vcloud_vm_id + '/get_alert_data/',
            }).then(function (response) {
                $scope.vcloud_vm_alerts = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.vcloud_vm_alerts = {};
                $scope.setLoader(false);
            });
        };

        get_vcloud_vm_alerts();
    }
]);
