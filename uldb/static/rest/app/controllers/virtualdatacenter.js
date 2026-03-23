var app = angular.module('uldb');

// controllers:  mapping to templates
app.controller('VirtualDataCenterController', [
    '$scope',
    'VirtualDataCenter',
    '$http',
    '$location',
    '$modal',
    '$window',
    'VirtualDataCenterService',
    'URLService',
    'BreadCrumbService',
    function ($scope,
              VirtualDataCenter,
              $http,
              $location,
              $modal,
              $window,
              VirtualDataCenterService,
              URLService,
              BreadCrumbService) {

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

        $scope.bread = BreadCrumbService;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Virtual Data Center", url: '#/virtualdatacenter/' }, $scope);
            window.orgfrom = "";
        });

        $scope.model = VirtualDataCenterService.model;

        $scope.current_system = {
            data: null
        };

        $scope.current_customer = {
            data: null
        };


        $scope.ShowVDCDetails = function (id) {
            $location.path("/virtualdatacenter/" + id);
        };

        /*** Show customer details view ***/

        $scope.ShowCustomerDetails = function (customerid) {
            $location.path("/org/" + customerid);
        };


        $scope.AddVDC = function () {
            $location.path("/vdc_add/");
        };

        $scope.EditVDC = function (vdc) {
            var urlmodel = URLService.model;
            var seturl = URLService.GetSetURL(vdc.url);
            $location.path("/vdc_edit/");
        };

        $scope.selectAllRows = function (event) {

            $('.action-select').prop('checked', event.target.checked);
            $('.action-select').closest('tr').toggleClass('highlight', event.target.checked);
        };

        $scope.selectCurrentRow = function (event) {
            $(event.target).fadeIn('fast');
            $(event.target).closest('tr').toggleClass('highlight', event.target.checked);
        };

        $scope.DeleteVDC = function (size) {

            var chkArray = [];
            var vdcarray = [];

            $(".action-select:checked").each(function () {

                chkArray.push($(this).val());
                vdcarray.push($(this).attr("data"));
            });

            var modalInstance = $modal.open({
                templateUrl: '/static/rest/app/templates/modal/DeleteAlertModal.html',
                controller: 'VDCDeleteAlertModalCtrl',
                scope: $scope,
                size: size
            });
            modalInstance.result.then();

            if (chkArray.length >= 1) {
                window.VDCdellist = JSON.stringify(chkArray);
                window.VDClist = JSON.stringify(vdcarray);
                $scope.alertMsg = "Do you want to delete the selected Virtual Data Center(s) ?";
                $scope.showDelete = true;
                $scope.showCancel = true;
                $scope.showOK = false;
            }
            else {
                $scope.alertMsg = "Select atleast one Virtual Data Center to delete...!";
                $scope.showDelete = false;
                $scope.showCancel = false;
                $scope.showOK = true;
            }

        };

        ($scope.pageChanged = VirtualDataCenterService.loadPage($scope.model))();
    }
]);

app.controller('VDCDeleteAlertModalCtrl', [
    '$scope',
    '$http',
    'VirtualDataCenter',
    '$uibModalInstance',
    '$location',
    '$window',
    function ($scope, $http, VirtualDataCenter, $uibModalInstance, $location, $window) {

        $scope.ConfirmDelete = function () {

            if (window.VDCdellist) {

                var dellist = JSON.parse(window.VDCdellist);

                window.VDCdellist = "";
                window.VDCdelStatus = "";

                var delsyslist = JSON.parse(window.VDClist);

                for (var j = 0; j <= delsyslist.length - 1; j++) {
                    window.VDCdelStatus = window.VDCdelStatus + " Virtual Data Center " + delsyslist[j] + " deleted";
                }

                for (var i = 0; i <= dellist.length - 1; i++) {

                    $http.delete(dellist[i]).success(function (data, status, headers) {

                        $uibModalInstance.close();
                        $location.path("/virtualdatacenter/").search({ param: window.VDCdelStatus });
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
app.factory('VirtualDataCenterService', [
    '$http',
    'VirtualDataCenter',
    'PaginatedResultsModel',
    function ($http, VirtualDataCenter, PaginatedResultsModel) {

        var pages = {};
        var count = 0;
        var currentPage = 1;

        var model = new PaginatedResultsModel(count, currentPage);

        var loadPage = function (model) {

            return function () {

                currentPage = model.currentPage;
                if (currentPage in pages && window.locationModified) {
                    model.results = pages[currentPage];
                } else {
                    VirtualDataCenter.query({ page: currentPage }).$promise.then(function (response) {
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

        return {
            model: model,
            loadPage: loadPage,
            currentPage: currentPage
        };
    }
]);

// simple factory for producing the model to hold results
app.factory('PaginatedResultsModel', function () {

    return function (count, page) {

        this.results = [];
        this.count = 0;
        this.currentPage = page;
        this.currentServer = {
            data: null
        };
    };
});



