var app = angular.module('uldb');

app.controller('BareMetalIPMIMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {
        console.log("inside BareMetalIPMIMenuController controller");

        var stateParams = angular.copy($stateParams.uuidp);
        $scope.server_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.controller_stats_tooltip = "Open IPMI Console in New Tab";

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.server_id = stateParams;
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
                'tabname': 'Stats'
            },
        ];

        switch ($state.current.name) {
            case 'devices.bm_server_ipmi.stats' :
                $scope.activeTab = 0;
                break;
            case 'devices.bm_server_ipmi.console' :
                $scope.activeTab = 1;
                break;
            default :
                $scope.activeTab = 0;
        }

        $scope.activeSubTab = 0;
        $scope.getTabData = function (tab) {
            $scope.showDetailsView = false;
            switch (tab.tabname) {
                case 'Stats' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('devices.bm_server_ipmi.stats', null, {reload: 'devices.bm_server_ipmi.stats'});
                    break;
                case 'Console' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('devices.bm_server_ipmi.console', null, {reload: 'devices.bm_server_ipmi.console'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 100);
        };

        var get_bm_server_proxy_url = function () {
            $http({
                method: "GET",
                url: '/customer/bm_servers/' + $scope.server_id + '/',
            }).then(function (response) {
                $scope.ipmi_console_url = response.data.bm_controller.proxy_url;
            }).catch(function (error) {
            });
        };

        get_bm_server_proxy_url();


        $scope.goToPreviousPage = function () {
            $state.go('devices.bm_servers', null, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 1000);
        };
    }
]);

app.controller('BareMetalDRACMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {
        console.log("inside BareMetalDRACMenuController controller");

        var stateParams = angular.copy($stateParams.uuidp);
        $scope.server_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.controller_stats_tooltip = "Open DRAC Console in New Tab";

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.server_id = stateParams;
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
                'tabname': 'Stats'
            },
        ];

        switch ($state.current.name) {
            case 'devices.bm_server_drac.stats' :
                $scope.activeTab = 0;
                break;
            case 'devices.bm_server_drac.console' :
                $scope.activeTab = 1;
                break;
            default :
                $scope.activeTab = 0;
        }

        $scope.activeSubTab = 0;
        $scope.getTabData = function (tab) {
            $scope.showDetailsView = false;
            switch (tab.tabname) {
                case 'Stats' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('devices.bm_server_drac.stats', null, {reload: 'devices.bm_server_drac.stats'});
                    break;
                case 'Console' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('devices.bm_server_drac.console', null, {reload: 'devices.bm_server_drac.console'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 100);
        };

        var get_bm_server_proxy_url = function () {
            $http({
                method: "GET",
                url: '/customer/bm_servers/' + $scope.server_id + '/',
            }).then(function (response) {
                $scope.controller_console_url = response.data.bm_controller.proxy_url;
            }).catch(function (error) {
            });
        };

        get_bm_server_proxy_url();


        $scope.goToPreviousPage = function () {
            $state.go('devices.bm_servers', null, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 1000);
        };
    }
]);

app.controller('BareMetalIPMIPCMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {
        console.log("inside BareMetalIPMIMenuController controller wirh : ", angular.toJson($stateParams));

        var stateParams = angular.copy($stateParams.uuidp);
        var target_state = $state.current.name;
        $scope.server_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.controller_stats_tooltip = "Open IPMI Console in New Tab";

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.server_id = stateParams;
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
                'tabname': 'Stats'
            },
        ];

        switch ($state.current.name) {
            case target_state + '.stats' :
                $scope.activeTab = 0;
                break;
            case target_state + '.console' :
                $scope.activeTab = 1;
                break;
            default :
                $scope.activeTab = 0;
        }

        $scope.activeSubTab = 0;
        $scope.getTabData = function (tab) {
            $scope.showDetailsView = false;
            switch (tab.tabname) {
                case 'Stats' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go(target_state + '.stats', null, {reload: target_state});
                    break;
                case 'Console' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go(target_state + '.console', null, {reload: target_state});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 100);
        };

        var get_bm_server_proxy_url = function () {
            $http({
                method: "GET",
                url: '/customer/bm_servers/' + $scope.server_id + '/',
            }).then(function (response) {
                $scope.ipmi_console_url = response.data.bm_controller.proxy_url;
            }).catch(function (error) {
            });
        };

        get_bm_server_proxy_url();


        $scope.goToPreviousPage = function () {
            var stateArray = target_state.split('.');
            stateArray.splice(-1, 1);
            stateArray.splice(-1, 1);
            stateArray.push('baremetals');
            var new_target = stateArray.join(".");
            $state.go(new_target, {uuidp: stateParams, uuidc: 'baremetals'}, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 1000);
        };
    }
]);

app.controller('BareMetalDRACPCMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {
        console.log("inside BareMetalDRACMenuController controller");

        var stateParams = angular.copy($stateParams.uuidp);
        var target_state = $state.current.name;
        $scope.server_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.controller_stats_tooltip = "Open DRAC Console in New Tab";

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.server_id = stateParams;
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
                'tabname': 'Stats'
            },
        ];

        switch ($state.current.name) {
            case target_state + '.stats' :
                $scope.activeTab = 0;
                break;
            case target_state + '.console' :
                $scope.activeTab = 1;
                break;
            default :
                $scope.activeTab = 0;
        }

        $scope.activeSubTab = 0;
        $scope.getTabData = function (tab) {
            $scope.showDetailsView = false;
            switch (tab.tabname) {
                case 'Stats' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go(target_state + '.stats', null, {reload: target_state});
                    break;
                case 'Console' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go(target_state + '.console', null, {reload: target_state});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 100);
        };

        var get_bm_server_proxy_url = function () {
            $http({
                method: "GET",
                url: '/customer/bm_servers/' + $scope.server_id + '/',
            }).then(function (response) {
                $scope.controller_console_url = response.data.bm_controller.proxy_url;
            }).catch(function (error) {
            });
        };

        get_bm_server_proxy_url();


        $scope.goToPreviousPage = function () {
            var stateArray = target_state.split('.');
            stateArray.splice(-1, 1);
            stateArray.splice(-1, 1);
            stateArray.push('baremetals');
            var new_target = stateArray.join(".");
            $state.go(new_target, {uuidp: stateParams, uuidc: 'baremetals'}, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 1000);
        };
    }
]);

app.controller('BareMetalIPMIStatsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {

        var create_stats_obj = function(stats){
            var stats_arr = [];
            angular.forEach(stats,function(value, index){
                var value_arr = value.split('|');
                if(value_arr[0] !== ""){
                    var stats_obj = {};
                    stats_obj.sensor = value_arr[0].trim();
                    stats_obj.sensor_id = value_arr[1].trim();
                    stats_obj.status = value_arr[2].trim();
                    stats_obj.entity_id = value_arr[3].trim();
                    stats_obj.reading = value_arr[4].trim();
                    stats_arr.push(angular.copy(stats_obj));
                }
            });
            return stats_arr;
        };

        var get_bm_server_controller_stats = function () {
            $http({
                method: "GET",
                url: '/customer/bm_servers/' + $scope.server_id + '/chassis_statistics/',
            }).then(function (response) {
                var response_str = response.data;
                var response_arr = create_stats_obj(response_str.split('\n'));
                $scope.server_details = angular.copy(response_arr);
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.server_details_error = error;
                $scope.server_details = {};
                $scope.setLoader(false);
            });
        };
        get_bm_server_controller_stats();
    }
]);

app.controller('BareMetalIPMIConsoleController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {
        console.log(' in BareMetalIPMIConsoleController ');
    }
]);

app.controller('BareMetalIPMIColoCloudMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {
        console.log("inside BareMetalIPMIMenuController controller");

        var stateParams = angular.copy($stateParams.uuidcc);
        $scope.server_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.controller_stats_tooltip = "Open IPMI Console in New Tab";

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.server_id = stateParams;
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
                'tabname': 'Stats'
            },
        ];

        switch ($state.current.name) {
            case 'colo_cloud.pc_cloud.bm_server_ipmi.stats' :
                $scope.activeTab = 0;
                break;
            case 'colo_cloud.pc_cloud.bm_server_ipmi.console' :
                $scope.activeTab = 1;
                break;
            default :
                $scope.activeTab = 0;
        }

        $scope.activeSubTab = 0;
        $scope.getTabData = function (tab) {
            $scope.showDetailsView = false;
            switch (tab.tabname) {
                case 'Stats' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('colo_cloud.pc_cloud.bm_server_ipmi.stats', {uuidc: $stateParams.uuidc},
                    {reload: 'colo_cloud.pc_cloud.bm_server_ipmi.stats'});
                    break;
                case 'Console' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('colo_cloud.pc_cloud.bm_server_ipmi.console', {uuidc: $stateParams.uuidc},
                    {reload: 'colo_cloud.pc_cloud.bm_server_ipmi.console'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 100);
        };

        var get_bm_server_proxy_url = function () {
            $http({
                method: "GET",
                url: '/customer/bm_servers/' + $scope.server_id + '/',
            }).then(function (response) {
                $scope.ipmi_console_url = response.data.bm_controller.proxy_url;
            }).catch(function (error) {
            });
        };

        get_bm_server_proxy_url();


        $scope.goToPreviousPage = function () {
            $state.go('colo_cloud.pc_cloud.bm_servers', {uuidc: $stateParams.uuidc}, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 1000);
        };
    }
]);

app.controller('BareMetalDRACColoCloudMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {
        console.log("inside BareMetalDRACMenuController controller");
        var stateParams = angular.copy($stateParams.uuidcc);
        $scope.server_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.controller_stats_tooltip = "Open DRAC Console in New Tab";

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.server_id = stateParams;
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
                'tabname': 'Stats'
            },
        ];

        switch ($state.current.name) {
            case 'colo_cloud.pc_cloud.bm_server_drac.stats' :
                $scope.activeTab = 0;
                break;
            case 'colo_cloud.pc_cloud.bm_server_drac.console' :
                $scope.activeTab = 1;
                break;
            default :
                $scope.activeTab = 0;
        }

        $scope.activeSubTab = 0;
        $scope.getTabData = function (tab) {
            $scope.showDetailsView = false;
            switch (tab.tabname) {
                case 'Stats' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('colo_cloud.pc_cloud.bm_server_drac.stats', {uuidc: $stateParams.uuidc}, {reload: 'colo_cloud.pc_cloud.bm_server_drac.stats'});
                    break;
                case 'Console' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('colo_cloud.pc_cloud.bm_server_drac.console', {uuidc: $stateParams.uuidc}, {reload: 'colo_cloud.pc_cloud.bm_server_drac.console'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 100);
        };

        var get_bm_server_proxy_url = function () {
            $http({
                method: "GET",
                url: '/customer/bm_servers/' + $scope.server_id + '/',
            }).then(function (response) {
                $scope.controller_console_url = response.data.bm_controller.proxy_url;
            }).catch(function (error) {
            });
        };

        get_bm_server_proxy_url();


        $scope.goToPreviousPage = function () {
            $state.go('colo_cloud.pc_cloud.bm_servers', {uuidc : $stateParams.uuidc}, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 1000);
        };
    }
]);

app.controller('BareMetalIPMIPCCloudMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {
        console.log("inside BareMetalIPMIMenuController controller");

        var stateParams = angular.copy($stateParams.uuidcc);
        $scope.server_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.controller_stats_tooltip = "Open IPMI Console in New Tab";

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.server_id = stateParams;
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
                'tabname': 'Stats'
            },
        ];

        switch ($state.current.name) {
            case 'pc_cloud.bm_server_ipmi.stats' :
                $scope.activeTab = 0;
                break;
            case 'pc_cloud.bm_server_ipmi.console' :
                $scope.activeTab = 1;
                break;
            default :
                $scope.activeTab = 0;
        }

        $scope.activeSubTab = 0;
        $scope.getTabData = function (tab) {
            $scope.showDetailsView = false;
            switch (tab.tabname) {
                case 'Stats' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('pc_cloud.bm_server_ipmi.stats', {uuidc: $stateParams.uuidc},
                    {reload: 'pc_cloud.bm_server_ipmi.stats'});
                    break;
                case 'Console' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('pc_cloud.bm_server_ipmi.console', {uuidc: $stateParams.uuidc},
                    {reload: 'pc_cloud.bm_server_ipmi.console'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 100);
        };

        var get_bm_server_proxy_url = function () {
            $http({
                method: "GET",
                url: '/customer/bm_servers/' + $scope.server_id + '/',
            }).then(function (response) {
                $scope.ipmi_console_url = response.data.bm_controller.proxy_url;
            }).catch(function (error) {
            });
        };

        get_bm_server_proxy_url();


        $scope.goToPreviousPage = function () {
            $state.go('pc_cloud.bm_servers', {uuidc: $stateParams.uuidc}, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 1000);
        };
    }
]);

app.controller('BareMetalDRACPCCloudMenuController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $http, $location) {
        console.log("inside BareMetalDRACMenuController controller");
        var stateParams = angular.copy($stateParams.uuidcc);
        $scope.server_id = '';
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.controller_stats_tooltip = "Open DRAC Console in New Tab";

        if (angular.isDefined(stateParams) && (stateParams !== null)) {
            $scope.server_id = stateParams;
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
                'tabname': 'Stats'
            },
        ];

        switch ($state.current.name) {
            case 'pc_cloud.bm_server_drac.stats' :
                $scope.activeTab = 0;
                break;
            case 'pc_cloud.bm_server_drac.console' :
                $scope.activeTab = 1;
                break;
            default :
                $scope.activeTab = 0;
        }

        $scope.activeSubTab = 0;
        $scope.getTabData = function (tab) {
            $scope.showDetailsView = false;
            switch (tab.tabname) {
                case 'Stats' :
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('pc_cloud.bm_server_drac.stats', {uuidc: $stateParams.uuidc}, {reload: 'pc_cloud.bm_server_drac.stats'});
                    break;
                case 'Console' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('pc_cloud.bm_server_drac.console', {uuidc: $stateParams.uuidc}, {reload: 'pc_cloud.bm_server_drac.console'});
                    break;
            }

            $timeout(function () {
                $scope.activeSubTab = 0;
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 100);
        };

        var get_bm_server_proxy_url = function () {
            $http({
                method: "GET",
                url: '/customer/bm_servers/' + $scope.server_id + '/',
            }).then(function (response) {
                $scope.controller_console_url = response.data.bm_controller.proxy_url;
            }).catch(function (error) {
            });
        };

        get_bm_server_proxy_url();


        $scope.goToPreviousPage = function () {
            $state.go('pc_cloud.bm_servers', {uuidc : $stateParams.uuidc}, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 6);
            }, 1000);
        };
    }
]);