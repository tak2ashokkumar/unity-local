var app = angular.module('uldb');

app.controller('PDUMenuController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    '$window',
    function ($scope, $state, $stateParams, $timeout, $http, $location, $window) {
        var stateParams = angular.copy($stateParams.uuidp);
        $scope.pdu_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.pdu_id = stateParams;
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

        switch ($state.current.name) {
            case 'colo.pdu.overview' :
                $scope.activeTab = 0;
                break;
            case 'colo.pdu.graphs' :
                $scope.activeTab = 1;
                break;
            case 'colo.pdu.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'colo.pdu.ports' :
                $scope.activeTab = 3;
                break;
            case 'colo.pdu.logs' :
                $scope.activeTab = 4;
                break;
            case 'colo.pdu.alerts' :
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
                    $state.go('colo.pdu.overview', null, {reload: 'colo.pdu.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('colo.pdu.graphs', null, {reload: 'colo.pdu.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('colo.pdu.healthstats', null, {reload: 'colo.pdu.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('colo.pdu.ports', null, {reload: 'colo.pdu.ports'});
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
                        }
                    ];
                    $state.go('colo.pdu.logs', null, {reload: 'colo.pdu.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('colo.pdu.alerts', null, {reload: 'colo.pdu.alerts'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 1);
            }, 100);
        };

        var get_pdu_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + $scope.pdu_id + '/get_device_data/'
            }).then(function (response) {
                $scope.pdu_details = response.data;
                $scope.pdu_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.pdu_details_error = error;
                $scope.pdu_details = {};
                $scope.setLoader(false);
            });
        };
        get_pdu_details();

        $scope.getDetailedView = function (pdu_graph_obj) {
            $scope.setLoader(true);
            $scope.selectedGraphObj = angular.copy(pdu_graph_obj);
            $scope.showDetailsView = true;
            var params = {
                'graph_type': pdu_graph_obj.graphType,
                'from_date': new Date(Date.parse(pdu_graph_obj.from_date)).getTime() / 1000,
                'to_date': new Date(Date.parse(pdu_graph_obj.to_date)).getTime() / 1000,
            };
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + $scope.pdu_id + '/get_graph_by_type/',
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
        $scope.getGraphforDefaultDateRange = function (pdu_graph_obj) {
            $scope.graphDateObj = pdu_graph_obj;
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
            $state.go('colo.pdus', null, {reload: false});
            // $window.history.back();
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 1);
            }, 1000);
        };
    }
]);

app.controller('ColoCloudPDUMenuController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    '$window',
    function ($scope, $state, $stateParams, $timeout, $http, $location, $window) {
        // console.log('in ColoCloudPDUMenuController : ', angular.toJson($stateParams));
        var stateParams = angular.copy($stateParams.uuidc);

        $scope.colo_cloud_pdu_stats = true;

        $scope.pdu_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.pdu_id = stateParams;
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

        switch ($state.current.name) {
            case 'colo_cloud.pdu.overview' :
                $scope.activeTab = 0;
                break;
            case 'colo_cloud.pdu.graphs' :
                $scope.activeTab = 1;
                break;
            case 'colo_cloud.pdu.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'colo_cloud.pdu.ports' :
                $scope.activeTab = 3;
                break;
            case 'colo_cloud.pdu.logs' :
                $scope.activeTab = 4;
                break;
            case 'colo_cloud.pdu.alerts' :
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
                    $state.go('colo_cloud.pdu.overview', null, {reload: 'colo_cloud.pdu.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('colo_cloud.pdu.graphs', null, {reload: 'colo_cloud.pdu.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('colo_cloud.pdu.healthstats', null, {reload: 'colo_cloud.pdu.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('colo_cloud.pdu.ports', null, {reload: 'colo_cloud.pdu.ports'});
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
                        }
                    ];
                    $state.go('colo_cloud.pdu.logs', null, {reload: 'colo_cloud.pdu.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('colo_cloud.pdu.alerts', null, {reload: 'colo_cloud.pdu.alerts'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 1);
            }, 100);
        };

        var get_pdu_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + $scope.pdu_id + '/get_device_data/'
            }).then(function (response) {
                $scope.pdu_details = response.data;
                $scope.pdu_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.pdu_details_error = error;
                $scope.pdu_details = {};
                $scope.setLoader(false);
            });
        };
        get_pdu_details();

        $scope.getDetailedView = function (pdu_graph_obj) {
            $scope.setLoader(true);
            $scope.selectedGraphObj = angular.copy(pdu_graph_obj);
            $scope.showDetailsView = true;
            var params = {
                'graph_type': pdu_graph_obj.graphType,
                'from_date': new Date(Date.parse(pdu_graph_obj.from_date)).getTime() / 1000,
                'to_date': new Date(Date.parse(pdu_graph_obj.to_date)).getTime() / 1000,
            };
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + $scope.pdu_id + '/get_graph_by_type/',
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
        $scope.getGraphforDefaultDateRange = function (pdu_graph_obj) {
            $scope.graphDateObj = pdu_graph_obj;
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
            $state.go('colo_cloud.pdus', {uuidp: $stateParams.uuidp}, {reload: false});
            // $window.history.back();
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 1);
            }, 1000);
        };
    }
]);

app.controller('PDUOverviewController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log(' in PDUOverviewController ');

        var get_status_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + $scope.pdu_id + '/get_status_data'
            }).then(function (response) {
                $scope.pdu_status_data = angular.copy(response.data);
            }).catch(function (error) {
                $scope.pdu_status_error = error;
                $scope.pdu_status_data = {};
                $scope.setLoader(false);
            });
        };

        var get_sensor_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + $scope.pdu_id + '/get_sensor_data'
            }).then(function (response) {
                $scope.pdu_sensor_data = angular.copy(response.data);
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.pdu_sensor_error = error;
                $scope.pdu_sensor_data = {};
                $scope.setLoader(false);
            });
        };

        $scope.get_overview_data = function () {
            get_status_data();
            get_sensor_data();
        };

        $scope.get_overview_data();

        $scope.get_sensor_subkeys = function (subkey) {
            return Object.keys(subkey)[0];
        };
    }
]);

app.controller('PDUGraphController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {
        $scope.pdu_graph_data = [];
        console.log(' in PDUGraphController ');
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
        var get_pdu_graphs = function (graphconfig, graphnameconfig) {
            var params = {
                'graph_type': graphconfig.graphType,
            };
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + $scope.pdu_id + '/get_graph_set_by_type/',
                params: params
            }).then(function (response) {
                graphconfig.graphDetails = response.data;
                $scope.pdu_graph_data.push(graphconfig);
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.pdu_details = {};
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            });
        };

        var get_pdu_netstat_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.PDU.GRAPHS.NETSTATS), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_pdu_graphs(graphObj, angular.copy(OberviumGraphConfig.PDU.GRAPHS.NETSTATS));
            });
        };

        var get_pdu_poller_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.PDU.GRAPHS.POLLER), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_pdu_graphs(graphObj, angular.copy(OberviumGraphConfig.PDU.GRAPHS.POLLER));
            });
        };

        var get_pdu_system_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.PDU.GRAPHS.SYSTEM), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_pdu_graphs(graphObj, angular.copy(OberviumGraphConfig.PDU.GRAPHS.SYSTEM));
            });
        };

        $scope.getGraphSubtabsData = function (subtab) {
            $scope.pdu_graph_data = [];
            $scope.setLoader(true);
            $scope.setshowDetailsView(false);
            count = 0;
            switch (subtab.name) {
                case 'graphs_net_stats' :
                    $scope.setActiveSubTab(0);
                    get_pdu_netstat_data();
                    break;
                case 'graphs_poller' :
                    $scope.setActiveSubTab(1);
                    get_pdu_poller_data();
                    break;
                case 'graphs_system' :
                    $scope.setActiveSubTab(2);
                    get_pdu_system_data();
                    break;
                default:
            }
        };
        //$scope.getGraphSubtabsData(angular.copy($scope.submenutabs[0]));
    }
]);

app.controller('PDUHealthStatsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {

        $scope.pdu_graph_data = [];
        $scope.submenutabs = [
            {
                'tabname': 'Overview',
                'name': 'health_overview'
            }
        ];

        var count = 0;
        var get_health_graphs = function (graphconfig, graphnameconfig) {
            var params = {
                'graph_type': graphconfig.graphType
            };
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + $scope.pdu_id + '/get_graph_set_by_type/',
                params: params
            }).then(function (response) {
                graphconfig.graphDetails = response.data;
                $scope.pdu_graph_data.push(graphconfig);
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.pdu_details = {};
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            });
        };

        var get_health_overview_data = function () {
            angular.forEach(OberviumGraphConfig.PDU.HEALTHGRAPHS.OVERVIEW, function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_health_graphs(graphObj, OberviumGraphConfig.PDU.HEALTHGRAPHS.OVERVIEW);
            });
        };

        $scope.getHealthtabSubtabsData = function (subtab) {
            $scope.pdu_graph_data = [];
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

app.controller('PDUPortsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in PDUPortsController with PDU : ', $scope.pdu_id);

        $scope.getPortGraphs  = function(port){

            var params = {
                'port_id' : port.port_id
            };

            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + $scope.pdu_id + '/get_port_details_graph_set/',
                params: params
            }).then(function (response) {
                port.graph = response.data;
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.pdu_details = {};
            });
        };

        var get_port_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + $scope.pdu_id + '/get_device_port_details/',
            }).then(function (response) {
                $scope.portDetails = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.pdu_details = {};
                $scope.setLoader(false);
            });
        };

        $scope.getPortsSubtabsData = function () {
            $scope.setLoader(true);
            $scope.showPortDetailsView = false;
            get_port_data();
        };

        $scope.showPortDetails = function(port){
            $scope.selectedPort = port;
            $scope.showPortDetailsView = true;
        };


        $scope.getPortsSubtabsData();

    }
]);

app.controller('PDULogsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in PDULogsController with PDU : ', $scope.pdu_id);
    }
]);

app.controller('PDUAlertsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in PDUAlertsController with PDU : ', $scope.pdu_id);
        $scope.pdu_alerts = {};

        var get_pdu_alerts = function (graphconfig) {
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + $scope.pdu_id + '/get_alert_data/'
            }).then(function (response) {
                $scope.pdu_alerts = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.pdu_alerts = {};
                $scope.setLoader(false);
            });
        };

        get_pdu_alerts();
    }
]);
