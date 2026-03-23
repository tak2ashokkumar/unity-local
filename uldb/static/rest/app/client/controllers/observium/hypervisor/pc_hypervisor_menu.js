// var app = angular.module('uldb');

// app.controller('PCServerMenuController', [
//     '$scope',
//     '$rootScope',
//     '$state',
//     '$stateParams',
//     '$timeout',
//     '$http',
//     '$location',
//     function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {

//         $scope.pc_id = '';
//         $scope.server_id = '';
//         $scope.server_name = '';
//         $scope.loader = true;
//         $scope.showDetailsView = false;

//         var stateParams = angular.copy($stateParams);

//         if (angular.isDefined(stateParams.uuidp) && (stateParams.uuidp !== null) && 
//             angular.isDefined(stateParams.uuidc) && (stateParams.uuidc !== null) ) {
//             $scope.pc_id = stateParams.uuidp;
//             $scope.server_id = stateParams.uuidc;
//         } else {
//             return;
//         }

//         var base_state = $state.current.name.substring(0, $state.current.name.indexOf('hypervisor'));
//         var observium_state = base_state.concat('hypervisor');

//         $scope.setLoader = function (value) {
//             $scope.loader = value;
//         };

//         $scope.setActiveSubTab = function (value) {
//             $scope.activeSubTab = value;
//         };

//         $scope.setshowDetailsView = function (value) {
//             $scope.showDetailsView = value;
//         };

//         $scope.tabs = [
//             {
//                 'tabname': 'Overview'
//             },
//             {
//                 'tabname': 'Graphs',
//             },
//             {
//                 'tabname': 'Health',
//             },
//             {
//                 'tabname': 'Ports',
//             },
//             {
//                 'tabname': 'Logs',
//                 'disabled': true,
//             },
//             {
//                 'tabname': 'Alerts',
//             },
//         ];

//         switch ($state.current.name) {
//             case  observium_state + '.overview' :
//                 $scope.activeTab = 0;
//                 break;
//             case observium_state + '.graphs' :
//                 $scope.activeTab = 1;
//                 break;
//             case observium_state +  '.healthstats' :
//                 $scope.activeTab = 2;
//                 break;
//             case observium_state +  '.ports' :
//                 $scope.activeTab = 3;
//                 break;
//             case observium_state +  '.logs' :
//                 $scope.activeTab = 4;
//                 break;
//             case observium_state +  '.alerts' :
//                 $scope.activeTab = 5;
//                 break;
//             default :
//                 $scope.activeTab = 0;
//         }

//         $scope.activeSubTab = 0;
//         $scope.getTabData = function (tab) {
//             $scope.showDetailsView = false;
//             switch (tab.tabname) {
//                 case 'Overview' :
//                     $scope.setLoader(true);
//                     $scope.submenutabs = null;
//                     $state.go(observium_state + '.overview', null, {reload: observium_state + '.overview'});
//                     break;
//                 case 'Graphs' :
//                     $scope.setLoader(true);
//                     $scope.submenutabs = [];
//                     $state.go(observium_state + '.graphs', null, {reload: observium_state + '.graphs'});
//                     break;
//                 case 'Health' :
//                     $scope.setLoader(true);
//                     $scope.submenutabs = [];
//                     $state.go(observium_state + '.healthstats', null, {reload: observium_state + '.healthstats'});
//                     break;
//                 case 'Ports' :
//                     $scope.submenutabs = null;
//                     $state.go(observium_state + '.ports', null, {reload: observium_state + '.ports'});
//                     break;
//                 case 'Logs' :
//                     $scope.submenutabs = [
//                         {
//                             'tabname': 'Event log',
//                             'name': 'logs_events'
//                         },
//                         {
//                             'tabname': 'Alert log',
//                             'name': 'logs_alerts'
//                         },
//                     ];
//                     $state.go(observium_state + '.logs', null, {reload: observium_state + '.logs'});
//                     break;
//                 case 'Alerts' :
//                     $scope.setLoader(true);
//                     $scope.submenutabs = null;
//                     $state.go(observium_state + '.alerts', null, {reload: observium_state + '.alerts'});
//                     break;
//             }

//             $timeout(function () {
//                 $scope.activeSubTab = 0;
//                 $scope.addClassforTabs('.actonecls ul', $rootScope.secondLevelActiveIndex);
//                 $scope.removeClassforTabs('.acttwocls ul', 0);
//                 $scope.addClassforTabs('.acttwocls ul', 1);
//             }, 100);
//         };

//         $scope.getDetailedView = function (server_graph_obj) {
//             $scope.setLoader(true);
//             $scope.selectedGraphObj = angular.copy(server_graph_obj);
//             $scope.showDetailsView = true;
//             var params = {
//                 'graph_type': server_graph_obj.graphType,
//                 'from_date': new Date(Date.parse(server_graph_obj.from_date)).getTime() / 1000,
//                 'to_date': new Date(Date.parse(server_graph_obj.to_date)).getTime() / 1000,
//             };
//             $http({
//                 method: "GET",
//                 url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_by_type/',
//                 params: params,
//             }).then(function (response) {
//                 $scope.selectedGraphObj.graphDetails = response.data;
//                 $scope.setLoader(false);
//             }).catch(function (error) {
//                 $scope.error_details = error;
//                 $scope.selectedGraphObj.graphDetails = {};
//                 $scope.setLoader(false);
//             });
//         };

//         $scope.graphDateObj = {};
//         $scope.getGraphforDefaultDateRange = function (server_graph_obj) {
//             $scope.graphDateObj = server_graph_obj;
//             $scope.graphDateObj.from_date = new Date(Date.now() - 86400000);
//             $scope.graphDateObj.to_date = new Date();
//             $scope.getDetailedView($scope.graphDateObj);
//         };

//         $scope.getGraphforUpdatedDateRange = function () {
//             var graph_obj = angular.copy($scope.selectedGraphObj);
//             graph_obj.from_date = $scope.graphDateObj.from_date;
//             graph_obj.to_date = $scope.graphDateObj.to_date;
//             $scope.getDetailedView(graph_obj);
//         };

//         $scope.goToPreviousPage = function () {
//             var target_state = base_state.concat('hypervisors');
//             $state.go(target_state, {'uuidp' : $stateParams.uuidp, 'uuidc' : 'hypervisors'}, {reload: false});
//             console.log($rootScope.secondLevelActiveIndex);
//             $timeout(function () {
//                 $scope.addClassforTabs('.actonecls ul', $rootScope.secondLevelActiveIndex);
//                 $scope.removeClassforTabs('.acttwocls ul', 0);
//                 $scope.addClassforTabs('.acttwocls ul', 1);
//             }, 1000);
//         };
//     }
// ]);

// app.controller('PCServerOverviewController', [
//     '$scope',
//     '$state',
//     '$stateParams',
//     '$timeout',
//     '$http',
//     '$location',
//     function ($scope, $state, $stateParams, $timeout, $http, $location) {

//         var get_server_details = function () {
//             $http({
//                 method: "GET",
//                 url: '/customer/observium/servers/' + $scope.server_id + '/get_device_data/'
//             }).then(function (response) {
//                 $scope.server_details = response.data;
//                 $scope.server_details.device_data.uptime = $scope.getuptime(response.data);
//             }).catch(function (error) {
//                 $scope.server_details_error = error;
//                 $scope.server_details = {};
//                 $scope.setLoader(false);
//             });
//         };

//         var get_status_data = function () {
//             $http({
//                 method: "GET",
//                 url: '/customer/observium/servers/' + $scope.server_id + '/get_status_data'
//             }).then(function (response) {
//                 $scope.server_status_data = angular.copy(response.data);
//             }).catch(function (error) {
//                 $scope.server_status_error = error;
//                 $scope.server_status_data = {};
//                 $scope.setLoader(false);
//             });
//         };

//         var get_sensor_data = function () {
//             $http({
//                 method: "GET",
//                 url: '/customer/observium/servers/' + $scope.server_id + '/get_sensor_data'
//             }).then(function (response) {
//                 $scope.server_sensor_data = angular.copy(response.data);
//                 $scope.setLoader(false);
//             }).catch(function (error) {
//                 $scope.server_sensor_error = error;
//                 $scope.server_sensor_data = {};
//                 $scope.setLoader(false);
//             });
//         };

//         var get_memory_overview_graph = function () {
//             var params = {
//                 'legend': 'yes',
//                 'graph_type': 'device_ucd_memory',
//                 'height': '100',
//                 'width': '500'
//             };
//             $http({
//                 method: "GET",
//                 url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_by_type',
//                 params: params
//             }).then(function (response) {
//                 $scope.server_memory_overview_graph = angular.copy(response.data.graph);
//                 $scope.setLoader(false);
//             }).catch(function (error) {
//                 $scope.setLoader(false);
//             });
//         };

//         var get_cpu_overview_graph = function () {
//             var params = {
//                 'legend': 'yes',
//                 'graph_type': 'device_ucd_ss_cpu',
//                 'height': '100',
//                 'width': '500'
//             };
//             $http({
//                 method: "GET",
//                 url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_by_type',
//                 params: params
//             }).then(function (response) {
//                 $scope.server_cpu_overview_graph = angular.copy(response.data.graph);
//                 $scope.setLoader(false);
//             }).catch(function (error) {
//                 $scope.setLoader(false);
//             });
//         };

//         var get_device_bits_overview_graph = function () {
//             var params = {
//                 'legend': 'yes',
//                 'graph_type': 'device_bits',
//                 'height': '100',
//                 'width': '500'
//             };
//             $http({
//                 method: "GET",
//                 url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_by_type',
//                 params: params
//             }).then(function (response) {
//                 $scope.server_device_bits_overview_graph = angular.copy(response.data.graph);
//                 $scope.setLoader(false);
//             }).catch(function (error) {
//                 $scope.setLoader(false);
//             });
//         };

//         $scope.get_overview_data = function () {
//             get_server_details();
//             get_status_data();
//             get_sensor_data();
//             get_cpu_overview_graph();
//             get_memory_overview_graph();
//             get_device_bits_overview_graph();
//         };

//         $scope.get_overview_data();

//         $scope.get_sensor_subkeys = function (subkey) {
//             return Object.keys(subkey)[0];
//         };
//     }
// ]);
// app.controller('PCServerGraphController', [
//     '$scope',
//     '$state',
//     '$stateParams',
//     '$timeout',
//     '$http',
//     '$location',
//     'OberviumGraphConfig',
//     function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {
//         $scope.device_graph_data = [];
//         $scope.submenutabs = [
//             {
//                 'tabname': 'Netstats',
//                 'name': 'graphs_net_stats'
//             },
//             {
//                 'tabname': 'Poller',
//                 'name': 'graphs_poller'
//             },
//             {
//                 'tabname': 'System',
//                 'name': 'graphs_system'
//             }
//         ];

//         var get_server_graphs = function (graphconfig, graphnameconfig) {
//             var params = {
//                 'graph_type': graphconfig.graphType,
//             };
//             $http({
//                 method: "GET",
//                 url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_set_by_type/',
//                 params: params,
//             }).then(function (response) {
//                 graphconfig.graphDetails = response.data;
//                 $scope.device_graph_data.push(graphconfig);
//                 if (angular.equals($scope.device_graph_data.length, graphnameconfig.length)) {
//                     $scope.setLoader(false);
//                 }
//             }).catch(function (error) {
//                 $scope.error_details = error;
//                 $scope.server_details = {};
//                 $scope.setLoader(false);
//             });
//         };

//         var get_server_netstat_data = function () {
//             angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.NETSTATS), function (value, key) {
//                 var graphObj = {};
//                 graphObj.displayName = value.DISPLAYNAME;
//                 graphObj.graphType = value.GRAPHNAME;
//                 get_server_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.NETSTATS));
//             });
//         };

//         var get_server_poller_data = function () {
//             angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.POLLER), function (value, key) {
//                 var graphObj = {};
//                 graphObj.displayName = value.DISPLAYNAME;
//                 graphObj.graphType = value.GRAPHNAME;
//                 get_server_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.POLLER));
//             });
//         };

//         var get_server_system_data = function () {
//             angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.SYSTEM), function (value, key) {
//                 var graphObj = {};
//                 graphObj.displayName = value.DISPLAYNAME;
//                 graphObj.graphType = value.GRAPHNAME;
//                 get_server_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.SYSTEM));
//             });
//         };

//         $scope.getGraphSubtabsData = function (subtab) {
//             $scope.device_graph_data = [];
//             $scope.setLoader(true);
//             $scope.setshowDetailsView(false);
//             switch (subtab.name) {
//                 case 'graphs_net_stats' :
//                     $scope.setActiveSubTab(0);
//                     get_server_netstat_data();
//                     break;
//                 case 'graphs_poller' :
//                     $scope.setActiveSubTab(1);
//                     get_server_poller_data();
//                     break;
//                 case 'graphs_system' :
//                     $scope.setActiveSubTab(2);
//                     get_server_system_data();
//                     break;
//                 default:
//             }
//         };
//     }
// ]);

// app.controller('PCServerHealthStatsController', [
//     '$scope',
//     '$state',
//     '$stateParams',
//     '$timeout',
//     '$http',
//     '$location',
//     'OberviumGraphConfig',
//     function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {

//         $scope.device_graph_data = [];
//         $scope.submenutabs = [
//             {
//                 'tabname': 'Overview',
//                 'name': 'health_overview'
//             },
//         ];

//         var get_health_graphs = function (graphconfig, graphnameconfig) {
//             var params = {
//                 'graph_type': graphconfig.graphType,
//             };
//             $http({
//                 method: "GET",
//                 url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_set_by_type/',
//                 params: params,
//             }).then(function (response) {
//                 graphconfig.graphDetails = response.data;
//                 $scope.device_graph_data.push(graphconfig);
//                 if (angular.equals($scope.device_graph_data.length, graphnameconfig.length)) {
//                     $scope.setLoader(false);
//                 }
//             }).catch(function (error) {
//                 $scope.error_details = error;
//                 $scope.server_details = {};
//                 $scope.setLoader(false);
//             });
//         };

//         var get_health_overview_data = function () {
//             angular.forEach(OberviumGraphConfig.SERVER.HEALTHGRAPHS.OVERVIEW, function (value, key) {
//                 var graphObj = {};
//                 graphObj.displayName = value.DISPLAYNAME;
//                 graphObj.graphType = value.GRAPHNAME;
//                 get_health_graphs(graphObj, OberviumGraphConfig.SERVER.HEALTHGRAPHS.OVERVIEW);
//             });
//         };

//         $scope.getHealthtabSubtabsData = function (subtab) {
//             $scope.device_graph_data = [];
//             $scope.setLoader(true);
//             $scope.setshowDetailsView(false);
//             switch (subtab.name) {
//                 case 'health_overview' :
//                     get_health_overview_data();
//                     break;
//                 default:
//             }
//         };
//     }
// ]);

// app.controller('PCServerPortsController', [
//     '$scope',
//     '$state',
//     '$stateParams',
//     '$timeout',
//     '$http',
//     '$location',
//     function ($scope, $state, $stateParams, $timeout, $http, $location) {

//         $scope.getPortGraphs = function (port) {
//             var params = {
//                 'port_id': port.port_id
//             };
//             $http({
//                 method: "GET",
//                 url: '/customer/observium/servers/' + $scope.server_id + '/get_port_details_graph_set/',
//                 params: params,
//             }).then(function (response) {
//                 port.graph = response.data;
//             }).catch(function (error) {
//                 $scope.error_details = error;
//                 $scope.server_details = {};
//             });
//         };

//         var get_port_data = function () {
//             $http({
//                 method: "GET",
//                 url: '/customer/observium/servers/' + $scope.server_id + '/get_device_port_details/',
//             }).then(function (response) {
//                 $scope.portDetails = response.data;
//                 $scope.setLoader(false);
//             }).catch(function (error) {
//                 $scope.error_details = error;
//                 $scope.server_details = {};
//                 $scope.setLoader(false);
//             });
//         };

//         $scope.getPortsSubtabsData = function () {
//             $scope.setLoader(true);
//             get_port_data();
//         };

//         $scope.getPortsSubtabsData();

//     }
// ]);

// app.controller('PCServerLogsController', [
//     '$scope',
//     '$state',
//     '$stateParams',
//     '$timeout',
//     '$http',
//     '$location',
//     function ($scope, $state, $stateParams, $timeout, $http, $location) {
//         console.log('in serverLogsController with server : ', $scope.server_id);
//     }
// ]);

// app.controller('PCServerAlertsController', [
//     '$scope',
//     '$state',
//     '$stateParams',
//     '$timeout',
//     '$http',
//     '$location',
//     function ($scope, $state, $stateParams, $timeout, $http, $location) {
//         console.log('in serverAlertsController with server : ', $scope.server_id);
//         $scope.server_alerts = {};

//         var get_server_alerts = function (graphconfig) {
//             $http({
//                 method: "GET",
//                 url: '/customer/observium/servers/' + $scope.server_id + '/get_alert_data/',
//             }).then(function (response) {
//                 $scope.server_alerts = response.data;
//                 $scope.setLoader(false);
//             }).catch(function (error) {
//                 $scope.error_details = error;
//                 $scope.server_alerts = {};
//                 $scope.setLoader(false);
//             });
//         };

//         get_server_alerts();
//     }
// ]);