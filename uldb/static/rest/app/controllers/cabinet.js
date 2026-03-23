/**
 * Created by rt on 10/6/15.
 */
var app = angular.module('uldb');

// controllers:  mapping to templates
app.controller('CabinetsController', [
    '$scope',
    'Cabinet',
    '$http',
    '$location',
    'CabinetService',
    '$modal',
    '$window',
    'URLService',
    function ($scope, Cabinet, $http, $location, CabinetService, $modal, $window, URLService) {

        if ($location.$$search.param) {

            var alertmsg = $location.$$search.param;
            $location.search({});
            $scope.alertMsg = alertmsg;
            $scope.message = true;
            window.locationModified = false;
        }

        $scope.closeAlert = function () {
            $scope.message = false;
        };

        $scope.model = CabinetService.model;

        /*** Show customer details view ***/
        $scope.current_customer = {
            data: null
        };

        $scope.ShowCustomerDetails = function (customerid) {
            $location.path("/org/" + customerid);
        };

        /*** close customer details view ***/

        $scope.ClosedetailsView = function () {
            $("#detailsview").fadeOut(300);
            $("#custdetailsview").fadeOut(300);
        };

        $scope.AddCabinet = function (cabinet) {
            $location.path("/cabinet_add/");
        };

        $scope.EditCabinet = function (cabinet) {
            var urlmodel = URLService.model;
            var seturl = URLService.GetSetURL(cabinet.url);
            $location.path("/cabinet_edit/");
        };

        $scope.selectAllRows = function (event) {

            $('.action-select').prop('checked', event.target.checked);
            $('.action-select').closest('tr').toggleClass('highlight', event.target.checked);
        };

        $scope.selectCurrentRow = function (event) {
            $(event.target).fadeIn('fast');
            $(event.target).closest('tr').toggleClass('highlight', event.target.checked);
        };

        $scope.Deletecabinet = function (size) {
            var chkArray = [];
            var cabArray = [];

            $(".action-select:checked").each(function () {
                chkArray.push($(this).val());
                cabArray.push($(this).attr("data"));
            });

            var modalInstance = $modal.open({
                templateUrl: '/static/rest/app/templates/modal/DeleteAlertModal.html',
                controller: 'DeleteCabAlertModalCtrl',
                scope: $scope,
                size: size
            });
            modalInstance.result.then();

            if (chkArray.length >= 1) {
                window.dellist = JSON.stringify(chkArray);
                window.cablist = JSON.stringify(cabArray);
                $scope.alertMsg = "Do you want to delete the selected Cabinets(s) ? ";
                $scope.showDelete = true;
                $scope.showCancel = true;
                $scope.showOK = false;
            }
            else {
                $scope.alertMsg = "Select atleast one Cabinet to delete...!";
                $scope.showDelete = false;
                $scope.showCancel = false;
                $scope.showOK = true;
            }

        };

        ($scope.pageChanged = CabinetService.loadPage($scope.model))();
    }
]);

app.controller('DeleteCabAlertModalCtrl', [
    '$scope',
    '$http',
    'Cabinet',
    '$uibModalInstance',
    '$location',
    function ($scope, $http, Cabinet, $uibModalInstance, $location) {
        $scope.ConfirmDelete = function () {

            if (window.dellist) {
                var dellist = JSON.parse(window.dellist);

                window.dellist = "";

                window.delStatus = "";

                var delcablist = JSON.parse(window.cablist);

                for (var j = 0; j <= delcablist.length - 1; j++) {
                    window.delStatus = window.delStatus + " Cabinet " + delcablist[j] + " deleted successfully";
                }

                for (var i = 0; i <= dellist.length - 1; i++) {

                    $http.delete(dellist[i]).success(function (data, status, headers) {


                        $uibModalInstance.close();
                        $location.path("/cabinet/").search({ param: window.delStatus });

                    });


                }
            }
        };

        $scope.cancel = function () {
            $uibModalInstance.close();
        };
    }
]);

// services/factory -> state control
app.factory('CabinetService', [
    '$http',
    'Cabinet',
    'PaginatedCabinetModel',
    function ($http, Cabinet, PaginatedCabinetModel) {

        var pages = {};
        var count = 0;
        var currentPage = 1;
        var model = new PaginatedCabinetModel(count, currentPage);

        var loadPage = function (model) {
            return function () {

                currentPage = model.currentPage;
                if (currentPage in pages && window.locationModified) {
                    model.results = pages[currentPage];
                } else {
                    Cabinet.query({ page: currentPage }).$promise.then(function (response) {
                        if (model.count == 0) {
                            model.count = response.count;
                        }
                        pages[currentPage] = response.results;
                        model.results = response.results;
                        window.locationModified = true;
                    });
                }
            };
        };

        var selectCustomer = function (current_customer) {
            return function (cab) {
                $http.get(cab.url + "get_customer_details/").then(function (result) {

                    if (result.data.customer) {
                        current_customer.data = result.data;

                        var detailsview = angular.element(document.querySelector('#custdetailsview'));
                        detailsview.removeClass('details').addClass('details_shrink');
                        $("#custdetailsview").fadeOut(300);
                        $("#custdetailsview").fadeIn(300);
                    }
                    else {
                        $("#custdetailsview").fadeOut(300);
                    }
                });
            };
        };


        return {
            model: model,
            loadPage: loadPage,
            currentPage: currentPage,
            selectCustomer: selectCustomer
        };
    }
]);

// simple factory for producing the model to hold results
app.factory('PaginatedCabinetModel', function () {
    return function (count, page) {
        this.results = [];
        this.count = 0;
        this.currentPage = page;
    };
});


