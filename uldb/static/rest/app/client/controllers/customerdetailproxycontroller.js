var app = angular.module('uldb');


app.controller('CustomerVcenterProxyDetailController', [
    '$scope',
    '$http',
    '$sce',
    '$state',
    '$stateParams',
    '$q',
    'ProxyDetailControllerService',
    'CustomerPrivateCloud',
    function ($scope, $http, $sce, $rootScope, $stateParams, $q, ProxyDetailControllerService, CustomerPrivateCloud) {

        $scope.update_activity_log_entry = function (uuid) {
            ProxyDetailControllerService.updateActivityLog(uuid, 'private_cloud');
        };

        CustomerPrivateCloud.query({ uuid: $stateParams.uuid }).$promise.then(function (response) {
            $scope.update_activity_log_entry($stateParams.uuid);
            $scope.proxy_url = response.results.proxy.proxy_fqdn;
        });

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);


app.controller('CustomerVmwareEsxiProxyDetailController', [
    '$scope',
    '$sce',
    '$rootScope',
    '$stateParams',
    '$q',
    'CustomerEsxi',
    'ProxyDetailControllerService',
    function ($scope, $sce, $rootScope, $stateParams, $q, CustomerEsxi, ProxyDetailControllerService) {
        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };

        CustomerEsxi.query({ uuid: $stateParams.uuid }).$promise.then(function (response) {
            $scope.proxy_url = response.results.proxy_fqdn;
        });

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);


app.controller('CustomerOpenStackProxyDetailController', [
    '$scope',
    '$sce',
    '$rootScope',
    '$stateParams',
    '$q',
    'ProxyDetailControllerService',
    'CustomerPrivateCloud',
    function ($scope, $sce, $rootScope, $stateParams, $q, ProxyDetailControllerService, CustomerPrivateCloud) {

        $scope.update_activity_log_entry = function (uuid) {
            ProxyDetailControllerService.updateActivityLog(uuid, 'private_cloud');
        };

        CustomerPrivateCloud.query({ uuid: $stateParams.uuid }).$promise.then(function (response) {
            $scope.update_activity_log_entry($stateParams.uuid);
            $scope.proxy_url = response.results.proxy.proxy_fqdn;
        });

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);


app.controller('CustomerF5LoadBalancerProxyDetailController', [
    '$scope',
    '$sce',
    '$rootScope',
    '$stateParams',
    '$q',
    'CustomerF5LB',
    'ProxyDetailControllerService',
    function ($scope, $sce, $rootScope, $stateParams, $q, CustomerF5LB, ProxyDetailControllerService) {

        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };
        CustomerF5LB.query({ uuid: $stateParams.uuid }).$promise.then(function (response) {
            $scope.proxy_url = response.results.proxy_fqdn;
        });

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);


app.controller('CustomerCiscoSwitchDetailController', [
    '$scope',
    '$sce',
    '$rootScope',
    '$stateParams',
    '$q',
    'CustomerCiscoSwitch',
    'ProxyDetailControllerService',
    function ($scope, $sce, $rootScope, $stateParams, $q, CustomerCiscoSwitch, ProxyDetailControllerService) {

        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };
        CustomerCiscoSwitch.query({ uuid: $stateParams.uuid }).$promise.then(function (response) {
            $scope.proxy_url = response.results.proxy_fqdn;
        });

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);

app.controller('CustomerJuniperSwitchDetailController', [
    '$scope',
    '$sce',
    '$rootScope',
    '$stateParams',
    '$q',
    'CustomerJuniperSwitch',
    'ProxyDetailControllerService',
    function ($scope, $sce, $rootScope, $stateParams, $q, CustomerJuniperSwitch, ProxyDetailControllerService) {

        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };
        CustomerJuniperSwitch.query({ uuid: $stateParams.uuid }).$promise.then(function (response) {
            $scope.proxy_url = response.results.proxy_fqdn;
        });

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);

app.controller('CustomerCiscoFirewallDetailController', [
    '$scope',
    '$sce',
    '$rootScope',
    '$stateParams',
    '$q',
    'CustomerCiscoFirewall',
    'ProxyDetailControllerService',
    function ($scope, $sce, $rootScope, $stateParams, $q, CustomerCiscoFirewall, ProxyDetailControllerService) {

        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };
        CustomerCiscoFirewall.query({ uuid: $stateParams.uuid }).$promise.then(function (response) {
            $scope.proxy_url = response.results.proxy_fqdn;

            console.log("Proxy URL : "+$scope.proxy_url);
        });

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);


app.controller('CustomerCitrixVPXDeviceProxyDetailController', [
    '$scope',
    '$sce',
    '$rootScope',
    '$stateParams',
    '$q',
    'CustomerCitrix',
    'ProxyDetailControllerService',
    function ($scope, $sce, $rootScope, $stateParams, $q, CustomerCitrix, ProxyDetailControllerService) {

        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };
        CustomerCitrix.query({ uuid: $stateParams.uuid }).$promise.then(function (response) {
            $scope.proxy_url = response.results.proxy_fqdn;
        });

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);


app.controller('CustomerJuniperSwitchProxyDetailController', [
    '$scope',
    '$sce',
    '$rootScope',
    '$stateParams',
    '$q',
    'CustomerJuniperSwitch',
    'ProxyDetailControllerService',
    function ($scope, $sce, $rootScope, $stateParams, $q, CustomerJuniperSwitch, ProxyDetailControllerService) {
        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };

        CustomerJuniperSwitch.query({ uuid: $stateParams.uuid }).$promise.then(function (response) {
            $scope.proxy_url = response.results.proxy_fqdn;
        });

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);

app.controller('CustomerTenableProxyDetailController', [
    '$scope',
    '$sce',
    '$rootScope',
    '$stateParams',
    '$q',
    'CustomerTenable',
    function ($scope, $sce, $rootScope, $stateParams, $q, CustomerTenable) {


        CustomerTenable.query({ uuid: $stateParams.uuid }).$promise.then(function (response) {
            //temporarily appending proxy host. Find an alternative solution after demo
            $scope.proxy_url = response.results.proxy_fqdn;
        });

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);
