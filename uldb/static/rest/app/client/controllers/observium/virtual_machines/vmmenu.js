var app = angular.module('uldb');

app.controller('VMMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {
        console.log("VMMenuController");

        $scope.show_observium_stats = true;
        $rootScope.thirdLevelActiveIndex = 1;
        var stateParams = angular.copy($stateParams.uuidq);

        $scope.virtual_machine_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.virtual_machine_id = stateParams;
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
            case 'devices.vms.vmwarevm.overview' :
                $scope.activeTab = 0;
                break;
            case 'devices.vms.vmwarevm.graphs' :
                $scope.activeTab = 1;
                break;
            case 'devices.vms.vmwarevm.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'devices.vms.vmwarevm.ports' :
                $scope.activeTab = 3;
                break;
            case 'devices.vms.vmwarevm.logs' :
                $scope.activeTab = 4;
                break;
            case 'devices.vms.vmwarevm.alerts' :
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
                    $state.go('devices.vms.vmwarevm.overview', null, {reload: 'devices.vms.vmwarevm.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('devices.vms.vmwarevm.graphs', null, {reload: 'devices.vms.vmwarevm.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('devices.vms.vmwarevm.healthstats', null, {reload: 'devices.vms.vmwarevm.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('devices.vms.vmwarevm.ports', null, {reload: 'devices.vms.vmwarevm.ports'});
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
                    $state.go('devices.vms.vmwarevm.logs', null, {reload: 'devices.vms.vmwarevm.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('devices.vms.vmwarevm.alerts', null, {reload: 'devices.vms.vmwarevm.alerts'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 4);
                $scope.removeClassforTabs('.acttwocls ul', 0);
                $scope.addClassforTabs('.acttwocls ul', 1);
            }, 100);
        };

        var get_vm_details = function () {
            $http({
                method: "GET",
                url: $scope.url  + $scope.virtual_machine_id + '/get_device_data/'
            }).then(function (response) {
                $scope.vmware_vm_details = response.data;
                $scope.vmware_vm_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.vmware_vm_details_error = error;
                $scope.vmware_vm_details = {};
                $scope.setLoader(false);
            });
        };
        get_vm_details();

        $scope.getDetailedView = function (vmware_vms_graph_obj) {
            $scope.setLoader(true);
            $scope.selectedGraphObj = angular.copy(vmware_vms_graph_obj);
            $scope.showDetailsView = true;
            var params = {
                'graph_type': vmware_vms_graph_obj.graphType,
                'from_date': new Date(Date.parse(vmware_vms_graph_obj.from_date)).getTime() / 1000,
                'to_date': new Date(Date.parse(vmware_vms_graph_obj.to_date)).getTime() / 1000,
            };
            $http({
                method: "GET",
                url: '/customer/observium/vmware/' + $scope.virtual_machine_id + '/get_graph_by_type/',
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
        $scope.getGraphforDefaultDateRange = function (vmware_vms_graph_obj) {
            $scope.graphDateObj = vmware_vms_graph_obj;
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
            $state.go('devices.vms.vmwarevms', {uuidc: 'vmwarevms'}, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 4);
                $scope.removeClassforTabs('.acttwocls ul', 0);
                $scope.addClassforTabs('.acttwocls ul', 1);
            }, 1000);
        };

    }
]);

app.controller('PCVMMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {

        console.log('in PCVMMenuController with stateParams : ', angular.toJson($stateParams));
        $scope.pc_id = '';
        $scope.virtual_machine_id = '';
        $scope.server_name = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        var stateParams = angular.copy($stateParams);

        if (angular.isDefined(stateParams.uuidp) && (stateParams.uuidp !== null) && 
            angular.isDefined(stateParams.uuidc) && (stateParams.uuidc !== null) ) {
            $scope.pc_id = stateParams.uuidp;
            $scope.virtual_machine_id = stateParams.uuidc;
        } else {
            return;
        }

        var cloud_platform_type = localStorage.getItem('vm_platform_type');
        if(cloud_platform_type){
            $scope.constant_platform_type = angular.copy(cloud_platform_type);
            localStorage.removeItem('vm_platform_type');
        }

        if ($scope.constant_platform_type === 'vmware'){
            $scope.url = 'customer/observium/vmware/'; 
        }
        else if ($scope.constant_platform_type === 'vcloud'){
            $scope.url = 'customer/observium/vcloud/'; 
        }
        else if ($scope.constant_platform_type === 'openstack'){
            $scope.url = 'customer/observium/openstack/'; 
        }else{
            $scope.url = 'customer/observium/custom_vm/'; 
        }


        var base_state = $state.current.name.substring(0, $state.current.name.indexOf('virtual_machine'));
        var observium_state = base_state.concat('virtual_machine');

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

        var get_vm_details = function () {
            $http({
                method: "GET",
                url: $scope.url  + $scope.virtual_machine_id + '/get_device_data/'
            }).then(function (response) {
                $scope.vmware_vm_details = response.data;
                $scope.vmware_vm_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.vmware_vm_details_error = error;
                $scope.vmware_vm_details = {};
                $scope.setLoader(false);
            });
        };
        get_vm_details();

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
                url: $scope.url + $scope.virtual_machine_id + '/get_graph_by_type/',
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
                var target_state = base_state.concat('virtual_machines');
                $state.go(target_state, {'uuidp' : $stateParams.uuidp, 'uuidc' : 'virtual_machines'}, {reload: false});
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

app.controller('PrivateCloudVMMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {

        console.log('in ColoCloudPCVMMenuController with stateParams : ', angular.toJson($stateParams));
        $scope.pc_id = '';
        $scope.virtual_machine_id = '';
        $scope.server_name = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        var stateParams = angular.copy($stateParams);

        if (angular.isDefined(stateParams.uuidc) && (stateParams.uuidc !== null) && 
            angular.isDefined(stateParams.uuidcc) && (stateParams.uuidcc !== null) ) {
            console.log('in if');
            $scope.pc_id = stateParams.uuidc;
            $scope.virtual_machine_id = stateParams.uuidcc;
        } else {
            console.log('in else');
            return;
        }

        var platform_type = angular.copy(localStorage.getItem('platform_type'));

        if (platform_type === 'vmware'){
            $scope.url = 'customer/observium/vmware/'; 
        }
        else if (platform_type === 'vcloud'){
            $scope.url = 'customer/observium/vcloud/'; 
        }
        else if (platform_type === 'openstack'){
            $scope.url = 'customer/observium/openstack/'; 
        }else{
            $scope.url = 'customer/observium/custom_vm/'; 
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
            case 'pc_cloud.virtual_machine.overview' :
                $scope.activeTab = 0;
                break;
            case 'pc_cloud.virtual_machine.graphs' :
                $scope.activeTab = 1;
                break;
            case 'pc_cloud.virtual_machine.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'pc_cloud.virtual_machine.ports' :
                $scope.activeTab = 3;
                break;
            case 'pc_cloud.virtual_machine.logs' :
                $scope.activeTab = 4;
                break;
            case 'pc_cloud.virtual_machine.alerts' :
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
                    $state.go('pc_cloud.virtual_machine.overview', null, {reload: 'pc_cloud.virtual_machine.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('pc_cloud.virtual_machine.graphs', null, {reload: 'pc_cloud.virtual_machine.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('pc_cloud.virtual_machine.healthstats', null, {reload: 'pc_cloud.virtual_machine.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('pc_cloud.virtual_machine.ports', null, {reload: 'pc_cloud.virtual_machine.ports'});
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
                    $state.go('pc_cloud.virtual_machine.logs', null, {reload: 'pc_cloud.virtual_machine.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('pc_cloud.virtual_machine.alerts', null, {reload: 'pc_cloud.virtual_machine.alerts'});
                    break;
            }
        };

        var get_vm_details = function () {
            $http({
                method: "GET",
                url: $scope.url  + $scope.virtual_machine_id + '/get_device_data/'
            }).then(function (response) {
                $scope.vmware_vm_details = response.data;
                $scope.vmware_vm_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.vmware_vm_details_error = error;
                $scope.vmware_vm_details = {};
                $scope.setLoader(false);
            });
        };
        get_vm_details();

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
                url: $scope.url + $scope.virtual_machine_id + '/get_graph_by_type/',
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
                $state.go('pc_cloud.all_devices', {uuidc : $stateParams.uuidc}, {reload: false});
            }else{
                $state.go('pc_cloud.virtual_machines', {uuidc : $stateParams.uuidc}, {reload: false});
            }
            localStorage.removeItem('isAllDevicesStats');
            localStorage.removeItem('platform_type');
        };
    }
]);

app.controller('ColoCloudPCVMMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {

        console.log('in ColoCloudPCVMMenuController with stateParams : ', angular.toJson($stateParams));
        $scope.pc_id = '';
        $scope.virtual_machine_id = '';
        $scope.server_name = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        var stateParams = angular.copy($stateParams);

        if (angular.isDefined(stateParams.uuidc) && (stateParams.uuidc !== null) && 
            angular.isDefined(stateParams.uuidcc) && (stateParams.uuidcc !== null) ) {
            console.log('in if');
            $scope.pc_id = stateParams.uuidc;
            $scope.virtual_machine_id = stateParams.uuidcc;
        } else {
            console.log('in else');
            return;
        }

        var platform_type = angular.copy(localStorage.getItem('platform_type'));


        if (platform_type === 'vmware'){
            $scope.url = 'customer/observium/vmware/'; 
        }
        else if (platform_type === 'vcloud'){
            $scope.url = 'customer/observium/vcloud/'; 
        }
        else if (platform_type === 'openstack'){
            $scope.url = 'customer/observium/openstack/'; 
        }else{
            $scope.url = 'customer/observium/custom_vm/'; 
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
            case 'colo_cloud.pc_cloud.virtual_machine.overview' :
                $scope.activeTab = 0;
                break;
            case 'colo_cloud.pc_cloud.virtual_machine.graphs' :
                $scope.activeTab = 1;
                break;
            case 'colo_cloud.pc_cloud.virtual_machine.healthstats' :
                $scope.activeTab = 2;
                break;
            case 'colo_cloud.pc_cloud.virtual_machine.ports' :
                $scope.activeTab = 3;
                break;
            case 'colo_cloud.pc_cloud.virtual_machine.logs' :
                $scope.activeTab = 4;
                break;
            case 'colo_cloud.pc_cloud.virtual_machine.alerts' :
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
                    $state.go('colo_cloud.pc_cloud.virtual_machine.overview', null, {reload: 'colo_cloud.pc_cloud.virtual_machine.overview'});
                    break;
                case 'Graphs' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('colo_cloud.pc_cloud.virtual_machine.graphs', null, {reload: 'colo_cloud.pc_cloud.virtual_machine.graphs'});
                    break;
                case 'Health' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('colo_cloud.pc_cloud.virtual_machine.healthstats', null, {reload: 'colo_cloud.pc_cloud.virtual_machine.healthstats'});
                    break;
                case 'Ports' :
                    $scope.submenutabs = null;
                    $state.go('colo_cloud.pc_cloud.virtual_machine.ports', null, {reload: 'colo_cloud.pc_cloud.virtual_machine.ports'});
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
                    $state.go('colo_cloud.pc_cloud.virtual_machine.logs', null, {reload: 'colo_cloud.pc_cloud.virtual_machine.logs'});
                    break;
                case 'Alerts' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('colo_cloud.pc_cloud.virtual_machine.alerts', null, {reload: 'colo_cloud.pc_cloud.virtual_machine.alerts'});
                    break;
            }
        };

        var get_vm_details = function () {
            $http({
                method: "GET",
                url: $scope.url  + $scope.virtual_machine_id + '/get_device_data/'
            }).then(function (response) {
                $scope.vmware_vm_details = response.data;
                $scope.vmware_vm_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                $scope.vmware_vm_details_error = error;
                $scope.vmware_vm_details = {};
                $scope.setLoader(false);
            });
        };
        get_vm_details();

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
                url: $scope.url + $scope.virtual_machine_id + '/get_graph_by_type/',
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
                $state.go('colo_cloud.pc_cloud.all_devices', {uuidc : $stateParams.uuidc}, {reload: false});
            }else{
                $state.go('colo_cloud.pc_cloud.virtual_machines', {uuidc : $stateParams.uuidc}, {reload: false});
            }
            localStorage.removeItem('isAllDevicesStats');
            localStorage.removeItem('platform_type');
        };
    }
]);




app.controller('VMOverviewController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {
        console.log(' in VMOverviewController ');

        var get_status_data = function () {
            $http({
                method: "GET",
                url: $scope.$parent.url + $scope.virtual_machine_id + '/get_status_data'
            }).then(function (response) {
                $scope.vmware_vm_status_data = angular.copy(response.data);
            }).catch(function (error) {
                $scope.vmware_vm_status_error = error;
                $scope.vmware_vm_status_data = {};
                $scope.setLoader(false);
            });
        };

        var get_sensor_data = function () {
            $http({
                method: "GET",
                url: $scope.$parent.url + $scope.virtual_machine_id + '/get_sensor_data'
            }).then(function (response) {
                $scope.vmware_vm_sensor_data = angular.copy(response.data);
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.vmware_vm_sensor_error = error;
                $scope.vmware_vm_sensor_data = {};
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
                url: $scope.$parent.url + $scope.virtual_machine_id + '/get_graph_by_type',
                params: params
            }).then(function (response) {
                $scope.vmware_vm_memory_overview_graph = angular.copy(response.data.graph);
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
                url: $scope.$parent.url + $scope.virtual_machine_id + '/get_graph_by_type',
                params: params
            }).then(function (response) {
                $scope.vmware_vm_cpu_overview_graph = angular.copy(response.data.graph);
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
                url: $scope.$parent.url + $scope.virtual_machine_id + '/get_graph_by_type',
                params: params
            }).then(function (response) {
                $scope.vmware_vm_device_bits_overview_graph = angular.copy(response.data.graph);
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

app.controller('VMGraphController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {
        $scope.vmware_vm_graph_data = [];

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
        var get_vmware_vm_graphs = function (graphconfig, graphnameconfig) {
            var params = {
                'graph_type': graphconfig.graphType,
            };
            $http({
                method: "GET",
                url: $scope.$parent.url + $scope.virtual_machine_id + '/get_graph_set_by_type/',
                params: params
            }).then(function (response) {
                graphconfig.graphDetails = response.data;
                $scope.vmware_vm_graph_data.push(graphconfig);
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.vmware_vm_details = {};
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            });
        };

        var get_vmware_vm_netstat_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.NETSTATS), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_vmware_vm_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.NETSTATS));
            });
        };

        var get_vmware_vm_poller_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.POLLER), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_vmware_vm_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.POLLER));
            });
        };

        var get_vmware_vm_system_data = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.SERVER.GRAPHS.SYSTEM), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_vmware_vm_graphs(graphObj, angular.copy(OberviumGraphConfig.SERVER.GRAPHS.SYSTEM));
            });
        };

        $scope.getGraphSubtabsData = function (subtab) {
            $scope.vmware_vm_graph_data = [];
            $scope.setLoader(true);
            $scope.setshowDetailsView(false);
            count = 0;
            switch (subtab.name) {
                case 'graphs_net_stats' :
                    $scope.setActiveSubTab(0);
                    get_vmware_vm_netstat_data();
                    break;
                case 'graphs_poller' :
                    $scope.setActiveSubTab(1);
                    get_vmware_vm_poller_data();
                    break;
                case 'graphs_system' :
                    $scope.setActiveSubTab(2);
                    get_vmware_vm_system_data();
                    break;
                default:
            }
        };
        //$scope.getGraphSubtabsData(angular.copy($scope.submenutabs[0]));
    }
]);

app.controller('VMHealthStatsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {

        $scope.vmware_vm_graph_data = [];
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
                url: $scope.$parent.url + $scope.virtual_machine_id + '/get_graph_set_by_type/',
                params: params
            }).then(function (response) {
                graphconfig.graphDetails = response.data;
                $scope.vmware_vm_graph_data.push(graphconfig);
                count = count + 1;
                if (angular.equals(count, graphnameconfig.length)) {
                    $scope.setLoader(false);
                }
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.vmware_vm_details = {};
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
            $scope.vmware_vm_graph_data = [];
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

app.controller('VMPortsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in VMPortsController : ', $scope.virtual_machine_id);
        $scope.getPortGraphs = function (port) {
            var params = {
                'port_id': port.port_id
            };
            $http({
                method: "GET",
                url: $scope.$parent.url + $scope.virtual_machine_id + '/get_port_details_graph_set/',
                params: params
            }).then(function (response) {
                port.graph = response.data;
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.vmware_vm_details = {};
            });
        };

        var get_port_data = function () {
            $http({
                method: "GET",
                url: $scope.$parent.url + $scope.virtual_machine_id + '/get_device_port_details/',
            }).then(function (response) {
                $scope.portDetails = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.vmware_vm_details = {};
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

app.controller('VMLogsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in VMLogsController with Vmware : ', $scope.virtual_machine_id);
    }
]);

app.controller('VMAlertsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log('in VMAlertsController: ', $scope.virtual_machine_id);
        $scope.vmware_vm_alerts = {};

        var get_vmware_vm_alerts = function (graphconfig) {
            $http({
                method: "GET",
                url: $scope.$parent.url + $scope.virtual_machine_id + '/get_alert_data/',
            }).then(function (response) {
                $scope.vmware_vm_alerts = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.vmware_vm_alerts = {};
                $scope.setLoader(false);
            });
        };

        get_vmware_vm_alerts();
    }
]);
