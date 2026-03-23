/**
 * Created by sd on 11/3/16.
 */

var app = angular.module('uldb');
app.controller('OpenStackInstanceController', [
    '$scope',
    '$http',
    'OpenStackInstance',
    'OpenStackController',
    'AbstractControllerFactory2',
    'AlertService2',
    'ULDBService2',
    'TaskService2',
    function (
        $scope,
        $http,
        OpenStackInstance,
        OpenStackController,
        AbstractControllerFactory2,
        AlertService2,
        ULDBService2,
        TaskService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.openStackInstance());
        $scope.fields = ULDBService2.openStackInstance().fields();

        $scope.updateInstances = function () {
            $http.post('/rest/v3/openstack/controller/1/update_instances/').then(function (response) {
                TaskService2.processTask(response.data.task_id, 100).then(function (success) {
                    AlertService2.success('Successfully refreshed instances');
                    $scope.reloadPage();
                }).catch(function (error) {
                    console.log(error);
                    AlertService2.danger('Failed to refresh instances');
                });
            }).catch(function (error) {
                AlertService2.danger('Failed to refresh instances');
            });
        };
    }
]);
