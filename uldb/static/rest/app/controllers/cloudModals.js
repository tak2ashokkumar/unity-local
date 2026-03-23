/**
 * Created by rt on 2/2/17.
 */
var app = angular.module('uldb');

app.controller('SimpleModalController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    'AlertService2',
    'config',
    function ($scope, $uibModalInstance, $http, AlertService2, config) {
        $scope.obj = {};
        $scope.fields = config.fields;
        $scope.title = config.title;
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.approve = function (obj) {
            $http.post(config.endpoint, obj)
                .then(function (response) {
                    config.successFunc(response);
                    $uibModalInstance.close();
                })
                .catch(function (error) {
                    AlertService2.danger(error);
                });
        };
    }
]);

app.controller('VmwarePickerController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    'AlertService2',
    'TaskService2',
    'request_uri',
    function ($scope, $uibModalInstance, $http, AlertService2, TaskService2, request_uri) {
        // array left for future expansion
        $http.get(request_uri[0]).then(function (response) {
            $scope.loaded = false;
            TaskService2.processTask(response.data.task_id).then(function (result) {
                $scope.loaded = true;
                $scope.choices = result;
            });
        }).catch(function (error) {
            AlertService2.danger(error);
        });
        $scope.choice = null;

        $scope.choice_format = function (choice) {
            return choice[$scope.nameField] + ' (' + choice.moid + ')';
        };


        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.linkChoice = function (obj, choice) {
            $http.post(obj.url + 'link_vmware/', choice).then(function (response) {
                $scope.selectedUnityObject = response.data;
                AlertService2.success('Linked.');
            }).catch(function (error) {
                AlertService2.danger(error);
            });
            $uibModalInstance.close();
        };
    }
]);


app.controller('AddPrivateCloudItemModalController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    'AlertService2',
    function ($scope, $uibModalInstance, $http, AlertService2) {
        // probably a repeat of the generic modal
        // expects $scope.resourceClass to be set

        $scope.create = function (obj) {
            var o = angular.copy(obj);
            o[$scope.item_type] = [o[$scope.item_type]];
            $http.post(
                '/rest/v3.1/private_cloud/' + $scope.cloud.uuid + '/add_items/',
                o)
                .then(function (response) {
                    $uibModalInstance.close(response.data);
                }).catch(function (error) {
                AlertService2.danger(error.data);
                $uibModalInstance.cancel();
            });

        };

        $scope.update = function (obj) {
            // obj: a Resource object in JSON
            var resource = $scope.resourceClass;
            resource.update(obj).$promise.then(function (response) {
                angular.extend($scope.original, response);
                $uibModalInstance.close();
            }).catch(function (error) {
                AlertService2.danger(error);
                $scope.cancel();
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);

app.controller('AddPrivateCloudUpstreamModalController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    'AlertService2',
    function ($scope, $uibModalInstance, $http, AlertService2) {
        $scope.addPort = function (cloud, port) {
            $http.post('/rest/v3.1/private_cloud/'
                + $scope.cloud.uuid
                + '/add_port/', port)
                .then(function (response) {
                    console.log(response);
                    angular.extend($scope.cloud, response.data);
                    $uibModalInstance.close();
                }).catch(function (error) {
                AlertService2.danger(error);
                $uibModalInstance.close();
            });
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);


app.controller('AddManagementIpAddressModalController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    'AlertService2',
    'config',
    function ($scope, $uibModalInstance, $http, AlertService2, config) {
        $scope.obj = {};
        $http.get(config.endpoint+"/?cloud_id="+config.cloud_id).then(function (response) {
                $scope.obj = JSON.parse(JSON.stringify(response.data));
        });
        $scope.fields = config.fields;
        $scope.title = config.title;

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.approve = function (obj) {
            obj = $scope.purge(obj);
            $http.put(config.endpoint + '/associate_mgmt_ip/'+"?cloud_id="+config.cloud_id, obj)
            .then(function (response) {
                $uibModalInstance.close();
                $scope.get_cloud_vms();
                config.successFunc(response);
            })
            .catch(function (error) {
                // AlertService2.danger(error);
                $scope.attach_msg(obj, error);
            });
        };

        $scope.attach_msg = function(obj, error){
            // Attaches Error msg to obj to display validation error
            if (error.hasOwnProperty('data') && typeof error.data !== 'string')
            angular.forEach(error.data, function (value, key) {
                obj[key + "Msg"] = value[0];
            });
            return obj;
        };

        $scope.purge = function(obj){
            // Avoids posting of error msg
            if(!angular.equals({}, obj))
            angular.forEach(obj, function (value, key) {
                if(key.indexOf('Msg') != -1)
                delete obj[key];
            });
            return obj;
        };
    }
]);
