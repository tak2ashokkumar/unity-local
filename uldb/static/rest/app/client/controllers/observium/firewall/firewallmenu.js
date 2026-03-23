var app = angular.module('uldb');

app.controller('FirewallMenuController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        var stateParams = angular.copy($stateParams.uuidp);

        console.log('in FirewallMenuController with : ', stateParams);
        $scope.firewall_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.firewall_id = stateParams;
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
            case 'devices.firewall.overview' :
                $scope.activeTab = 0;
                break;
            case 'devices.firewall.graphs' :
                $scope.activeTab = 1;
                break;
            case 'devices.firewall.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'devices.firewall.ports' :
                $scope.activeTab = 3;
                break;
            case 'devices.firewall.logs' :
                $scope.activeTab = 6;
                break;
            case 'devices.firewall.alerts' :
                $scope.activeTab = 7;
                break;
            default :
                $scope.activeTab = 0;
        }

        $scope.activeSubTab = 0;
        $scope.getTabData = function (tab) {
            $scope.showDetailsView = false;
            switch (tab.tabname) {
                case 'Overview' :
                    console.log('in overview tab');
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('devices.firewall.overview', null, {reload: 'devices.firewall.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('devices.firewall.graphs', null, {reload: 'devices.firewall.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('devices.firewall.healthstats', null, {reload: 'devices.firewall.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('devices.firewall.ports', null, {reload: 'devices.firewall.ports'});
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
                    $state.go('devices.firewall.logs', null, {reload: 'devices.firewall.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('devices.firewall.alerts', null, {reload: 'devices.firewall.alerts'});
                    break;
                default : 
                    console.log('something went wrong!');
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 0);
            }, 1000);
        };

        var get_firewall_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_device_data/'
            }).then(function (response) {
                $scope.firewall_details = response.data;
                $scope.firewall_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.firewall_details_error = error;
                $scope.firewall_details = {};
                $scope.setLoader(false);
            });
        };
        get_firewall_details();

        $scope.getDetailedView = function (graph_obj) {
            $scope.setLoader(true);
            $scope.selectedGraphObj = angular.copy(graph_obj);
            $scope.showDetailsView = true;
            var params = {
                'graph_type': graph_obj.graphType,
                'from_date': new Date(Date.parse(graph_obj.from_date)).getTime() / 1000,
                'to_date': new Date(Date.parse(graph_obj.to_date)).getTime() / 1000,
            };
            $http({
                method: "GET",
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_graph_by_type/',
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
        $scope.getGraphforDefaultDateRange = function (graph_obj) {
            $scope.graphDateObj = graph_obj;
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
            $state.go('devices.firewalls', null, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 0);
            }, 1000);
        };

    }
]);

app.controller('PCFirewallMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {

        $scope.pc_id = '';
        $scope.firewall_id = '';
        $scope.server_name = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        var stateParams = angular.copy($stateParams);

        if (angular.isDefined(stateParams.uuidp) && (stateParams.uuidp !== null) && 
            angular.isDefined(stateParams.uuidc) && (stateParams.uuidc !== null) ) {
            $scope.pc_id = stateParams.uuidp;
            $scope.firewall_id = stateParams.uuidc;
        } else {
            return;
        }

        var base_state = $state.current.name.substring(0, $state.current.name.indexOf('firewall'));
        var observium_state = base_state.concat('firewall');

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
                'tabname': 'Overview'
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
            case  observium_state + '.overview' :
                $scope.activeTab = 0;
                break;
            case observium_state + '.graphs' :
                $scope.activeTab = 1;
                break;
            case observium_state +  '.healthstats' :
                $scope.activeTab = 2;
                break;
            case observium_state +  '.ports' :
                $scope.activeTab = 3;
                break;
            case observium_state +  '.logs' :
                $scope.activeTab = 4;
                break;
            case observium_state +  '.alerts' :
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
                    $state.go(observium_state + '.overview', null, {reload: observium_state + '.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go(observium_state + '.graphs', null, {reload: observium_state + '.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go(observium_state + '.healthstats', null, {reload: observium_state + '.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go(observium_state + '.ports', null, {reload: observium_state + '.ports'});
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
                    $state.go(observium_state + '.logs', null, {reload: observium_state + '.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go(observium_state + '.alerts', null, {reload: observium_state + '.alerts'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', $rootScope.secondLevelActiveIndex);
                $scope.removeClassforTabs('.acttwocls ul', 0);
                $scope.addClassforTabs('.acttwocls ul', $rootScope.thirdLevelActiveIndex);
            }, 100);
        };

        var get_firewall_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_device_data/'
            }).then(function (response) {
                $scope.firewall_details = response.data;
                $scope.firewall_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.firewall_details_error = error;
                $scope.firewall_details = {};
                $scope.setLoader(false);
            });
        };
        get_firewall_details();

        $scope.getDetailedView = function (server_graph_obj) {
            $scope.setLoader(true);
            $scope.selectedGraphObj = angular.copy(server_graph_obj);
            $scope.showDetailsView = true;
            var params = {
                'graph_type': server_graph_obj.graphType,
                'from_date': new Date(Date.parse(server_graph_obj.from_date)).getTime() / 1000,
                'to_date': new Date(Date.parse(server_graph_obj.to_date)).getTime() / 1000,
            };
            $http({
                method: "GET",
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_graph_by_type/',
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
        $scope.getGraphforDefaultDateRange = function (server_graph_obj) {
            $scope.graphDateObj = server_graph_obj;
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
            var from_all_devices = localStorage.getItem('isAllDevicesStats');
            if(from_all_devices){
                var target_state = base_state.concat('all_devices');
                $state.go(target_state, {'uuidp' : $stateParams.uuidp, 'uuidc' : 'all_devices'}, {reload: false});
            }else{
                var target_state = base_state.concat('firewalls');
                $state.go(target_state, {'uuidp' : $stateParams.uuidp, 'uuidc' : 'firewalls'}, {reload: false});
            }
            $timeout(function () {
                localStorage.removeItem('isAllDevicesStats');
                $scope.addClassforTabs('.actonecls ul', $rootScope.secondLevelActiveIndex);
                $scope.removeClassforTabs('.acttwocls ul', 0);
                $scope.addClassforTabs('.acttwocls ul', $rootScope.thirdLevelActiveIndex);
            }, 1000);
        };
    }
]);

app.controller('PrivateCloudFirewallMenuController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        var stateParams = angular.copy($stateParams);

        console.log('in FirewallMenuController with : ', stateParams);
        $scope.firewall_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.sub_menu_tabs = true;

        if (angular.isDefined(stateParams.uuidc) && (stateParams.uuidc !== null)) {
            $scope.firewall_id = stateParams.uuidcc;
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
            case 'pc_cloud.firewall.overview' :
                $scope.activeTab = 0;
                break;
            case 'pc_cloud.firewall.graphs' :
                $scope.activeTab = 1;
                break;
            case 'pc_cloud.firewall.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'pc_cloud.firewall.ports' :
                $scope.activeTab = 3;
                break;
            case 'pc_cloud.firewall.logs' :
                $scope.activeTab = 6;
                break;
            case 'pc_cloud.firewall.alerts' :
                $scope.activeTab = 7;
                break;
            default :
                $scope.activeTab = 0;
        }

        $scope.activeSubTab = 0;
        $scope.getTabData = function (tab) {
            $scope.showDetailsView = false;
            switch (tab.tabname) {
                case 'Overview' :
                    console.log('in overview tab');
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('pc_cloud.firewall.overview', null, {reload: 'pc_cloud.firewall.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('pc_cloud.firewall.graphs', null, {reload: 'pc_cloud.firewall.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('pc_cloud.firewall.healthstats', null, {reload: 'pc_cloud.firewall.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('pc_cloud.firewall.ports', null, {reload: 'pc_cloud.firewall.ports'});
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
                    $state.go('pc_cloud.firewall.logs', null, {reload: 'pc_cloud.firewall.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('pc_cloud.firewall.alerts', null, {reload: 'pc_cloud.firewall.alerts'});
                    break;
                default : 
                    console.log('something went wrong!');
            }
        };

        var get_firewall_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_device_data/'
            }).then(function (response) {
                $scope.firewall_details = response.data;
                $scope.firewall_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.firewall_details_error = error;
                $scope.firewall_details = {};
                $scope.setLoader(false);
            });
        };
        get_firewall_details();

        $scope.getDetailedView = function (graph_obj) {
            $scope.setLoader(true);
            $scope.selectedGraphObj = angular.copy(graph_obj);
            $scope.showDetailsView = true;
            var params = {
                'graph_type': graph_obj.graphType,
                'from_date': new Date(Date.parse(graph_obj.from_date)).getTime() / 1000,
                'to_date': new Date(Date.parse(graph_obj.to_date)).getTime() / 1000,
            };
            $http({
                method: "GET",
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_graph_by_type/',
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
        $scope.getGraphforDefaultDateRange = function (graph_obj) {
            $scope.graphDateObj = graph_obj;
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
            var from_all_devices = localStorage.getItem('isAllDevicesStats');
            if(from_all_devices){
                $state.go('pc_cloud.all_devices', {uuidc : $stateParams.uuidc}, {reload: false});
            }else{
                $state.go('pc_cloud.firewalls', {uuidc : $stateParams.uuidc}, {reload: false});
            }
            localStorage.removeItem('isAllDevicesStats');
        };

    }
]);

app.controller('ColoCloudPCFirewallMenuController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        var stateParams = angular.copy($stateParams);

        console.log('in FirewallMenuController with : ', stateParams);
        $scope.firewall_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.sub_menu_tabs = true;

        if (angular.isDefined(stateParams.uuidc) && (stateParams.uuidc !== null)) {
            $scope.firewall_id = stateParams.uuidcc;
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
            case 'colo_cloud.pc_cloud.firewall.overview' :
                $scope.activeTab = 0;
                break;
            case 'colo_cloud.pc_cloud.firewall.graphs' :
                $scope.activeTab = 1;
                break;
            case 'colo_cloud.pc_cloud.firewall.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'colo_cloud.pc_cloud.firewall.ports' :
                $scope.activeTab = 3;
                break;
            case 'colo_cloud.pc_cloud.firewall.logs' :
                $scope.activeTab = 6;
                break;
            case 'colo_cloud.pc_cloud.firewall.alerts' :
                $scope.activeTab = 7;
                break;
            default :
                $scope.activeTab = 0;
        }

        $scope.activeSubTab = 0;
        $scope.getTabData = function (tab) {
            $scope.showDetailsView = false;
            switch (tab.tabname) {
                case 'Overview' :
                    console.log('in overview tab');
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('colo_cloud.pc_cloud.firewall.overview', null, {reload: 'colo_cloud.pc_cloud.firewall.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('colo_cloud.pc_cloud.firewall.graphs', null, {reload: 'colo_cloud.pc_cloud.firewall.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('colo_cloud.pc_cloud.firewall.healthstats', null, {reload: 'colo_cloud.pc_cloud.firewall.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('colo_cloud.pc_cloud.firewall.ports', null, {reload: 'colo_cloud.pc_cloud.firewall.ports'});
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
                    $state.go('colo_cloud.pc_cloud.firewall.logs', null, {reload: 'colo_cloud.pc_cloud.firewall.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('colo_cloud.pc_cloud.firewall.alerts', null, {reload: 'colo_cloud.pc_cloud.firewall.alerts'});
                    break;
                default : 
                    console.log('something went wrong!');
            }
        };

        var get_firewall_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_device_data/'
            }).then(function (response) {
                $scope.firewall_details = response.data;
                $scope.firewall_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.firewall_details_error = error;
                $scope.firewall_details = {};
                $scope.setLoader(false);
            });
        };
        get_firewall_details();

        $scope.getDetailedView = function (graph_obj) {
            $scope.setLoader(true);
            $scope.selectedGraphObj = angular.copy(graph_obj);
            $scope.showDetailsView = true;
            var params = {
                'graph_type': graph_obj.graphType,
                'from_date': new Date(Date.parse(graph_obj.from_date)).getTime() / 1000,
                'to_date': new Date(Date.parse(graph_obj.to_date)).getTime() / 1000,
            };
            $http({
                method: "GET",
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_graph_by_type/',
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
        $scope.getGraphforDefaultDateRange = function (graph_obj) {
            $scope.graphDateObj = graph_obj;
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
            var from_all_devices = localStorage.getItem('isAllDevicesStats');
            if(from_all_devices){
                $state.go('colo_cloud.pc_cloud.all_devices', {uuidc : $stateParams.uuidc}, {reload: false});
            }else{
                $state.go('colo_cloud.pc_cloud.firewalls', {uuidc : $stateParams.uuidc}, {reload: false});
            }
            localStorage.removeItem('isAllDevicesStats');
        };

    }
]);

app.controller('FirewallOverviewController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log(' in FirewallOverviewController ');

        var get_status_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_status_data'
            }).then(function (response) {
                $scope.firewall_status_data = angular.copy(response.data);
            }).catch(function (error) {
                $scope.firewall_status_error = error;
                $scope.firewall_status_data = {};
                $scope.setLoader(false);
            });
        };

        var get_sensor_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_sensor_data'
            }).then(function (response) {
                $scope.firewall_sensor_data = angular.copy(response.data);
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.firewall_sensor_error = error;
                $scope.firewall_sensor_data = {};
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

app.controller('FirewallGraphController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {
        $scope.device_graph_data = [];
        console.log(' in FirewallGraphController ');
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
            },
            {
                'tabname': 'Firewall',
                'name': 'graphs_firewall'
            }
        ];

        var count = 0;
        var get_device_graphs = function (graphconfig, graphnameconfig) {
            var params = {
                'graph_type': graphconfig.graphType,
            };
            $http({
                method: "GET",
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_graph_set_by_type/',
                params: params,
            }).then(function (response) {
                graphconfig.graphDetails = response.data;
                $scope.device_graph_data.push(graphconfig);
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            }).catch(function (error) {
                $scope.error_details = error;
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            });
        };

        var get_device_netstat_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.FIREWALL.GRAPHS.NETSTATS), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_device_graphs(graphObj, angular.copy(OberviumGraphConfig.FIREWALL.GRAPHS.NETSTATS));
            });
        };

        var get_device_poller_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.FIREWALL.GRAPHS.POLLER), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_device_graphs(graphObj, angular.copy(OberviumGraphConfig.FIREWALL.GRAPHS.POLLER));
            });
        };

        var get_device_system_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.FIREWALL.GRAPHS.SYSTEM), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_device_graphs(graphObj, angular.copy(OberviumGraphConfig.FIREWALL.GRAPHS.SYSTEM));
            });
        };

        var get_device_firewall_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.FIREWALL.GRAPHS.FIREWALL_GRAPHS), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_device_graphs(graphObj, angular.copy(OberviumGraphConfig.FIREWALL.GRAPHS.FIREWALL_GRAPHS));
            });
        };

        $scope.getGraphSubtabsData = function (subtab) {
            $scope.device_graph_data = [];
            $scope.setLoader(true);
            $scope.setshowDetailsView(false);
            count = 0;
            switch (subtab.name) {
                case 'graphs_net_stats' :
                    $scope.setActiveSubTab(0);
                    get_device_netstat_data();
                    break;
                case 'graphs_poller' :
                    $scope.setActiveSubTab(1);
                    get_device_poller_data();
                    break;
                case 'graphs_system' :
                    $scope.setActiveSubTab(2);
                    get_device_system_data();
                    break;
                case 'graphs_firewall' :
                    $scope.setActiveSubTab(3);
                    get_device_firewall_data();
                    break;
                default:
            }
        };
        //$scope.getGraphSubtabsData(angular.copy($scope.submenutabs[0]));
    }
]);

app.controller('FirewallHealthStatsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {

        $scope.graph_data = [];
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
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_graph_set_by_type/',
                params: params,
            }).then(function (response) {
                graphconfig.graphDetails = response.data;
                $scope.graph_data.push(graphconfig);
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            }).catch(function (error) {
                $scope.error_details = error;
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            });
        };

        var get_health_overview_data = function () {
            angular.forEach(OberviumGraphConfig.FIREWALL.HEALTHGRAPHS.OVERVIEW, function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_health_graphs(graphObj, OberviumGraphConfig.FIREWALL.HEALTHGRAPHS.OVERVIEW);
            });
        };

        $scope.getHealthtabSubtabsData = function (subtab) {
            $scope.graph_data = [];
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

app.controller('FirewallPortsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in FirewallPortsController with firewall : ', $scope.firewall_id);

        $scope.getPortGraphs = function (port) {
            var params = {
                'port_id': port.port_id
            };
            $http({
                method: "GET",
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_port_details_graph_set/',
                params: params,
            }).then(function (response) {
                port.graph = response.data;
            }).catch(function (error) {
                $scope.error_details = error;
            });
        };

        var get_port_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_device_port_details/',
            }).then(function (response) {
                $scope.portDetails = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
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

app.controller('FirewallLogsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in FirewallLogsController with Firewall : ', $scope.firewall_id);
    }
]);

app.controller('FirewallAlertsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in FirewallAlertsController with Firewall : ', $scope.firewall_id);
        $scope.alerts = {};

        var get_alerts = function (graphconfig) {
            $http({
                method: "GET",
                url: '/customer/observium/firewall/' + $scope.firewall_id + '/get_alert_data/',
            }).then(function (response) {
                $scope.alerts = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.alerts = {};
                $scope.setLoader(false);
            });
        };

        get_alerts();
    }
]);