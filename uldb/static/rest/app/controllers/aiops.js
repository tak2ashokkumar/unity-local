var app = angular.module('uldb');
app.controller('AIOPSSourceController', [
    '$scope',
    '$http',
    '$uibModal',
    function ($scope, $http, $uibModal) {
        var modalInstance;
        $scope.sources = [];
        $scope.customer_sources = [];
        $scope.customers = [];
        $scope.isCustomersLoaded = false;

        $scope.obj = {};

        $scope.get_customers = function () {
            $scope.isCustomersLoaded = false;
            $http.get(`/rest/org/`).then(function (response) {
                $scope.customers = response.data ? response.data.results : [];
                if ($scope.customers.length) {
                    for (var i = 0; i < $scope.sources.length; i++) {
                        for (var k = 0; k < $scope.sources[i].customers_linked.length; k++) {
                            var customerName = $scope.getCustomerNameById($scope.sources[i].customers_linked[k].customer);
                            if (customerName) {
                                $scope.sources[i].customers_linked[k].name = customerName;
                            }
                        }
                    }
                }
                $scope.isCustomersLoaded = true;
            });
        };
        $scope.get_customers();

        $scope.getCustomerNameById = function (orgId) {
            for (var i = 0; i < $scope.customers.length; i++) {
                if ($scope.customers[i].id == orgId) {
                    return $scope.customers[i].name;
                }
            }
            return null;
        }

        $scope.get_customer_sources = function () {
            $http.get(`/rest/aiops/event-source/`).then(function (response) {
                $scope.customer_sources = response.data ? response.data.results : [];
                for (var k = 0; k < $scope.customer_sources.length; k++) {
                    for (var i = 0; i < $scope.sources.length; i++) {
                        if ($scope.customer_sources[k].source.id == $scope.sources[i].id) {
                            var obj = $scope.customer_sources[k];
                            var customerName = $scope.getCustomerNameById($scope.customer_sources[k].customer);
                            if (customerName) {
                                obj.name = customerName;
                            }
                            $scope.sources[i].customers_linked.push($scope.customer_sources[k]);
                        }
                    }
                }
            });
        };
        $scope.get_sources = function () {
            $http.get(`/rest/monitoring-tool/`).then(function (response) {
                $scope.sources = response.data ? response.data.results : [];
                for (var i = 0; i < $scope.sources.length; i++) {
                    $scope.sources[i].customers_linked = [];
                }
                if ($scope.sources.length) {
                    $scope.get_customer_sources();
                }
            });
        };
        $scope.get_sources();

        // customer mapping
        $scope.addMapping = function (source) {
            console.log('source : ', source);
            $scope.method = 'Add';
            var temp = {
                "source": { "id": source.id },
                "categorizing_field": null,
                "type_identifying_field": null
            }
            $scope.obj = Object.assign({}, temp);
            modalInstance = $uibModal.open({
                templateUrl: 'customerSourceMapping.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.editMapping = function (source, customerMapping) {
            $scope.method = 'Edit';
            var temp = {
                "source": { "id": source.id },
                "categorizing_field": null,
                "type_identifying_field": null
            }
            $scope.obj = Object.assign({}, customerMapping);
            console.log('$scope.obj : ', $scope.obj);
            modalInstance = $uibModal.open({
                templateUrl: 'customerSourceMapping.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.onSubmitMapping = function () {
            if ($scope.method == 'Add') {
                $http.post('/rest/aiops/event-source/', $scope.obj).then(function (response) {
                    $scope.get_sources();
                    $scope.cancel();
                });
            } else {
                $http.put('/rest/aiops/event-source/' + $scope.obj.uuid + '/', $scope.obj).then(function (response) {
                    $scope.get_sources();
                    $scope.cancel();
                });
            }
        };

        $scope.deleteMapping = function (source, customerMapping) {
            $scope.obj = Object.assign({}, customerMapping);
            modalInstance = $uibModal.open({
                templateUrl: 'deleteCustomerSourceMapping.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.confirmDeleteMapping = function () {
            $http.delete('/rest/aiops/event-source/' + $scope.obj.uuid + '/').then(function (response) {
                $scope.get_sources();
                $scope.cancel();
            });
        };

        $scope.cancel = function () {
            $scope.obj = {};
            modalInstance.close();
            modalInstance.dismiss();
        };
    }
]);