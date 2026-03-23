var app = angular.module('uldb');

app.controller('VcenterProxyDetailController', [
    '$scope',
    'BreadCrumbService',
    '$sce',
    '$rootScope',
    '$routeParams',
    '$q',
    'Vcenter',
    function ($scope, BreadCrumbService, $sce, $rootScope, $routeParams, $q, Vcenter) {
        $scope.bread = BreadCrumbService;
        var id = $routeParams.uuid;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: 'vCenter Management', url: '#/vmware-vcenter/' + id }, $scope);
        });

        // use "id" instead of "uuid" if ':id' is used in the url format string
        Vcenter.get({ id: $routeParams.uuid }).$promise.then(function (response) {
            // console.log(response);
            $scope.proxy_url = response.proxy_url;
        });

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);


app.controller('VmwareEsxiProxyDetailController', [
    '$scope',
    'BreadCrumbService',
    '$sce',
    '$rootScope',
    '$routeParams',
    '$q',
    'EsxiDetail',
    function ($scope, BreadCrumbService, $sce, $rootScope, $routeParams, $q, EsxiDetail) {
        $scope.bread = BreadCrumbService;
        var id = $routeParams.uuid;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: 'Esxi Management', url: '#/vmware-esxi/' + id }, $scope);
        });
        EsxiDetail.query({ uuid: $routeParams.uuid }).$promise.then(function (response) {
            $scope.proxy_url = response.results[0].proxy_url;
        });
        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);


app.controller('OpenStackProxyDetailController', [
    '$scope',
    'BreadCrumbService',
    '$sce',
    '$rootScope',
    '$routeParams',
    '$q',
    'OpenstackDetail',
    function ($scope, BreadCrumbService, $sce, $rootScope, $routeParams, $q, OpenstackDetail) {
        $scope.bread = BreadCrumbService;
        var id = $routeParams.uuid;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: 'Openstack Management', url: '#/openstack-proxy/' + id }, $scope);
        });
        OpenstackDetail.query({ uuid: $routeParams.uuid }).$promise.then(function (response) {
            $scope.proxy_url = response.results[0].proxy_url;
        });
        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);


app.controller('F5LoadBalancerProxyDetailController', [
    '$scope',
    'BreadCrumbService',
    '$sce',
    '$rootScope',
    '$routeParams',
    '$q',
    'F5LoadBalancerDetail',
    function ($scope, BreadCrumbService, $sce, $rootScope, $routeParams, $q, F5LoadBalancerDetail) {

        $scope.bread = BreadCrumbService;

        var id = $routeParams.uuid;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: 'F5 LoadBalancer Management', url: '#/f5-lb-proxy/' + id }, $scope);
        });

        F5LoadBalancerDetail.query({ uuid: $routeParams.uuid }).$promise.then(function (response) {
            $scope.proxy_url = response.results[0].proxy_url;
        });
        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);


app.controller('CiscoProxyDetailController', [
    '$scope',
    'BreadCrumbService',
    '$sce',
    '$rootScope',
    '$routeParams',
    '$q',
    'CiscoDetail',
    function ($scope, BreadCrumbService, $sce, $rootScope, $routeParams, $q, CiscoDetail) {

        $scope.bread = BreadCrumbService;

        var id = $routeParams.uuid;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: 'Cisco LoadBalancer', url: '#/cisco-proxy/' + id }, $scope);
        });

        CiscoDetail.query({ uuid: $routeParams.uuid }).$promise.then(function (response) {
            $scope.proxy_url = response.results[0].proxy_url;
        });

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);


app.controller('CitrixVPXDeviceProxyDetailController', [
    '$scope',
    'BreadCrumbService',
    '$sce',
    '$rootScope',
    '$routeParams',
    '$q',
    'CitrixDetail',
    function ($scope, BreadCrumbService, $sce, $rootScope, $routeParams, $q, CitrixDetail) {
        $scope.bread = BreadCrumbService;
        var id = $routeParams.uuid;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: 'Citrix Netscaler Management', url: '#/citrix-vpx-device/' + id }, $scope);
        });
        CitrixDetail.query({ uuid: $routeParams.uuid }).$promise.then(function (response) {
            $scope.proxy_url = response.results[0].proxy_url;
        });
        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);


app.controller('JuniperSwitchProxyDetailController', [
    '$scope',
    'BreadCrumbService',
    '$sce',
    '$rootScope',
    '$routeParams',
    '$q',
    'JuniperDetail',
    function ($scope, BreadCrumbService, $sce, $rootScope, $routeParams, $q, JuniperDetail) {
        $scope.bread = BreadCrumbService;
        var id = $routeParams.uuid;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: 'juniper Switch Management', url: '#/juniper-switch/' + id }, $scope);
        });
        JuniperDetail.query({ uuid: $routeParams.uuid }).$promise.then(function (response) {
            $scope.proxy_url = response.results[0].proxy_url;
        });
        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
]);
