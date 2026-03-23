var app = angular.module('uldb');
app.controller('CustomerAwsImageController', [
    '$scope',
    '$routeParams',
    '$rootScope',
    '$q',
    '$window',
    '$location',
    'ClientDashboardService',
    'TaskService',
    'AdminApi',
    'table_headers',
    '$filter',
    'DataFormattingService',
    'RestService',
    'AlertService2',
    function ($scope,
              $routeParams,
              $rootScope,
              $q,
              $window,
              $location,
              ClientDashboardService,
              TaskService,
              AdminApi,
              table_headers,
              $filter,
              DataFormattingService,
              RestService,
              AlertService2) {
        $scope.obj = {};
        console.log("Printing $routeParams");
        console.log($routeParams);
        $scope.account_id = $routeParams.account_id;
        $scope.name = $routeParams.name;
        $scope.instance_id = $routeParams.instanceid;
        console.log("Printing instanceid");
        console.log($scope.instance_id);

        $scope.add_aws_image = function () {
            console.log($scope.obj);
            var url = AdminApi.add_aws_image.replace(":account_id", $scope.account_id).replace(":name", $scope.name).replace(":instance_id", $scope.instance_id);
            RestService.send_modal_data($scope.obj, url).then(function (result) {
                console.log(result);
                TaskService.processTask(result.data.celery_task.task_id, function (celery_response) {
                    console.log(celery_response);
                    $location.path("/aws/" + $scope.account_id + "/aws-region/" + $scope.name);
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
                    AlertService2.addAlert({ msg: $scope.default_error_msg, severity: 'danger' });
                });
            });
        };

        $scope.cancel = function () {
            $location.path("/aws/" + $scope.account_id + "/aws-region/" + $scope.name);
        };
    }
]);
