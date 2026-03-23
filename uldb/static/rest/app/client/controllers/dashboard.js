/**
 * Created by rt on 2/29/16.
 */
var app = angular.module('uldb');

app.controller('DashboardMonitoredHostController', [
    '$scope',
    '$http',
    '$interval',
    'CustomerHostMonitor',
    'AbstractControllerFactory',
    'TaskService2',
    'AlertService2',
    function ($scope, $http, $interval, CustomerHostMonitor,
              AbstractControllerFactory, TaskService2, AlertService2) {
        $scope.resourceClass = CustomerHostMonitor;

        $scope.title = {
            plural: "Monitored Hosts",
            singular: "Monitored Host"
        };
        $scope.pageSize = 9000;
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "instance");
        $scope.rows = [
            {
                name: "instance", description: "Instance", required: true,
                opaque: true,
                read: function (e) {
                    return e.instance.hostname;
                }
            },
        ];

        $scope.scan = function (selected, index) {
            $http.get(selected.url + 'scan/').then(function (response) {
                // task is contained in key 'task_id' from data
                TaskService2.processTask(response.data.task_id).then(function (success) {
                    // update the view
                    selected.state = success[0] == 0 ? 'OK' : 'CRITICAL';
                    selected.state_description = success[1];
                    //AlertService2.success("scan: " + success);
                }).catch(function (error) {
                    //console.log(error);
                    AlertService2.danger(error);
                });
            }).catch(function (error) {
                // error invoking task
                console.log(error);
            });
        };

        var timers = [];

        $scope.p.then(function () {
            $scope.model.results.forEach(function (e, i, arr) {
           //    $scope.scan(e, i);
                // No
                //timers.push(
                //    $interval(function () {
                //        $scope.scan(e, i);
                //    }, 60000)
                //);
            });
        });

        $scope.$on('$destroy', function () {
            timers.forEach(function (timer, i, arr) {
                $interval.cancel(timer);
            });
        });
    }
]);
