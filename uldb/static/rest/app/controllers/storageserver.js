var app = angular.module('uldb');

app.controller('SANController', [
    '$scope',
    'AbstractControllerFactory3',
    'ULDBService2',
    function ($scope, AbstractControllerFactory3, ULDBService2) {
        $scope.handler = {
            modifiable: true
        };
        $scope.config = {
            shownFields: ['name', 'asset_tag', 'capacity_gb', 'manufacturer', 'salesforce_id', 'customer', 'cabinet']
        };
        $scope.ctrl = AbstractControllerFactory3($scope.handler, ULDBService2.san(), $scope.config);
    }
]);
