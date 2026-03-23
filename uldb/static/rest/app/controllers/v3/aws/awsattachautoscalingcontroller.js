var app = angular.module('uldb');
app.controller('AwsAttachAutoscalingGroupController', [
    '$scope',
    '$routeParams',
    '$rootScope',
    '$q',
    '$window',
    '$location',
    'CustomDataService',
    'TaskService',
    'AdminApi',
    'table_headers',
    '$filter',
    'DataFormattingService',
    'RestService',
    'TaskService',
    '$location',
    '$routeParams',
    'AlertService2',
    function ($scope,
              $routeParams,
              $rootScope,
              $q,
              $window,
              $location,
              CustomDataService,
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
        $scope.instance_id = $routeParams.instanceid;
        var url = AdminApi.get_asg_list_data.replace(":account_id", $scope.account_id).replace(":name", $scope.name);
        RestService.get_data(url).then(function (result) {
            if (result.status == 200) {
                $scope.autoscaling_group = result.data.data;
            }
        });
        $scope.attach_autoscaling_group = function () {
            if ($scope.obj.group) {
                var url = AdminApi.attach_autoscaling_group.replace(":account_id", $scope.account_id).replace(":name", $scope.name).replace(":instance_id", $scope.instance_id);
                RestService.send_modal_data($scope.obj, url).then(function (result) {
                    TaskService.processTask(result.data.celery_task.task_id, function (celery_response) {
                        if (celery_response.status == 200) {
                            AlertService2.addAlert({ msg: "Autoscaling attached successfully", severity: 'success' });
                        }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({ msg: $scope.default_error_msg, severity: 'danger' });
                    });
                });
                $location.path("/aws/" + $scope.account_id + "/aws-region/" + $scope.name);
            } else {
                AlertService2.addAlert({ msg: "Please fill in all the fields", severity: 'danger' });
            }
        };
        $scope.cancel = function () {
            $location.path("/aws/" + $scope.account_id + "/aws-region/" + $scope.name);
        };
    }
]);
