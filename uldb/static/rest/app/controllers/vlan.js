var app = angular.module('uldb');

app.controller('VlanController', [
    '$scope',
    'AbstractControllerFactory3',
    'ULDBService2',
    function ($scope, AbstractControllerFactory3, ULDBService2) {
        // $scope.vtp_domains = VTPDomain.query();
        $scope.handler = {modifiable: true};
        $scope.config = {};
        $scope.ctrl = AbstractControllerFactory3($scope.handler, ULDBService2.vlan(), $scope.config);
    }
]);
