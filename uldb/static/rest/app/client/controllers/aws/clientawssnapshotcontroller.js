var app = angular.module('uldb');
app.controller('CustomerAwsSnapshotController', [
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
    function (
        $scope,
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
            $scope.account_id = $routeParams.account_id;
            $scope.name = $routeParams.name;
            $scope.snapshot_id = $routeParams.snapshotid;

            $scope.copy_snapshot = function() {
                if ($scope.obj.description && $scope.obj.source_region) {
                var url = AdminApi.copy_snapshot.replace(":account_id", $scope.account_id).replace(":name", $scope.name).replace(":snapshot_id", $scope.snapshot_id);
                RestService.send_modal_data($scope.obj,url).then(function (result) {
                    TaskService.processTask(result.data.celery_task.task_id, function (celery_response) {
                    if (celery_response.status == 200){
                        AlertService2.addAlert({msg: "Image Copied Sucessfully", severity: 'success'});
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({msg: $scope.default_error_msg, severity: 'danger'});
                    });
                    });
                $location.path("/aws/"+$scope.account_id+"/aws-region/"+$scope.name);
                } else {
                         AlertService2.addAlert({msg: "Please fill in all the fields", severity: 'Danger'});
                }
            };
            $scope.cancel = function() {
                $location.path("/aws/"+$scope.account_id+"/aws-region/"+$scope.name);
            };
    }
]);
