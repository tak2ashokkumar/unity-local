var app = angular.module('uldb');
app.controller('ServiceCataloguesController', [
    '$scope',
    'ULDBService2',
    '$uibModal',
    '$http',
    'AlertService2',
    'AbstractControllerFactory2',
    '$window',
    '$httpParamSerializer',
    function ($scope, ULDBService2, $uibModal, $http, AlertService2, AbstractControllerFactory2, $window, $httpParamSerializer) {

        $scope.model = {};
        $scope.modal_obj = {};
        $scope.model.results = [];
        $scope.loader = false;

        $scope.selection = {
            selected: null,
            index: null
        };

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.service_catalogue());

        var url = '/rest/service_catalogue/';
        $http.get(url).then(function (response) {
            console.log(response);
            $scope.loader = false;
            $scope.model.results = response.data.results;
        }).catch(function (error) {
            console.log(error);
            $scope.loader = false;
            $scope.model = {};
            $scope.model.results = [];
        });

        var modalInstance = null;
        var showmodel = function (templete, controllername) {

            if (modalInstance !== null) {
                modalInstance.dismiss('cancel');
            }
            $scope.loader = false;
            modalInstance = $uibModal.open({
                templateUrl: templete,
                controller: controllername,
                scope: $scope
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                // console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.cancel = function () {
            modalInstance.dismiss('cancel');
        };

        $scope.getTermDetails = function (index, catalogue) {
            $scope.modal_obj = {};
            var url = '/rest/service_term/?catalogue_id=' + catalogue.id;
            console.log("Get term details");
            $http.get(url).then(function (response) {
                console.log(response);
                $scope.showTermModal(index, catalogue, response.data.results);
            }).catch(function (error) {
                console.log(error);
                $scope.showTermModal(index, catalogue);
            });
        };

        $scope.showTermModal = function (index, catalogue, terms) {
            $scope.modal_obj.index = index;
            $scope.modal_obj.catalogue = catalogue;

            if (terms) {
                $scope.modal_obj.method = 'Edit';
                $scope.modal_obj.first_term = terms[0]['term'];
                $scope.modal_obj.first_term_price = Number(terms[0]['charge']);
                $scope.modal_obj.second_term = terms[1]['term'];
                $scope.modal_obj.second_term_price = Number(terms[1]['charge']);
                $scope.modal_obj.third_term = terms[2]['term'];
                $scope.modal_obj.third_term_price = Number(terms[2]['charge']);
            }
            else {
                $scope.modal_obj.method = 'Add';
            }
            showmodel('addTerm.html');
        };

        $scope.addTerm = function () {
            console.log("Add Term submit method called.:", angular.toJson($scope.modal_obj));
            $http.post('/rest/service_term/', $scope.modal_obj)
            .success(function (response) {
                var msg = "Terms updated successfully.";
                AlertService2.success(msg);
            })
            .error(function (error, status) {
                var msg = "Failed while downloading VM image";
                AlertService2.danger(msg);
            });
            $scope.cancel();
        };
    }
]);