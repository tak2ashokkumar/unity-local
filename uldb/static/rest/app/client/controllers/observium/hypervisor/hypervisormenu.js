var app = angular.module('uldb');

app.controller('ServerMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {
        console.log("inside servermenu controller");
        var stateParams = angular.copy($stateParams.uuidp);
        $scope.server_id = '';
        $scope.server_name = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        var flag = localStorage.getItem('isBareMetalStats');

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.server_id = stateParams;
        } else {
            return;
        }

        if(flag){
            $scope.server_name = 'Bare Metal Server';
        }else{
            $scope.server_name = 'Hypervisor';
        }

        var manageBreadcrumbLink = function (breadcrumb) {
            console.log('breadcrumb.route : ', breadcrumb.route);
            if (breadcrumb.route === 'devices.server') {
                return true;
            }else if (breadcrumb.route === 'devices.bm_servers'){
                return true;
            }
            return false;
        };

        angular.forEach($rootScope.breadCrumbArray, function (value, key) {
            if (manageBreadcrumbLink(value)) {
                console.log('flag');
                if(flag){
                    value.link = '#/devices/bm_servers';
                }else{
                    value.link = '#/devices/servers';
                }
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
            case 'devices.server.overview' :
                $scope.activeTab = 0;
                break;
            case 'devices.server.graphs' :
                $scope.activeTab = 1;
                break;
            case 'devices.server.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'devices.server.ports' :
                $scope.activeTab = 3;
                break;
            case 'devices.server.logs' :
                $scope.activeTab = 4;
                break;
            case 'devices.server.alerts' :
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
                    $state.go('devices.server.overview', null, {reload: 'devices.server.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('devices.server.graphs', null, {reload: 'devices.server.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('devices.server.healthstats', null, {reload: 'devices.server.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('devices.server.ports', null, {reload: 'devices.server.ports'});
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
                    $state.go('devices.server.logs', null, {reload: 'devices.server.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('devices.server.alerts', null, {reload: 'devices.server.alerts'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                if(flag){
                    $scope.addClassforTabs('.actonecls ul', 6);
                }else{
                    $scope.addClassforTabs('.actonecls ul', 3);
                }
            }, 1000);
        };

        var get_server_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/servers/' + $scope.server_id + '/get_device_data/'
            }).then(function (response) {
                $scope.server_details = response.data;
                $scope.server_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.server_details_error = error;
                $scope.server_details = {};
                $scope.setLoader(false);
            });
        };
        get_server_details();

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
                url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_by_type/',
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
            console.log(' in goToPreviousPage with flag : ', flag);
            if(flag){
                console.log(' going to bm servers page');
                $state.go('devices.bm_servers', null, {reload: false});
                $timeout(function () {
                    $scope.addClassforTabs('.actonecls ul', 6);
                }, 1000);
            }else{
                console.log(' going to servers page');
                $state.go('devices.servers', null, {reload: false});
                $timeout(function () {
                    $scope.addClassforTabs('.actonecls ul', 3);
                }, 1000);
            }
            //localStorage.removeItem('isBareMetalStats');
        };
    }
]);

app.controller('PCServerMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {

        console.log('in PCServerMenuController');

        $scope.pc_id = '';
        $scope.server_id = '';
        $scope.server_name = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        var stateParams = angular.copy($stateParams);

        if (angular.isDefined(stateParams.uuidp) && (stateParams.uuidp !== null) && 
            angular.isDefined(stateParams.uuidc) && (stateParams.uuidc !== null) ) {
            $scope.pc_id = stateParams.uuidp;
            $scope.server_id = stateParams.uuidc;
        } else {
            return;
        }

        var base_state = $state.current.name.substring(0, $state.current.name.indexOf('hypervisor'));
        var observium_state = base_state.concat('hypervisor');

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

        var get_server_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/servers/' + $scope.server_id + '/get_device_data/'
            }).then(function (response) {
                $scope.server_details = response.data;
                $scope.server_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.server_details_error = error;
                $scope.server_details = {};
                $scope.setLoader(false);
            });
        };
        get_server_details();

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
                url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_by_type/',
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
            var from_baremetals = localStorage.getItem('isBareMetalStats');
            if(from_all_devices){
                var target_state = base_state.concat('all_devices');
                $state.go(target_state, {'uuidp' : $stateParams.uuidp, 'uuidc' : 'all_devices'}, {reload: false});
            }
            else if(from_baremetals){
                var target_state = base_state.concat('baremetals');
                $state.go(target_state, {'uuidp' : $stateParams.uuidp, 'uuidc' : 'baremetals'}, {reload: false});
            }
            else{
                var target_state = base_state.concat('hypervisors');
                $state.go(target_state, {'uuidp' : $stateParams.uuidp, 'uuidc' : 'hypervisors'}, {reload: false});
            }
            
            $timeout(function () {
                localStorage.removeItem('isAllDevicesStats');
                localStorage.removeItem('isBareMetalStats');
                $scope.addClassforTabs('.actonecls ul', $rootScope.secondLevelActiveIndex);
                $scope.removeClassforTabs('.acttwocls ul', 0);
                $scope.addClassforTabs('.acttwocls ul', 1);
            }, 1000);
        };
    }
]);

app.controller('PrivateCloudServerMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {

        console.log("inside servermenu controller");
        var stateParams = angular.copy($stateParams);
        $scope.server_id = '';
        $scope.server_name = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.sub_menu_tabs = true;

        if (angular.isDefined(stateParams.uuidc) && (stateParams.uuidc !== null)) {
            $scope.server_id = stateParams.uuidcc;
        } else {
            return;
        }

        var manageBreadcrumbLink = function (breadcrumb) {
            console.log('breadcrumb.route : ', breadcrumb.route);
            if (breadcrumb.route === 'devices.server') {
                return true;
            }else if (breadcrumb.route === 'devices.bm_servers'){
                return true;
            }
            return false;
        };

        angular.forEach($rootScope.breadCrumbArray, function (value, key) {
            if (manageBreadcrumbLink(value)) {
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
            case 'pc_cloud.hypervisor.overview' :
                $scope.activeTab = 0;
                break;
            case 'pc_cloud.hypervisor.graphs' :
                $scope.activeTab = 1;
                break;
            case 'pc_cloud.hypervisor.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'pc_cloud.hypervisor.ports' :
                $scope.activeTab = 3;
                break;
            case 'pc_cloud.hypervisor.logs' :
                $scope.activeTab = 4;
                break;
            case 'pc_cloud.hypervisor.alerts' :
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
                    $state.go('pc_cloud.hypervisor.overview', null, {reload: 'pc_cloud.hypervisor.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('pc_cloud.hypervisor.graphs', null, {reload: 'pc_cloud.hypervisor.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('pc_cloud.hypervisor.healthstats', null, {reload: 'pc_cloud.hypervisor.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('pc_cloud.hypervisor.ports', null, {reload: 'pc_cloud.hypervisor.ports'});
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
                    $state.go('pc_cloud.hypervisor.logs', null, {reload: 'pc_cloud.hypervisor.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('pc_cloud.hypervisor.alerts', null, {reload: 'pc_cloud.hypervisor.alerts'});
                    break;
            }
        };

        var get_server_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/servers/' + $scope.server_id + '/get_device_data/'
            }).then(function (response) {
                $scope.server_details = response.data;
                $scope.server_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.server_details_error = error;
                $scope.server_details = {};
                $scope.setLoader(false);
            });
        };
        get_server_details();

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
                url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_by_type/',
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
            var from_baremetals = localStorage.getItem('isBareMetalStats');
            if(from_all_devices){
                $state.go('pc_cloud.all_devices', {uuidc : $stateParams.uuidc}, {reload: false});
            }
            else if(from_baremetals){
                $state.go('pc_cloud.bm_servers', {uuidc : $stateParams.uuidc}, {reload: false});
            }
            else{
                $state.go('pc_cloud.hypervisors', {uuidc : $stateParams.uuidc}, {reload: false});
            }
            localStorage.removeItem('isAllDevicesStats');
            localStorage.removeItem('isBareMetalStats');
        };
    }
]);

app.controller('ColoCloudPCServerMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {

        console.log("inside servermenu controller");
        var stateParams = angular.copy($stateParams);
        $scope.server_id = '';
        $scope.server_name = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.sub_menu_tabs = true;

        if (angular.isDefined(stateParams.uuidc) && (stateParams.uuidc !== null)) {
            $scope.server_id = stateParams.uuidcc;
        } else {
            return;
        }

        var manageBreadcrumbLink = function (breadcrumb) {
            console.log('breadcrumb.route : ', breadcrumb.route);
            if (breadcrumb.route === 'devices.server') {
                return true;
            }else if (breadcrumb.route === 'devices.bm_servers'){
                return true;
            }
            return false;
        };

        angular.forEach($rootScope.breadCrumbArray, function (value, key) {
            if (manageBreadcrumbLink(value)) {
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
            case 'colo_cloud.pc_cloud.hypervisor.overview' :
                $scope.activeTab = 0;
                break;
            case 'colo_cloud.pc_cloud.hypervisor.graphs' :
                $scope.activeTab = 1;
                break;
            case 'colo_cloud.pc_cloud.hypervisor.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'colo_cloud.pc_cloud.hypervisor.ports' :
                $scope.activeTab = 3;
                break;
            case 'colo_cloud.pc_cloud.hypervisor.logs' :
                $scope.activeTab = 4;
                break;
            case 'colo_cloud.pc_cloud.hypervisor.alerts' :
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
                    $state.go('colo_cloud.pc_cloud.hypervisor.overview', null, {reload: 'colo_cloud.pc_cloud.hypervisor.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('colo_cloud.pc_cloud.hypervisor.graphs', null, {reload: 'colo_cloud.pc_cloud.hypervisor.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('colo_cloud.pc_cloud.hypervisor.healthstats', null, {reload: 'colo_cloud.pc_cloud.hypervisor.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('colo_cloud.pc_cloud.hypervisor.ports', null, {reload: 'colo_cloud.pc_cloud.hypervisor.ports'});
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
                    $state.go('colo_cloud.pc_cloud.hypervisor.logs', null, {reload: 'colo_cloud.pc_cloud.hypervisor.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('colo_cloud.pc_cloud.hypervisor.alerts', null, {reload: 'colo_cloud.pc_cloud.hypervisor.alerts'});
                    break;
            }
        };

        var get_server_details = function () {
            $http({
                method: "GET",
                url: '/customer/observium/servers/' + $scope.server_id + '/get_device_data/'
            }).then(function (response) {
                $scope.server_details = response.data;
                $scope.server_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.server_details_error = error;
                $scope.server_details = {};
                $scope.setLoader(false);
            });
        };
        get_server_details();

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
                url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_by_type/',
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
            var from_baremetals = localStorage.getItem('isBareMetalStats');
            if(from_all_devices){
                $state.go('colo_cloud.pc_cloud.all_devices', {uuidc : $stateParams.uuidc}, {reload: false});
            }
            else if(from_baremetals){
                $state.go('colo_cloud.pc_cloud.bm_servers', {uuidc : $stateParams.uuidc}, {reload: false});
            }
            else{
                $state.go('colo_cloud.pc_cloud.hypervisors', {uuidc : $stateParams.uuidc}, {reload: false});
            }
            localStorage.removeItem('isAllDevicesStats');
            localStorage.removeItem('isBareMetalStats');
        };
    }
]);

app.controller('ServerOverviewController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {
        console.log(' in serverOverviewController ');

        var get_status_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/servers/' + $scope.server_id + '/get_status_data'
            }).then(function (response) {
                $scope.server_status_data = angular.copy(response.data);
            }).catch(function (error) {
                $scope.server_status_error = error;
                $scope.server_status_data = {};
                $scope.setLoader(false);
            });
        };

        var get_sensor_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/servers/' + $scope.server_id + '/get_sensor_data'
            }).then(function (response) {
                $scope.server_sensor_data = angular.copy(response.data);
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.server_sensor_error = error;
                $scope.server_sensor_data = {};
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
                url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_by_type',
                params: params
            }).then(function (response) {
                $scope.server_memory_overview_graph = angular.copy(response.data.graph);
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
                url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_by_type',
                params: params
            }).then(function (response) {
                $scope.server_cpu_overview_graph = angular.copy(response.data.graph);
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
                url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_by_type',
                params: params
            }).then(function (response) {
                $scope.server_device_bits_overview_graph = angular.copy(response.data.graph);
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

app.controller('ServerGraphController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {
        $scope.device_graph_data = [];
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
        var get_server_graphs = function (graphconfig, graphnameconfig) {
            var params = {
                'graph_type': graphconfig.graphType,
            };
            $http({
                method: "GET",
                url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_set_by_type/',
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
                $scope.server_details = {};
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            });
        };

        var get_server_netstat_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.NETSTATS), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_server_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.NETSTATS));
            });
        };

        var get_server_poller_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.POLLER), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_server_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.POLLER));
            });
        };

        var get_server_system_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.SYSTEM), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_server_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.SYSTEM));
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
                    get_server_netstat_data();
                    break;
                case 'graphs_poller' :
                    $scope.setActiveSubTab(1);
                    get_server_poller_data();
                    break;
                case 'graphs_system' :
                    $scope.setActiveSubTab(2);
                    get_server_system_data();
                    break;
                default:
            }
        };
        //$scope.getGraphSubtabsData(angular.copy($scope.submenutabs[0]));
    }
]);

app.controller('ServerHealthStatsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {

        $scope.device_graph_data = [];
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
                url: '/customer/observium/servers/' + $scope.server_id + '/get_graph_set_by_type/',
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
                $scope.server_details = {};
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
            $scope.device_graph_data = [];
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

app.controller('ServerPortsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in serverPortsController with server : ', $scope.server_id);

        $scope.getPortGraphs = function (port) {
            var params = {
                'port_id': port.port_id
            };
            $http({
                method: "GET",
                url: '/customer/observium/servers/' + $scope.server_id + '/get_port_details_graph_set/',
                params: params,
            }).then(function (response) {
                port.graph = response.data;
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.server_details = {};
            });
        };

        var get_port_data = function () {
            $http({
                method: "GET",
                url: '/customer/observium/servers/' + $scope.server_id + '/get_device_port_details/',
            }).then(function (response) {
                $scope.portDetails = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.server_details = {};
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

app.controller('ServerLogsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in serverLogsController with server : ', $scope.server_id);
    }
]);

app.controller('ServerAlertsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in serverAlertsController with server : ', $scope.server_id);
        $scope.server_alerts = {};

        var get_server_alerts = function (graphconfig) {
            $http({
                method: "GET",
                url: '/customer/observium/servers/' + $scope.server_id + '/get_alert_data/',
            }).then(function (response) {
                $scope.server_alerts = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.server_alerts = {};
                $scope.setLoader(false);
            });
        };

        get_server_alerts();
    }
]);
