var app = angular.module('uldb');

app.factory('IPAllocControllerFactory', [
    '$uibModal',
    'AlertService2',
    function ($uibModal, AlertService2) {
        return function (resourceService, $scope) {
            //var modalInstance;
            var add = function () {
                $scope.obj = {};
                $scope.method = 'create';
                var modalInstance = $uibModal.open($scope.modal);
                modalInstance.result.then();
            };

            var edit = function () {
                $scope.obj = JSON.parse(JSON.stringify($scope.selection.selected));
                $scope.method = 'edit';
                var modalInstance = $uibModal.open($scope.modal);
                modalInstance.result.then();
            };

            var remove = function (selection, idx) {
                var block_id = selection.id;
                resourceService.delete(block_id).then(function (response) {
                    // remove from model list
                    $scope.model.results.splice(idx, 1);
                    AlertService2.success(
                        'Deleted ' + $scope.selection.selected.prefix
                        + '/' + $scope.selection.selected.prefixlen
                    );
                    $scope.selection.selected = null;
                }).catch(function (error) {
                    var retval = error;
                    if ("detail" in error) {
                        retval = error.detail;
                    } else if ("detail" in error.data) {
                        retval = error.data.detail;
                    }
                    AlertService2.danger(retval);
                });
            };

            return {
                add: add,
                edit: edit,
                remove: remove
            };
        };
    }
]);

app.factory('IPModalFactory', [
    'AlertService2',
    function(AlertService2) {
        return function (resourceService, $scope, $uibModalInstance) {
            var add = function (obj) {
                resourceService.create(obj).then(function (response) {
                    // push response directly from DRF
                    $scope.model.results.push(response);
                    AlertService2.success("Added " + response.arin_handle);
                }).catch(function (error) {
                    var retval = error;
                    if ("detail" in error) {
                        retval = error.detail;
                    } else if ("detail" in error.data) {
                        retval = error.data.detail;
                    }
                    AlertService2.danger(retval);
                });
                $uibModalInstance.close();
            };
            var edit = function (obj, idx) {
                resourceService.update(obj).$promise.then(function (response) {
                    $scope.model.results.splice(idx, 1, response);
                    AlertService2.success("Edited " + response.arin_handle);
                }).catch(function (error) {
                    var retval = error;
                    if ("detail" in error) {
                        retval = error.detail;
                    } else if ("data" in error && "detail" in error.data) {
                        retval = error.data.detail;
                    }
                    AlertService2.danger(retval);
                });
                $uibModalInstance.close();
            };
            var cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
            return {
                add: add,
                edit: edit,
                cancel: cancel
            };
        };
    }
]);
