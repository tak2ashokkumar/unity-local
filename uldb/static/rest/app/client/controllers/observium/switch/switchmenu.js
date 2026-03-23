var app = angular.module('uldb');

app.controller('SwitchMenuController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log("inside switchmenu controller");
        var stateParams = angular.copy($stateParams.uuidp);
        $scope.switch_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.switch_id = stateParams;
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
            case 'devices.switch.overview' :
                $scope.activeTab = 0;
                break;
            case 'devices.switch.graphs' :
                $scope.activeTab = 1;
                break;
            case 'devices.switch.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'devices.switch.ports' :
                $scope.activeTab = 3;
                break;
            case 'devices.switch.logs' :
                $scope.activeTab = 4;
                break;
            case 'devices.switch.alerts' :
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
                    $state.go('devices.switch.overview', null, {reload: 'devices.switch.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('devices.switch.graphs', null, {reload: 'devices.switch.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('devices.switch.healthstats', null, {reload: 'devices.switch.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('devices.switch.ports', null, {reload: 'devices.switch.ports'});
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
                    $state.go('devices.switch.logs', null, {reload: 'devices.switch.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('devices.switch.alerts', null, {reload: 'devices.switch.alerts'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 1);
            }, 1000);
        };

        var get_switch_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_device_data/'
            }).then(function (response) {
                $scope.switch_details = response.data;
                console.log('$scope.getuptime(response.data); : ', $scope.getuptime(response.data));
                $scope.switch_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.switch_details_error = error;
                $scope.switch_details = {};
                $scope.setLoader(false);
            });
        };
        get_switch_details();

        $scope.getDetailedView = function (switch_graph_obj) {
            $scope.setLoader(true);
            $scope.selectedGraphObj = angular.copy(switch_graph_obj);
            $scope.showDetailsView = true;
            var params = {
                'graph_type': switch_graph_obj.graphType,
                'from_date': new Date(Date.parse(switch_graph_obj.from_date)).getTime() / 1000,
                'to_date': new Date(Date.parse(switch_graph_obj.to_date)).getTime() / 1000
            };
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_graph_by_type/',
                params: params
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
        $scope.getGraphforDefaultDateRange = function (switch_graph_obj) {
            $scope.graphDateObj = switch_graph_obj;
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
            $state.go('devices.switches', null, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 1);
            }, 1000);
        };

    }
]);

app.controller('PCSwitchMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {

        $scope.pc_id = '';
        $scope.switch_id = '';
        $scope.server_name = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        var stateParams = angular.copy($stateParams);

        if (angular.isDefined(stateParams.uuidp) && (stateParams.uuidp !== null) && 
            angular.isDefined(stateParams.uuidc) && (stateParams.uuidc !== null) ) {
            $scope.pc_id = stateParams.uuidp;
            $scope.switch_id = stateParams.uuidc;
        } else {
            return;
        }

        var base_state = $state.current.name.substring(0, $state.current.name.indexOf('switch'));
        var observium_state = base_state.concat('switch');

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

        var get_switch_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_device_data/'
            }).then(function (response) {
                $scope.switch_details = response.data;
                $scope.switch_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.switch_details_error = error;
                $scope.switch_details = {};
                $scope.setLoader(false);
            });
        };
        get_switch_details();

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
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_graph_by_type/',
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
                var target_state = base_state.concat('switches');
                $state.go(target_state, {'uuidp' : $stateParams.uuidp, 'uuidc' : 'switches'}, {reload: false});
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

app.controller('PrivateCloudSwitchMenuController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log("inside switchmenu controller");
        var stateParams = angular.copy($stateParams);
        $scope.switch_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.sub_menu_tabs = true;

        if (angular.isDefined(stateParams.uuidc) && (stateParams.uuidc !== null)) {
            $scope.switch_id = stateParams.uuidcc;
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
            case 'pc_cloud.switch.overview' :
                $scope.activeTab = 0;
                break;
            case 'pc_cloud.switch.graphs' :
                $scope.activeTab = 1;
                break;
            case 'pc_cloud.switch.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'pc_cloud.switch.ports' :
                $scope.activeTab = 3;
                break;
            case 'pc_cloud.switch.logs' :
                $scope.activeTab = 4;
                break;
            case 'pc_cloud.switch.alerts' :
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
                    $state.go('pc_cloud.switch.overview', null, {reload: 'pc_cloud.switch.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('pc_cloud.switch.graphs', null, {reload: 'pc_cloud.switch.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('pc_cloud.switch.healthstats', null, {reload: 'pc_cloud.switch.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('pc_cloud.switch.ports', null, {reload: 'pc_cloud.switch.ports'});
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
                    $state.go('pc_cloud.switch.logs', null, {reload: 'pc_cloud.switch.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('pc_cloud.switch.alerts', null, {reload: 'pc_cloud.switch.alerts'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 1);
            }, 100);
        };

        var get_switch_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_device_data/'
            }).then(function (response) {
                $scope.switch_details = response.data;
                console.log('$scope.getuptime(response.data); : ', $scope.getuptime(response.data));
                $scope.switch_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.switch_details_error = error;
                $scope.switch_details = {};
                $scope.setLoader(false);
            });
        };
        get_switch_details();

        $scope.getDetailedView = function (switch_graph_obj) {
            $scope.setLoader(true);
            $scope.selectedGraphObj = angular.copy(switch_graph_obj);
            $scope.showDetailsView = true;
            var params = {
                'graph_type': switch_graph_obj.graphType,
                'from_date': new Date(Date.parse(switch_graph_obj.from_date)).getTime() / 1000,
                'to_date': new Date(Date.parse(switch_graph_obj.to_date)).getTime() / 1000
            };
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_graph_by_type/',
                params: params
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
        $scope.getGraphforDefaultDateRange = function (switch_graph_obj) {
            $scope.graphDateObj = switch_graph_obj;
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
                $state.go('pc_cloud.switches', {uuidc : $stateParams.uuidc}, {reload: false});
            }
            localStorage.removeItem('isAllDevicesStats');
        };

    }
]);

app.controller('ColoCloudPCSwitchMenuController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log("inside switchmenu controller");
        var stateParams = angular.copy($stateParams);
        $scope.switch_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.sub_menu_tabs = true;

        if (angular.isDefined(stateParams.uuidc) && (stateParams.uuidc !== null)) {
            $scope.switch_id = stateParams.uuidcc;
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
            case 'colo_cloud.pc_cloud.switch.overview' :
                $scope.activeTab = 0;
                break;
            case 'colo_cloud.pc_cloud.switch.graphs' :
                $scope.activeTab = 1;
                break;
            case 'colo_cloud.pc_cloud.switch.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'colo_cloud.pc_cloud.switch.ports' :
                $scope.activeTab = 3;
                break;
            case 'colo_cloud.pc_cloud.switch.logs' :
                $scope.activeTab = 4;
                break;
            case 'colo_cloud.pc_cloud.switch.alerts' :
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
                    $state.go('colo_cloud.pc_cloud.switch.overview', null, {reload: 'colo_cloud.pc_cloud.switch.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('colo_cloud.pc_cloud.switch.graphs', null, {reload: 'colo_cloud.pc_cloud.switch.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('colo_cloud.pc_cloud.switch.healthstats', null, {reload: 'colo_cloud.pc_cloud.switch.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('colo_cloud.pc_cloud.switch.ports', null, {reload: 'colo_cloud.pc_cloud.switch.ports'});
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
                    $state.go('colo_cloud.pc_cloud.switch.logs', null, {reload: 'colo_cloud.pc_cloud.switch.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('colo_cloud.pc_cloud.switch.alerts', null, {reload: 'colo_cloud.pc_cloud.switch.alerts'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 1);
            }, 100);
        };

        var get_switch_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_device_data/'
            }).then(function (response) {
                $scope.switch_details = response.data;
                console.log('$scope.getuptime(response.data); : ', $scope.getuptime(response.data));
                $scope.switch_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.switch_details_error = error;
                $scope.switch_details = {};
                $scope.setLoader(false);
            });
        };
        get_switch_details();

        $scope.getDetailedView = function (switch_graph_obj) {
            $scope.setLoader(true);
            $scope.selectedGraphObj = angular.copy(switch_graph_obj);
            $scope.showDetailsView = true;
            var params = {
                'graph_type': switch_graph_obj.graphType,
                'from_date': new Date(Date.parse(switch_graph_obj.from_date)).getTime() / 1000,
                'to_date': new Date(Date.parse(switch_graph_obj.to_date)).getTime() / 1000
            };
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_graph_by_type/',
                params: params
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
        $scope.getGraphforDefaultDateRange = function (switch_graph_obj) {
            $scope.graphDateObj = switch_graph_obj;
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
                $state.go('colo_cloud.pc_cloud.switches', {uuidc : $stateParams.uuidc}, {reload: false});
            }
            localStorage.removeItem('isAllDevicesStats');
        };

    }
]);

app.controller('SwitchOverviewController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log(' in SwitchOverviewController ');

        var get_status_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_status_data'
            }).then(function (response) {
                $scope.switch_status_data = angular.copy(response.data);
            }).catch(function (error) {
                $scope.switch_status_error = error;
                $scope.switch_status_data = {};
                $scope.setLoader(false);
            });
        };

        var get_sensor_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_sensor_data'
            }).then(function (response) {
                $scope.switch_sensor_data = angular.copy(response.data);
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.switch_sensor_error = error;
                $scope.switch_sensor_data = {};
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

app.controller('SwitchGraphController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {
        $scope.switch_graph_data = [];
        console.log(' in SwitchGraphController ');
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
        var get_switch_graphs = function (graphconfig, graphnameconfig) {
            var params = {
                'graph_type': graphconfig.graphType,
            };
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_graph_set_by_type/',
                params: params
            }).then(function (response) {
                graphconfig.graphDetails = response.data;
                $scope.switch_graph_data.push(graphconfig);
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.switch_details = {};
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            });
        };

        var get_switch_netstat_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SWITCH.GRAPHS.NETSTATS), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_switch_graphs(graphObj, angular.copy(OberviumGraphConfig.SWITCH.GRAPHS.NETSTATS));
            });
        };

        var get_switch_poller_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SWITCH.GRAPHS.POLLER), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_switch_graphs(graphObj, angular.copy(OberviumGraphConfig.SWITCH.GRAPHS.POLLER));
            });
        };

        var get_switch_system_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SWITCH.GRAPHS.SYSTEM), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_switch_graphs(graphObj, angular.copy(OberviumGraphConfig.SWITCH.GRAPHS.SYSTEM));
            });
        };

        $scope.getGraphSubtabsData = function (subtab) {
            $scope.switch_graph_data = [];
            $scope.setLoader(true);
            $scope.setshowDetailsView(false);
            count = 0;
            switch (subtab.name) {
                case 'graphs_net_stats' :
                    $scope.setActiveSubTab(0);
                    get_switch_netstat_data();
                    break;
                case 'graphs_poller' :
                    $scope.setActiveSubTab(1);
                    get_switch_poller_data();
                    break;
                case 'graphs_system' :
                    $scope.setActiveSubTab(2);
                    get_switch_system_data();
                    break;
                default:
            }
        };
        //$scope.getGraphSubtabsData(angular.copy($scope.submenutabs[0]));
    }
]);

app.controller('SwitchHealthStatsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {

        $scope.switch_graph_data = [];
        $scope.submenutabs = [
            {
                'tabname': 'Overview',
                'name': 'health_overview'
            }
        ];

        var count = 0;
        var get_health_graphs = function (graphconfig, graphnameconfig) {
            var params = {
                'graph_type': graphconfig.graphType,
            };
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_graph_set_by_type/',
                params: params
            }).then(function (response) {
                graphconfig.graphDetails = response.data;
                $scope.switch_graph_data.push(graphconfig);
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.switch_details = {};
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            });
        };

        var get_health_overview_data = function () {
            angular.forEach(OberviumGraphConfig.SWITCH.HEALTHGRAPHS.OVERVIEW, function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_health_graphs(graphObj, OberviumGraphConfig.SWITCH.HEALTHGRAPHS.OVERVIEW);
            });
        };

        $scope.getHealthtabSubtabsData = function (subtab) {
            $scope.switch_graph_data = [];
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

app.controller('SwitchPortsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in SwitchPortsController with Switch : ', $scope.switch_id);

        $scope.getPortGraphs = function (port) {
            var params = {
                'port_id': port.port_id
            };
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_port_details_graph_set/',
                params: params
            }).then(function (response) {
                port.graph = response.data;
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.switch_details = {};
            });
        };

        var get_port_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_device_port_details/',
            }).then(function (response) {
                $scope.portDetails = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.switch_details = {};
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

app.controller('SwitchLogsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in SwitchLogsController with Switch : ', $scope.switch_id);
    }
]);

app.controller('SwitchAlertsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in SwitchAlertsController with Switch : ', $scope.switch_id);
        $scope.switch_alerts = {};

        var get_switch_alerts = function (graphconfig) {
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $scope.switch_id + '/get_alert_data/',
            }).then(function (response) {
                $scope.switch_alerts = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.switch_alerts = {};
                $scope.setLoader(false);
            });
        };

        get_switch_alerts();
    }
]);