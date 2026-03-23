var app = angular.module('uldb');

app.controller('CeleryMonitorController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.workerModel = { modifiable: false };
        $scope.worker_config = {};
        $scope.workerHandler = AbstractControllerFactory2($scope.workerModel,
            ULDBService2.celeryWorker(),
            $scope.worker_config
        );

        $scope.taskModel = { modifiable: false };
        $scope.task_config = {};
        $scope.taskHandler = AbstractControllerFactory2($scope.taskModel,
            ULDBService2.celeryTask(),
            $scope.task_config
        );
    }
]);
